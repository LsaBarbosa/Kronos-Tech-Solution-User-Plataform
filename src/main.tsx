import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandlers } from './lib/observability'

setupGlobalErrorHandlers();

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
