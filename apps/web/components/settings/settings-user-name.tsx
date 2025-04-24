"use client";

import React, { useState, useEffect } from "react";
import {
  SettingsRow,
  SettingsRowTitle,
  SettingsRowAction,
} from "./settings-settings";
import { Input } from "@church-space/ui/input";
import { updateUserAction } from "@/actions/update-user";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@church-space/ui/use-toast";

export default function SettingsUserName({
  initialFirstName,
  initialLastName,
  userId,
}: {
  initialFirstName: string;
  initialLastName: string;
  userId: string;
}) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const debouncedFirstName = useDebounce(firstName, 500);
  const debouncedLastName = useDebounce(lastName, 500);

  useEffect(() => {
    if (!isMounted) return;

    // Don't update if the values are the same as initial values
    if (
      debouncedFirstName === initialFirstName &&
      debouncedLastName === initialLastName
    ) {
      return;
    }

    // Validate that neither first name nor last name is blank
    if (!debouncedFirstName.trim()) {
      setFirstNameError("First name cannot be blank");
      return;
    }

    if (!debouncedLastName.trim()) {
      setLastNameError("Last name cannot be blank");
      return;
    }

    const updateUser = async () => {
      try {
        setError(null);
        const result = await updateUserAction({
          userId,
          firstName: debouncedFirstName,
          lastName: debouncedLastName,
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
          toast({
            title: "Profile updated",
            description: "Your name has been updated successfully.",
          });
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
    };

    updateUser();
  }, [
    debouncedFirstName,
    debouncedLastName,
    userId,
    initialFirstName,
    initialLastName,
    isMounted,
    toast,
  ]);

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFirstName = e.target.value;
    setFirstName(newFirstName);
    setFirstNameError(null);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLastName = e.target.value;
    setLastName(newLastName);
    setLastNameError(null);
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
            maxLength={255}
          />
          {firstNameError && (
            <div className="mt-2 text-sm text-red-500">{firstNameError}</div>
          )}
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
            maxLength={255}
          />
          {lastNameError && (
            <div className="mt-2 text-sm text-red-500">{lastNameError}</div>
          )}
        </SettingsRowAction>
      </SettingsRow>
      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
    </>
  );
}
