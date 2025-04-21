import { schedules } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import { automationJob } from "./automation-job";

/** helper: split any array into N‑sized slices */
const chunk = <T>(arr: T[], n: number) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) =>
    arr.slice(i * n, i * n + n),
  );

export const processPendingAutomationRuns = schedules.task({
  id: "process-pending-automation-runs",
  cron: "*/1 * * * *", // every minute
  run: async (_payload, ctx) => {
    const supabase = createClient();

    // 1. pull all queued rows
    const { data: rows, error } = await supabase
      .from("pending_automation_runs")
      .select("id, automation_id, organization_id, person_id")
      .eq("status", "queued");

    if (error) throw error;
    if (!rows?.length) return;

    // 2. fold rows into {org+automation}->{ids,people}
    const groups = new Map<
      string,
      {
        ids: number[];
        automationId: number;
        orgId: string;
        people: string[];
      }
    >();

    for (const r of rows) {
      const key = `${r.organization_id}:${r.automation_id}`;
      const g = groups.get(key) ?? {
        ids: [],
        automationId: r.automation_id,
        orgId: r.organization_id,
        people: [],
      };
      g.ids.push(r.id);
      g.people.push(r.person_id);
      groups.set(key, g);
    }

    // 3. mark them processing so we don't double‑queue
    for (const g of groups.values()) {
      await supabase
        .from("pending_automation_runs")
        .update({
          status: "done",
          updated_at: new Date().toISOString(),
        })
        .in("id", g.ids);
    }

    // 4. batch‑trigger in slices of ≤ 500 groups
    const payloadItems = Array.from(groups.values()).map((g) => ({
      payload: {
        automationId: g.automationId,
        organizationId: g.orgId,
        pcoPersonIds: g.people, // all people for this automation
      },
      options: {
        concurrencyKey: `${g.orgId}:${g.automationId}`, // guarantees 1‑at‑a‑time per automation
      },
    }));

    for (const slice of chunk(payloadItems, 500)) {
      // ONE API call creates up to 500 runs
      await automationJob.batchTrigger(slice);
    }
  },
});
