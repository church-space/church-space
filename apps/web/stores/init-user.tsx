"use client";

import { User } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";
import { useUser } from "./use-user";
import Cookies from "js-cookie";

interface UserData {
  id: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export default function InitUser({
  user,
  userData,
  organization_id,
  role,
  org_finished_onboarding,
  preferences,
}: {
  user: User | undefined;
  userData: UserData;
  organization_id: string | null;
  role: string | null;
  org_finished_onboarding: boolean | null;
  preferences: {
    welcomeStepsCompleted: boolean;
    productUpdateEmails: boolean;
  };
}) {
  const initState = useRef(false);

  useEffect(() => {
    if (!initState.current && user) {
      useUser.setState({
        user,
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatarUrl: userData.avatar_url,
        email: userData.email,
        organizationId: organization_id,
        role,
        orgFinishedOnboarding: org_finished_onboarding,
        preferences,
      });

      if (organization_id) {
        Cookies.set("organizationId", organization_id);
      }

      initState.current = true;
    }
  }, [
    user,
    userData,
    organization_id,
    role,
    org_finished_onboarding,
    preferences,
  ]);

  return null;
}
