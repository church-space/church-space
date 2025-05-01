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
  orgFinishedOnboarding: boolean | null;
  setOrgFinishedOnboarding: (finished: boolean) => void;
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
  orgFinishedOnboarding: null,
  setOrgFinishedOnboarding: (finished: boolean) =>
    set({ orgFinishedOnboarding: finished }),
}));

export type UserType = UserState;
