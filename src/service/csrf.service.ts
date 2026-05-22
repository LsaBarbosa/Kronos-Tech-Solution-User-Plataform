import { api } from "@/config/api";

export interface CsrfTokenResponse {
  headerName: string;
  parameterName: string;
  token: string;
}

let cachedCsrfToken: CsrfTokenResponse | null = null;
let csrfFetchPromise: Promise<CsrfTokenResponse> | null = null;

/**
 * Fetches the CSRF token from the backend.
 * Uses caching to avoid redundant calls.
 * If a fetch is already in progress, returns the same promise.
 */
export const fetchCsrfToken = async (): Promise<CsrfTokenResponse> => {
  // If we have a cached token, return it
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }

  // If a fetch is already in progress, wait for it
  if (csrfFetchPromise) {
    return csrfFetchPromise;
  }

  // Start a new fetch
  csrfFetchPromise = api.get<CsrfTokenResponse>("/auth/csrf").then((response) => {
    const token = response.data;
    cachedCsrfToken = token;
    csrfFetchPromise = null;
    return token;
  });

  return csrfFetchPromise;
};

/**
 * Invalidates the cached CSRF token.
 * Should be called when a 403 CSRF error occurs.
 */
export const invalidateCsrfToken = (): void => {
  cachedCsrfToken = null;
};

/**
 * Gets the cached CSRF token without fetching if not available.
 */
export const getCachedCsrfToken = (): CsrfTokenResponse | null => {
  return cachedCsrfToken;
};

/**
 * Pre-fetches and caches the CSRF token to avoid first-request failures.
 * Should be called during app initialization or before performing state-changing operations.
 * Returns a promise that resolves when the token is available or fetch fails.
 */
export const preloadCsrfToken = async (): Promise<void> => {
  try {
    await fetchCsrfToken();
  } catch (error) {
    // Silently fail - the token will be fetched on demand if needed
    console.warn("CSRF token preload failed (will retry on demand):", error);
  }
};
