import { storage } from "@/src/utils/storage";

const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;
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
};
