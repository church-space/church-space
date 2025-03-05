import React from "react";
import { getCachedPeopleWithEmails } from "@church-space/supabase/queries/cached/people";
import PeopleTable from "@/components/tables/people/table";

export default async function Page() {
  const people = await getCachedPeopleWithEmails();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">People</h1>
      <PeopleTable data={people?.data ?? []} />
    </div>
  );
}
