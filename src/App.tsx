
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Marketplace from "./pages/Marketplace";
import Sessions from "./pages/Sessions";
import Landing from "./pages/Landing";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              
              {/* Authentication verification route */}
              <Route path="/welcome" element={<Welcome />} />
              
              {/* Routes that require authentication */}
              <Route path="/marketplace" element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              } />
              
              {/* Routes that require subscription */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireSubscription={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/sessions" element={
                <ProtectedRoute requireSubscription={true}>
                  <Sessions />
                </ProtectedRoute>
              } />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
