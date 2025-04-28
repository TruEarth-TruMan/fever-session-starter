
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NetworkStatusProvider } from './components/NetworkStatusProvider.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'

createRoot(document.getElementById("root")!).render(
  <NetworkStatusProvider>
    <Router>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </Router>
  </NetworkStatusProvider>
);
