"use client";

import React, { useState, useEffect } from "react";
import {
  SettingsRowAction,
  SettingsRowDescription,
  SettingsRowTitle,
  SettingsRow,
} from "./settings-settings";
import { Switch } from "@church-space/ui/switch";
import { updateUserPreferencesAction } from "@/actions/update-user-preferences";

export default function EmailNotifications({
  recieveProductUpdates,
  userId,
}: {
  recieveProductUpdates: boolean;
  userId: string;
}) {
  const [isChecked, setIsChecked] = useState(recieveProductUpdates);

  useEffect(() => {
    console.log("isChecked updated:", isChecked);
  }, [isChecked]);

  const handleToggle = async () => {
    const newValue = !isChecked;
    setIsChecked(newValue);

    await updateUserPreferencesAction({
      userId,
      preferences: { productUpdateEmails: newValue },
    });
  };

  return (
    <SettingsRow onClick={handleToggle}>
      <div className="flex flex-col gap-0.5">
        <SettingsRowTitle>Recieve Product Updates</SettingsRowTitle>
        <SettingsRowDescription>
          We&apos;ll send you emails about new features and updates to Church
          Space.
        </SettingsRowDescription>
      </div>
      <SettingsRowAction>
        <Switch checked={isChecked} onCheckedChange={handleToggle} />
      </SettingsRowAction>
    </SettingsRow>
  );
}
