
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Landing from './Landing';

export default function Index() {
  const { user, isLoading } = useAuth();
  
  // Show landing page while checking authentication
  if (isLoading) {
    return <Landing />;
  }
  
  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise show the landing page
  return <Landing />;
}
