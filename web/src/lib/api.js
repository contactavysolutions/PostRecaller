// Central axios instance + typed API surface. Token stored in localStorage.
import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const API = `${BASE.replace(/\/$/, "")}/api`;

const TOKEN_KEY = "postrecaller.token";

export const auth = {
  get token() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set token(v) {
    try {
      if (v) localStorage.setItem(TOKEN_KEY, v);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
  isSignedIn() {
    return !!auth.token;
  },
};

const client = axios.create({ baseURL: API, timeout: 30_000 });

client.interceptors.request.use((cfg) => {
  const t = auth.token;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Normalize errors to have `.message` from FastAPI's `detail`.
client.interceptors.response.use(
  (r) => r,
  (err) => {
    const detail = err?.response?.data?.detail;
    if (detail && typeof detail === "string") {
      err.message = detail;
    }
    return Promise.reject(err);
  }
);

export const api = {
  // ------- waitlist -------
  joinWaitlist: (email, source = "web") =>
    client.post("/waitlist", { email, source }).then((r) => r.data),
  waitlistCount: () => client.get("/waitlist/count").then((r) => r.data),

  // ------- auth -------
  validateInvite: (token) =>
    client.get("/auth/invite/validate", { params: { token } }).then((r) => r.data),
  register: ({ email, password, invite_token }) =>
    client.post("/auth/register", { email, password, invite_token }).then((r) => r.data),
  login: (email, password) =>
    client.post("/auth/login", { email, password }).then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data),
  forgotPassword: (email) =>
    client.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (email, code, new_password) =>
    client
      .post("/auth/reset-password", { email, code, new_password })
      .then((r) => r.data),

  // ------- admin (used later) -------
  adminListWaitlist: (params = {}) =>
    client.get("/admin/waitlist", { params }).then((r) => r.data),
  adminApproveWaitlist: (id) =>
    client.post(`/admin/waitlist/${id}/approve`).then((r) => r.data),
  adminResendInvite: (id) =>
    client.post(`/admin/waitlist/${id}/resend-invite`).then((r) => r.data),
  adminDeleteWaitlist: (id) =>
    client.delete(`/admin/waitlist/${id}`).then((r) => r.data),

  adminUsers: (params = {}) =>
    client.get("/admin/users", { params }).then((r) => r.data),
  adminSuspendUser: (id) =>
    client.post(`/admin/users/${id}/suspend`).then((r) => r.data),
  adminRestoreUser: (id) =>
    client.post(`/admin/users/${id}/restore`).then((r) => r.data),
  adminSoftDeleteUser: (id) =>
    client.delete(`/admin/users/${id}`).then((r) => r.data),

  adminUsage: (days = 30) =>
    client.get("/admin/usage", { params: { days } }).then((r) => r.data),

  adminItems: (params = {}) =>
    client.get("/admin/items", { params }).then((r) => r.data),
  adminDeleteItem: (id) =>
    client.delete(`/admin/items/${id}`).then((r) => r.data),
  adminReEnrich: (id) =>
    client.post(`/admin/items/${id}/re-enrich`).then((r) => r.data),

  adminHealth: () => client.get("/admin/health").then((r) => r.data),

  // ------- items (Vault) -------
  listItems: (params = {}) =>
    client.get("/items", { params }).then((r) => r.data),
  createItem: (url) => client.post("/items", { url }).then((r) => r.data),
  getItem: (id) => client.get(`/items/${id}`).then((r) => r.data),
  updateItem: (id, patch) => client.patch(`/items/${id}`, patch).then((r) => r.data),
  deleteItem: (id) => client.delete(`/items/${id}`).then((r) => r.data),
  retryEnrich: (id) => client.post(`/items/${id}/enrich`).then((r) => r.data),
  listTags: () => client.get("/tags").then((r) => r.data),
  listCollections: () => client.get("/collections").then((r) => r.data),
};

export const rawClient = client;
