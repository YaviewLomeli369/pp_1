import { User } from "@shared/schema";

const AUTH_TOKEN_KEY = "auth_token";

export function getAuthToken(): string | null {
  const token = localStorage.getItem("token");
  console.log('🔍 Retrieved auth token:', token ? token.substring(0, 10) + '...' : 'NO TOKEN');
  return token;
}

export function setAuthToken(token: string): void {
  console.log('🔐 Storing auth token:', token.substring(0, 10) + '...');
  localStorage.setItem("token", token);
  // Also store with alternative key for compatibility
  localStorage.setItem("authToken", token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function hasRole(user: User | null, roles: string[]): boolean {
  return user ? roles.includes(user.role) : false;
}

export function requireAuth(): { headers: Record<string, string> } {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}