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
    accessorKey: "step",
    header: "Step",
    cell: ({ row }) => {
      const step = row.getValue("step") as string;
      return <div className="font-medium">{step}</div>;
    },
  },
  {
    accessorKey: "person_id",
    header: "Person ID",
    cell: ({ row }) => {
      const personId = row.getValue("person_id") as number;
      return <div>{personId}</div>;
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
