import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: subscriptionLoading, isSubscribed } = useSubscription();
  const location = useLocation();
  
  if (authLoading || (requireSubscription && subscriptionLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSubscription && !isSubscribed) {
    return <Navigate to="/marketplace" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
