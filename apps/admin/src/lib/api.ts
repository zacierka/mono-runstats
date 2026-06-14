import { getToken } from "./token";
import type { AdminSessionInfo, GuildConfig, ApiChannel, ApiRole } from "@/types";

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-admin-token": token } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new ApiError(`API ${res.status}`, res.status);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getSession: () => apiFetch<AdminSessionInfo>("/admin/session"),
  getConfig: () => apiFetch<GuildConfig>("/admin/config"),
  updateConfig: (body: GuildConfig) =>
    apiFetch<GuildConfig>("/admin/config", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getChannels: () => apiFetch<ApiChannel[]>("/admin/channels"),
  getRoles: () => apiFetch<ApiRole[]>("/admin/roles"),
};
