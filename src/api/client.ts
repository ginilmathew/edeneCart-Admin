/**
 * API client. Dev: Vite proxy when base is empty. Prod: Railway unless VITE_API_BASE_URL is set.
 * JWT is sent automatically when present (see auth-token).
 *
 * Pass `{ silent: true }` on a request to skip the global API loading overlay (e.g. auth /me refresh).
 */

import { getAccessToken } from "../lib/auth-token";
import { notifyApiLoading } from "./api-loading";
import { getApiBaseUrl } from "./api-base-url";
import { extractMessageFromResponseBody } from "../lib/api-error";

const BASE_URL = getApiBaseUrl();

export type ApiRequestInit = RequestInit & { silent?: boolean };

async function request<T>(path: string, options: ApiRequestInit = {}): Promise<T> {
  const { silent, ...fetchInit } = options;
  const track = !silent;
  if (track) notifyApiLoading(1);

  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchInit.headers as Record<string, string> | undefined),
  };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      ...fetchInit,
      headers,
    });

    const text = await res.text();
    if (!res.ok) {
      let message = res.statusText || "Request failed";
      if (text) {
        try {
          const body = JSON.parse(text) as unknown;
          const extracted = extractMessageFromResponseBody(body);
          if (extracted) message = extracted;
        } catch {
          const t = text.trim();
          if (t) message = t.length > 800 ? `${t.slice(0, 800)}…` : t;
        }
      }
      const err = new Error(message);
      (err as Error & { status?: number }).status = res.status;
      throw err;
    }
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  } finally {
    if (track) notifyApiLoading(-1);
  }
}

export const api = {
  get: <T>(path: string, init?: Omit<ApiRequestInit, "method" | "body">) =>
    request<T>(path, { method: "GET", ...init }),
  post: <T>(path: string, body: unknown, init?: Omit<ApiRequestInit, "method" | "body">) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), ...init }),
  put: <T>(path: string, body: unknown, init?: Omit<ApiRequestInit, "method" | "body">) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body), ...init }),
  patch: <T>(path: string, body: unknown, init?: Omit<ApiRequestInit, "method" | "body">) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), ...init }),
  delete: (path: string, init?: Omit<ApiRequestInit, "method" | "body">) =>
    request<void>(path, { method: "DELETE", ...init }),
};
