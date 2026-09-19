/**
 * SKILL SETU — Phase 11 API Client.
 *
 * Thin fetch wrapper for the Phase 11 API routes. Handles:
 *  - credentials (same-origin cookies)
 *  - consistent response envelope ({ data, meta } / { error: { code, message, details } })
 *  - typed responses
 *  - error extraction
 *
 * Only used when `useApiMode()` returns "production". In "demo" mode, the
 * frontend continues to use the Phase 3-10 Zustand stores (localStorage).
 *
 * Master spec §9 (API architecture), §10 (response standard).
 */

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const BASE = ""; // relative — same origin via Caddy gateway

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiClientError("PARSE_ERROR", "Failed to parse API response", res.status);
  }

  if (!res.ok) {
    const err = (json as ApiError)?.error;
    throw new ApiClientError(
      err?.code ?? "UNKNOWN",
      err?.message ?? `HTTP ${res.status}`,
      res.status,
      err?.details,
    );
  }

  return (json as ApiSuccess<T>).data;
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) => request<T>("GET", path, undefined, init),
  post: <T>(path: string, body?: unknown, init?: RequestInit) => request<T>("POST", path, body, init),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) => request<T>("PATCH", path, body, init),
  put: <T>(path: string, body?: unknown, init?: RequestInit) => request<T>("PUT", path, body, init),
  delete: <T>(path: string, init?: RequestInit) => request<T>("DELETE", path, undefined, init),
};

// ─── Typed endpoint wrappers ────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INDUSTRY" | "ACADEMIA" | "INSTITUTION" | "ADMIN";
  avatarColor: string;
}

export const AuthApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ user: AuthUser; expiresAt: string }>("/api/auth/login", { email, password }),
  register: (data: { email: string; password: string; name: string; role: AuthUser["role"] }) =>
    apiClient.post<{ user: AuthUser; expiresAt: string }>("/api/auth/register", data),
  logout: () => apiClient.post<{ ok: boolean }>("/api/auth/logout"),
  me: () => apiClient.get<{ user: AuthUser; profile: unknown }>("/api/auth/me"),
};

export const StudentsApi = {
  get: (id: string) =>
    apiClient.get<{
      student: unknown;
      competencies: unknown[];
      evidence: unknown[];
      evidenceCount: number;
      readiness: { role: string; score: number; weightedSum: number; weightSum: number; matchedSkills: unknown[]; missingSkills: unknown[] };
    }>(`/api/students/${id}`),
};

export const EvidenceApi = {
  create: (data: { studentId: string; skillId: string; type: string; title: string; description?: string; score?: number; provider?: string }) =>
    apiClient.post<{ evidence: unknown }>("/api/evidence", data),
  verify: (id: string, verified: boolean, provider?: string) =>
    apiClient.patch<{ evidence: unknown }>(`/api/evidence/${id}/verify`, { verified, provider }),
};

export const OpportunitiesApi = {
  list: (filters?: { role?: string; skillId?: string }) =>
    apiClient.get<unknown[]>(`/api/opportunities${filters ? `?${new URLSearchParams(filters as Record<string, string>).toString()}` : ""}`),
};

export const FeedbackApi = {
  create: (data: { toStudentId: string; opportunityId?: string; rating: number; comment: string; skillScores?: { skillId: string; score: number }[] }) =>
    apiClient.post<{ feedback: unknown; evidenceCreated: number }>("/api/feedback", data),
};

export const AdminApi = {
  stats: () =>
    apiClient.get<{ users: number; evidence: number; opportunities: number; applications: number; feedback: number; recentAudit: unknown[]; eventTimeline: unknown[] }>("/api/admin/stats"),
  seed: (reset = false) =>
    apiClient.post<{ ok: boolean; message: string }>(`/api/admin/seed${reset ? "?reset=1" : ""}`),
};
