import { create } from "zustand";
import { User } from "@supabase/supabase-js";

interface UserState {
  user: User | undefined;
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  email: string | null;
  organizationId: string | null;
}

export const useUser = create<UserState>()((set) => ({
  user: undefined,
  id: null,
  firstName: null,
  lastName: null,
  avatarUrl: null,
  email: null,
  organizationId: null,
}));

export type UserType = UserState;
