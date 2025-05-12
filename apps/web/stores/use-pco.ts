import { create } from "zustand";

interface PcoState {
  id: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  lastRefreshed: string | null;
}

export const usePco = create<PcoState>()((set) => ({
  id: null,
  accessToken: null,
  refreshToken: null,
  lastRefreshed: null,
}));

export type PcoType = PcoState;
