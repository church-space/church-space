"use client";
import React from "react";

export default function Unsubscribe({
  emailId,
  peopleEmailId,
}: {
  emailId: number;
  peopleEmailId: number;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {emailId} {peopleEmailId}
      </p>
      You have been unsubscribed
    </div>
  );
}
