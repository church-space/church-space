"use client";

import { Badge } from "@church-space/ui/badge";
import { Checkbox } from "@church-space/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

// Define the type based on the SQL schema
export type EmailAutomationMember = {
  id: number;
  created_at: string;
  last_completed_step_id: number;
  automation_id: number;
  person_id: number;
  updated_at: string;
  status: string;
  reason: string | null;
  trigger_dev_id: string | null;
  person: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    nickname: string | null;
    pco_id: string;
  } | null;
  step: {
    id: number;
    type: string;
    values: any;
    order: number | null;
  } | null;
};

export const columns: ColumnDef<EmailAutomationMember>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const person = row.original.person;
      if (!person) return <div>-</div>;

      const firstName = person.first_name || "";
      const lastName = person.last_name || "";
      const fullName =
        [firstName, lastName].filter(Boolean).join(" ") ||
        person.nickname ||
        "-";

      return <div className="ml-1.5 font-medium">{fullName}</div>;
    },
  },
  {
    accessorKey: "step",
    header: "Last Completed Step",
    cell: ({ row }) => {
      const step = row.original.step;
      const displayOrder = step && step.order !== null ? step.order + 1 : "-";
      return (
        <div className="flex flex-col gap-0">
          <div>Step {displayOrder}</div>
          <div className="text-xs text-muted-foreground">
            {step?.type === "send_email"
              ? "Send Email"
              : step?.type === "wait"
                ? "Wait"
                : "-"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "canceled"
              ? "destructive"
              : status === "in-progress"
                ? "warning"
                : "success"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
];
