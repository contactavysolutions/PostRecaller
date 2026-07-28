import { create } from "zustand";

type VaultState = {
  addSheetOpen: boolean;
  refreshKey: number;
  openAddSheet: () => void;
  closeAddSheet: () => void;
  triggerRefresh: () => void;
};

export const useVault = create<VaultState>((set) => ({
  addSheetOpen: false,
  refreshKey: 0,
  openAddSheet: () => set({ addSheetOpen: true }),
  closeAddSheet: () => set({ addSheetOpen: false }),
  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}));
