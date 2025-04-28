
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NetworkStatusProvider } from './components/NetworkStatusProvider.tsx'
import { Toaster } from './components/ui/toaster.tsx'

createRoot(document.getElementById("root")!).render(
  <NetworkStatusProvider>
    <App />
    <Toaster />
  </NetworkStatusProvider>
);
