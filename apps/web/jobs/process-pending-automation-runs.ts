import "server-only";
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
  cron: "*/5 * * * *", // every 5 minutes
  run: async (_payload, ctx) => {
    const supabase = createClient();

    // 1. pull all queued rows with pagination to handle more than 1000 records
    let allRows: Array<{
      id: number;
      automation_id: number;
      organization_id: string;
      person_id: string;
    }> = [];
    let page = 0;
    const pageSize = 1000;
    let hasMoreRecords = true;

    while (hasMoreRecords) {
      const {
        data: rows,
        error,
        count,
      } = await supabase
        .from("pending_automation_runs")
        .select("id, automation_id, organization_id, person_id", {
          count: "exact",
        })
        .eq("status", "queued")
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      if (!rows || rows.length === 0) {
        // No more records to fetch
        hasMoreRecords = false;
      } else {
        // Add the current page of results to our collection
        allRows = [...allRows, ...rows];

        // Check if we've reached the end
        if (rows.length < pageSize || (count && allRows.length >= count)) {
          hasMoreRecords = false;
        } else {
          // Move to next page
          page++;
        }
      }
    }

    if (!allRows.length) return;

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

    for (const r of allRows) {
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
      // Process in batches of 50 IDs at a time
      for (const idBatch of chunk(g.ids, 50)) {
        await supabase
          .from("pending_automation_runs")
          .update({
            status: "done",
            updated_at: new Date().toISOString(),
          })
          .in("id", idBatch);
      }
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
