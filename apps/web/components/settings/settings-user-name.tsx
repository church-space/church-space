"use client";

import React, { useState } from "react";
import {
  SettingsRow,
  SettingsRowTitle,
  SettingsRowAction,
} from "./settings-settings";
import { Input } from "@church-space/ui/input";
import { updateUserAction } from "@/actions/update-user";
import { useDebounce } from "@/hooks/use-debounce";

export default function SettingsUserName({
  initialFirstName,
  initialLastName,
  userId,
}: {
  initialFirstName: string;
  initialLastName: string;
  userId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  const debouncedUpdate = useDebounce(
    async (firstName: string, lastName: string) => {
      try {
        setError(null);
        const result = await updateUserAction({
          userId,
          firstName,
          lastName,
        });

        if (!result) {
          setError("Failed to update user: no response received");
          setFirstName(initialFirstName);
          setLastName(initialLastName);
          return;
        }

        const response = result.data;
        if (!response) {
          setError("Failed to update user: no data received");
          setFirstName(initialFirstName);
          setLastName(initialLastName);
          return;
        }

        if (response.success) {
          // Update was successful, no need to do anything
          return;
        }

        setError(response.error || "Failed to update user");
        setFirstName(initialFirstName);
        setLastName(initialLastName);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update user");
        setFirstName(initialFirstName);
        setLastName(initialLastName);
      }
    },
    500,
  );

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFirstName = e.target.value;
    setFirstName(newFirstName);
    debouncedUpdate(newFirstName, lastName);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLastName = e.target.value;
    setLastName(newLastName);
    debouncedUpdate(firstName, newLastName);
  };

  return (
    <>
      <SettingsRow>
        <SettingsRowTitle>First Name</SettingsRowTitle>
        <SettingsRowAction>
          <Input
            value={firstName}
            onChange={handleFirstNameChange}
            placeholder="Enter your first name"
            className="w-full"
          />
        </SettingsRowAction>
      </SettingsRow>
      <SettingsRow>
        <SettingsRowTitle>Last Name</SettingsRowTitle>
        <SettingsRowAction>
          <Input
            value={lastName}
            onChange={handleLastNameChange}
            placeholder="Enter your last name"
            className="w-full"
          />
        </SettingsRowAction>
      </SettingsRow>
      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
    </>
  );
}
