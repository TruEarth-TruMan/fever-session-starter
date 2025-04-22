
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NetworkStatusProvider } from './components/NetworkStatusProvider.tsx'

createRoot(document.getElementById("root")!).render(
  <NetworkStatusProvider>
    <App />
  </NetworkStatusProvider>
);
