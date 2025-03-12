"use server";

import { authActionClient } from "../safe-action";
import { createClient } from "@church-space/supabase/server";
import { createEmailTemplate } from "@church-space/supabase/mutations/emails";
import { z } from "zod";
import type { ActionResponse } from "@/types/actions";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";

export const createProjectAction = authActionClient
  .schema(
    z.object({
      name: z.string(),
      description: z.string().nullable(),
      organization_id: z.string(),
      icon: z.object({ icon: z.string(), color: z.string() }).optional(),
      status: z
        .enum([
          "todo",
          "in_progress",
          "completed",
          "backlog",
          "on_hold",
          "canceled",
        ])
        .optional(),
      priority: z
        .enum([
          "no-priority",
          "low-priority",
          "medium-priority",
          "high-priority",
          "urgent",
        ])
        .optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      project_lead: z.string().optional(),
      members: z
        .array(
          z.object({
            person_id: z.string().optional(),
            team_id: z.string().optional(),
          }),
        )
        .optional(),
      personId: z.string(),
    }),
  )
  .metadata({
    name: "create-project",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = createClient();
      const { error, data } = await createProject(
        supabase,
        {
          name: parsedInput.parsedInput.name,
          organization_id: parsedInput.parsedInput.organization_id,
          icon: parsedInput.parsedInput.icon,
          status: parsedInput.parsedInput.status,
          priority: parsedInput.parsedInput.priority,
          start_date: parsedInput.parsedInput.start_date,
          end_date: parsedInput.parsedInput.end_date,
          description: parsedInput.parsedInput.description ?? undefined,
          project_lead: parsedInput.parsedInput.project_lead,
        },
        parsedInput.parsedInput.members,
      );

      if (error) throw error;

      if (data && data.length > 0 && data[0].id) {
        revalidateTag(`person-projects_${parsedInput.parsedInput.personId}`);
        redirect(`/workspace/projects/${data[0].id}`);

        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          error: "Project creation failed: no ID returned.",
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create project",
      };
    }
  });
