const KEY = "rs_admin_token";

export function storeToken(token: string): void {
  sessionStorage.setItem(KEY, token);
}

export function getToken(): string | null {
  return sessionStorage.getItem(KEY);
}

export function clearToken(): void {
  sessionStorage.removeItem(KEY);
}
