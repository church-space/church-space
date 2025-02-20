"use client";
import { User } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";
import { useUser } from "./user-user";

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
}: {
  user: User | undefined;
  userData: UserData;
  organization_id: string | null;
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
      });
    }

    initState.current = true;
  }, [user, userData]);

  return null;
}
