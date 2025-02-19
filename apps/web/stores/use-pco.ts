import { create } from "zustand";
import { User } from "@supabase/supabase-js";

interface PcoState {
  id: string | null;
  accessToken: string | null;
}

export const usePco = create<PcoState>()((set) => ({
  id: null,
  accessToken: null,
}));

export type PcoType = PcoState;
