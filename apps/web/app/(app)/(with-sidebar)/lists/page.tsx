"use client";

import React, { useEffect, useState } from "react";
import { usePco } from "@/stores/use-pco";
import { getLists } from "./actions";

export default function Page() {
  const pco = usePco();
  const [lists, setLists] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLists() {
      if (pco.accessToken) {
        const lists = await getLists(pco.accessToken, "96208");
        setLists(lists);
      }
    }
    fetchLists();
  }, [pco.accessToken]);

  return (
    <div className="space-y-4">
      {lists.map((list) => (
        <div key={list.id} className="p-4 border rounded">
          <h3 className="font-bold">
            {list.attributes.name || list.attributes.name_or_description}
          </h3>
          <p>Total People: {list.attributes.total_people}</p>
          <p>
            Last Refreshed:{" "}
            {new Date(list.attributes.refreshed_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
