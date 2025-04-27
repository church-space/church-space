"use client";

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
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="opacity-0 transition-opacity group-hover/table-row:opacity-100 data-[state=checked]:opacity-100"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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

      return <div className="font-medium">{fullName}</div>;
    },
  },
  {
    accessorKey: "step",
    header: "Last Completed Step",
    cell: ({ row }) => {
      const step = row.original.step;
      return <div>{step?.type || "-"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <div>{status}</div>;
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
