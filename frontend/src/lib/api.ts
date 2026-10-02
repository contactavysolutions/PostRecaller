import Constants from "expo-constants";
import { Platform } from "react-native";

import { storage } from "@/src/utils/storage";

function getBackendUrl(): string {
  if (process.env.EXPO_PUBLIC_BACKEND_URL && !process.env.EXPO_PUBLIC_BACKEND_URL.includes("localhost")) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }
  if (Platform.OS === "web") {
    return process.env.EXPO_PUBLIC_BACKEND_URL || "https://postrecaller.com";
  }
  // Try deriving local IP from Expo host (works for physical devices via Expo Go)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.developer?.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return `http://${ip}:8000`;
    }
  }
  return "https://postrecaller.com";
}

const backendBase = getBackendUrl();
const BASE = `${backendBase.replace(/\/$/, "")}/api`;
export const TOKEN_KEY = "postrecaller_auth_token";

export type ApiError = { status: number; detail: string };

async function authHeaders(): Promise<Record<string, string>> {
  const token = await storage.secureGet<string | null>(TOKEN_KEY, null);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options: { method?: string; body?: any; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) Object.assign(headers, await authHeaders());

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw { status: res.status, detail } as ApiError;
  }
  return data as T;
}

// ---- Types ----
export type User = {
  id: string;
  email: string;
  plan: string;
  is_admin: boolean;
  ai_used_today: number;
  ai_limit: number;
  created_at?: string;
};

export type Item = {
  id: string;
  user_id: string;
  is_note: boolean;
  original_url?: string;
  title: string;
  summary: string;
  content: string;
  platform: string;
  intent?: string;
  tags: string[];
  author?: string;
  thumbnail_url?: string;
  enrichment_status: string;
  is_public: boolean;
  created_at: string;
};

export type ListResponse = { items: Item[]; next_cursor: string | null; has_more: boolean };

// ---- Auth ----
export const api = {
  register: (email: string, password: string) =>
    request<User>("/auth/register", { method: "POST", body: { email, password }, auth: false }),

  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),

  me: () => request<User>("/auth/me"),

  deleteAccount: () => request<void>("/auth/me", { method: "DELETE" }),

  forgotPassword: (email: string) =>
    request<{ ok: boolean }>("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),

  resetPassword: (email: string, code: string, new_password: string) =>
    request<{ ok: boolean }>("/auth/reset-password", {
      method: "POST",
      body: { email, code, new_password },
      auth: false,
    }),

  // ---- Items ----
  createItem: (url: string) =>
    request<{ duplicate: boolean; item: Item }>("/items", { method: "POST", body: { url } }),

  listItems: (params: { cursor?: string | null; tag?: string; intent?: string; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.cursor) q.set("cursor", params.cursor);
    if (params.tag) q.set("tag", params.tag);
    if (params.intent) q.set("intent", params.intent);
    q.set("limit", String(params.limit ?? 20));
    return request<ListResponse>(`/items?${q.toString()}`);
  },

  getItem: (id: string) => request<Item>(`/items/${id}`),

  updateItem: (id: string, updates: Partial<Pick<Item, "title" | "summary" | "tags" | "intent" | "content">>) =>
    request<Item>(`/items/${id}`, { method: "PATCH", body: updates }),

  deleteItem: (id: string) => request<void>(`/items/${id}`, { method: "DELETE" }),

  retryEnrich: (id: string) => request<Item>(`/items/${id}/enrich`, { method: "POST" }),

  collections: () =>
    request<{ collections: { intent: string; count: number }[] }>("/collections"),

  joinWaitlist: (email: string, source = "web") =>
    request<{ ok: boolean; already: boolean; position: number; count: number }>("/waitlist", {
      method: "POST",
      body: { email, source },
      auth: false,
    }),

  waitlistCount: () => request<{ count: number }>("/waitlist/count", { auth: false }),

  importArchive: async (
    contentOrPayload: string | { content?: string; html?: string; json?: string; filename?: string },
    filename?: string,
    fileBytes?: Uint8Array | Blob
  ) => {
    const headers: Record<string, string> = await authHeaders();
    let body: BodyInit;
    let url = `${BASE}/items/import-archive`;
    if (filename) {
      url += `?filename=${encodeURIComponent(filename)}`;
    }

    if (fileBytes) {
      headers["Content-Type"] = "application/octet-stream";
      body = fileBytes as any;
    } else if (typeof contentOrPayload === "string") {
      headers["Content-Type"] = "text/plain; charset=utf-8";
      body = contentOrPayload;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(contentOrPayload);
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    });
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, detail: data?.detail || "Import failed" };
    }
    return data as {
      status: string;
      platform: string;
      platform_display: string;
      total_found: number;
      unique_valid: number;
      imported: number;
      skipped_duplicate: number;
      ai_enrichment_queued: number;
      source_files?: string[];
    };
  },

  importBookmarks: async (htmlOrJson: string | { html: string }) => {
    return api.importArchive(htmlOrJson, "bookmarks.html");
  },
};
