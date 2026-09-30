import { create } from "zustand";

type VaultState = {
  addSheetOpen: boolean;
  initialUrl: string | null;
  refreshKey: number;
  openAddSheet: (url?: string | null) => void;
  closeAddSheet: () => void;
  triggerRefresh: () => void;
};

export const useVault = create<VaultState>((set) => ({
  addSheetOpen: false,
  initialUrl: null,
  refreshKey: 0,
  openAddSheet: (url?: string | null) =>
    set({ addSheetOpen: true, initialUrl: url || null }),
  closeAddSheet: () => set({ addSheetOpen: false, initialUrl: null }),
  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}));

