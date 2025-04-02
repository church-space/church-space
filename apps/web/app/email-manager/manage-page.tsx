"use client";
import { Switch } from "@church-space/ui/switch";
import React from "react";

export default function Manage({
  emailId,
  peopleEmailId,
}: {
  emailId: number;
  peopleEmailId: number;
}) {
  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Manage your email preferences</h1>
      <p className="text-sm text-muted-foreground">
        {emailId} {peopleEmailId}
      </p>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">Email Category</h2>
          <p className="text-sm text-muted-foreground">
            This is an example of an email category
          </p>
        </div>
        <Switch />
      </div>
    </div>
  );
}
