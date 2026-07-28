import { create } from "zustand";

import { api, TOKEN_KEY, User } from "@/src/lib/api";
import { storage } from "@/src/utils/storage";

type AuthState = {
  hydrated: boolean;
  token: string | null;
  user: User | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  hydrated: false,
  token: null,
  user: null,

  hydrate: async () => {
    const token = await storage.secureGet<string | null>(TOKEN_KEY, null);
    if (token) {
      try {
        const user = await api.me();
        set({ token, user, hydrated: true });
        return;
      } catch {
        await storage.secureRemove(TOKEN_KEY);
      }
    }
    set({ token: null, user: null, hydrated: true });
  },

  login: async (email, password) => {
    const res = await api.login(email, password);
    await storage.secureSet(TOKEN_KEY, res.access_token);
    set({ token: res.access_token, user: res.user });
  },

  register: async (email, password) => {
    await api.register(email, password);
    // auto login after registration
    await get().login(email, password);
  },

  logout: async () => {
    await storage.secureRemove(TOKEN_KEY);
    set({ token: null, user: null });
  },

  refreshMe: async () => {
    try {
      const user = await api.me();
      set({ user });
    } catch {
      /* ignore */
    }
  },

  deleteAccount: async () => {
    await api.deleteAccount();
    await storage.secureRemove(TOKEN_KEY);
    set({ token: null, user: null });
  },
}));
