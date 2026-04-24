export type ThemeClassName = string;

const hasWindow = () => typeof window !== "undefined";
const hasDocument = () => typeof document !== "undefined";

export const readStoredValue = (key: string): string | null => {
  if (!hasWindow()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStoredValue = (key: string, value: string) => {
  if (!hasWindow()) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage pode falhar em navegação privada ou ambiente restrito.
  }
};

export const removeStoredValue = (key: string) => {
  if (!hasWindow()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignora falhas de storage para não quebrar o fluxo de sessão.
  }
};

export const getPreferredTheme = (): "light" | "dark" => {
  if (!hasWindow() || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const getDocumentRoot = () => {
  if (!hasDocument()) {
    return null;
  }

  return document.documentElement;
};

export const applyThemeClass = (theme: string, classesToRemove: ThemeClassName[]) => {
  const root = getDocumentRoot();

  if (!root) {
    return;
  }

  root.classList.remove(...classesToRemove);
  root.classList.add(theme);
};

export const getCurrentLocationHref = () => {
  if (!hasWindow()) {
    return "";
  }

  return window.location.href;
};

export const redirectBrowserTo = (url: string) => {
  if (!hasWindow()) {
    return;
  }

  if (window.navigator?.userAgent.includes("jsdom")) {
    return;
  }

  window.location.assign(url);
};
