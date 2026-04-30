import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initObservability } from './lib/observability.ts'

initObservability();

createRoot(document.getElementById("root")!).render(<App />);
