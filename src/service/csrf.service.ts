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

  // Start a new fetch.
  // IMPORTANTE: usar `.finally` para LIMPAR a promise tanto em sucesso quanto em
  // falha. Sem isso, uma falha (ex.: backend offline momentâneo durante logout)
  // congela a promise rejeitada para sempre — toda chamada subsequente reusaria
  // a mesma rejeição e o interceptor de request silenciaria o erro, fazendo POSTs
  // saírem sem o header X-CSRF-TOKEN e sendo recusados pelo backend com 403.
  csrfFetchPromise = api
    .get<CsrfTokenResponse>("/auth/csrf")
    .then((response) => {
      const token = response.data;
      cachedCsrfToken = token;
      return token;
    })
    .finally(() => {
      csrfFetchPromise = null;
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
