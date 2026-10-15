import { create } from "zustand";

import { api, TOKEN_KEY, User } from "@/src/lib/api";
import { storage } from "@/src/utils/storage";

type AuthState = {
  hydrated: boolean;
  token: string | null;
  user: User | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string, inviteToken?: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const USER_KEY = "postrecaller_cached_user";

export const useAuth = create<AuthState>((set, get) => ({
  hydrated: false,
  token: null,
  user: null,

  hydrate: async () => {
    const token = await storage.secureGet<string | null>(TOKEN_KEY, null);
    if (token) {
      // Instantly hydrate with cached user so the splash screen dismisses in milliseconds
      let cachedUser: User | null = null;
      try {
        const raw = await storage.getItem<string | null>(USER_KEY, null);
        if (raw) cachedUser = JSON.parse(raw) as User;
      } catch {}
      set({ token, user: cachedUser, hydrated: true });

      // Silently refresh profile in background without blocking app startup
      api
        .me()
        .then(async (user) => {
          await storage.setItem(USER_KEY, JSON.stringify(user));
          set({ user });
        })
        .catch(async (err: any) => {
          if (err?.status === 401 || err?.status === 403) {
            await storage.secureRemove(TOKEN_KEY);
            await storage.removeItem(USER_KEY);
            set({ token: null, user: null });
          }
        });
      return;
    }
    set({ token: null, user: null, hydrated: true });
  },

  login: async (email, password) => {
    const res = await api.login(email, password);
    await storage.secureSet(TOKEN_KEY, res.access_token);
    await storage.setItem(USER_KEY, JSON.stringify(res.user));
    set({ token: res.access_token, user: res.user });
  },

  loginWithGoogle: async (idToken, inviteToken) => {
    const res = await api.googleAuth(idToken, inviteToken);
    await storage.secureSet(TOKEN_KEY, res.access_token);
    await storage.setItem(USER_KEY, JSON.stringify(res.user));
    set({ token: res.access_token, user: res.user });
  },

  register: async (email, password) => {
    await api.register(email, password);
    // auto login after registration
    await get().login(email, password);
  },

  logout: async () => {
    await storage.secureRemove(TOKEN_KEY);
    await storage.removeItem(USER_KEY);
    set({ token: null, user: null });
  },

  refreshMe: async () => {
    try {
      const user = await api.me();
      await storage.setItem(USER_KEY, JSON.stringify(user));
      set({ user });
    } catch {
      /* ignore */
    }
  },

  deleteAccount: async () => {
    await api.deleteAccount();
    await storage.secureRemove(TOKEN_KEY);
    await storage.removeItem(USER_KEY);
    set({ token: null, user: null });
  },
}));
