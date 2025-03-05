import React from "react";
import { getCachedPeopleWithEmails } from "@church-space/supabase/queries/cached/people";

export default async function Page() {
  const people = await getCachedPeopleWithEmails();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">People</h1>
      <div className="space-y-4">
        {people?.data?.map((person) => (
          <div key={person.id} className="rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {person.first_name} {person.middle_name} {person.last_name}
                  {person.nickname && (
                    <span className="ml-2 text-gray-500">
                      ({person.nickname})
                    </span>
                  )}
                </h2>
                {person.given_name && (
                  <p className="text-sm text-gray-600">
                    Given name: {person.given_name}
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <p>ID: {person.id}</p>
                <p>PCO ID: {person.pco_id}</p>
              </div>
            </div>
            {person.people_emails && person.people_emails.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">Emails:</p>
                {person.people_emails.map((email: any) => (
                  <p key={email.id} className="ml-2">
                    {email.email}{" "}
                    <span className="text-gray-400">({email.status})</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
