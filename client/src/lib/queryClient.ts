import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Helper function to get the authentication token from local storage
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(url: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  console.log('🔍 Retrieved auth token:', token || 'NO TOKEN');

  const headers: Record<string, string> = {
    ...Object.fromEntries(new Headers(options.headers || {}).entries())
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Added Authorization header with token:', token.substring(0, 10) + '...');
  }

  // Always set content-type for requests with body
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  console.log('Making API request:', {
    url,
    method: config.method || 'GET',
    headers: Object.keys(headers).reduce((acc, key) => {
      acc[key] = key === 'Authorization' ? headers[key].substring(0, 20) + '...' : headers[key];
      return acc;
    }, {} as Record<string, string>),
    bodyType: typeof config.body,
    body: config.body
  });

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ API Request failed: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache for better performance
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: (failureCount, error: any) => {
        // Only retry on network errors, not on 4xx/5xx responses
        if (error?.message?.includes('NetworkError') || error?.message?.includes('fetch')) {
          return failureCount < 2;
        }
        return false;
      },
    },
    mutations: {
      retry: false,
    },
  },
});