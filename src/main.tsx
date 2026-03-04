import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandlers } from './lib/observability'

setupGlobalErrorHandlers();

const nativeGetItem = Storage.prototype.getItem;
Storage.prototype.getItem = function (key: string): string | null {
  const value = nativeGetItem.call(this, key);

  if (key === 'token' && !value) {
    const hasSessionMarker = nativeGetItem.call(this, 'has-session') === '1';
    if (hasSessionMarker) {
      return COOKIE_SESSION_PLACEHOLDER;
    }
  }

  return value;
};

const nativeFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const requestInit: RequestInit = {
    credentials: 'include',
    ...init,
  };

  if (requestInit.headers) {
    const headers = new Headers(requestInit.headers);
    const authHeader = headers.get('Authorization');

    if (authHeader?.trim().toLowerCase().startsWith('bearer ')) {
      headers.delete('Authorization');
    }

    requestInit.headers = headers;
  }

  return nativeFetch(input, requestInit);
};

createRoot(document.getElementById("root")!).render(<App />);
