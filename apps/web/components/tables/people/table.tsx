"use client";

import DataTable from "../data-table";
import { columns, type Person } from "./columns";

interface PeopleTableProps {
  data: Person[];
}

export default function PeopleTable({ data }: PeopleTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      initialSorting={[{ id: "name", desc: false }]}
    />
  );
}
