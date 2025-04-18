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
  welcomeStepsCompleted: boolean;
  setWelcomeStepsCompleted: (completed: boolean) => void;
  role: string | null;
}

export const useUser = create<UserState>()((set) => ({
  user: undefined,
  id: null,
  firstName: null,
  lastName: null,
  avatarUrl: null,
  email: null,
  organizationId: null,
  welcomeStepsCompleted: false,
  setWelcomeStepsCompleted: (completed: boolean) =>
    set({ welcomeStepsCompleted: completed }),
  role: null,
}));

export type UserType = UserState;
