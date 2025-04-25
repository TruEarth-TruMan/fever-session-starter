
import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface SessionDetails {
  id: string;
  customer_email: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  success: boolean;
}

export default function Welcome() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, isSubscribed } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  // Extract session_id from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Only try to fetch session details if we have both a session_id and a logged in user
    if (!sessionId || !user) {
      if (!sessionId && user) {
        // User is logged in but no session_id (maybe they refreshed)
        setIsLoading(false);
      }
      return;
    }

    let progressInterval: ReturnType<typeof setInterval>;
    
    // Simulate progress for UX during API call
    progressInterval = setInterval(() => {
      setVerificationProgress(prev => {
        const newProgress = prev + 5;
        return newProgress < 90 ? newProgress : prev;
      });
    }, 300);
    
    const fetchSessionDetails = async () => {
      try {
        // Get the user's JWT for authentication
        const { data: authData } = await supabase.auth.getSession();
        const token = authData?.session?.access_token;
        
        if (!token) {
          throw new Error('No authentication token available');
        }

        // Call our secure edge function to get session details
        const response = await supabase.functions.invoke('get-session-details', {
          body: {},
          headers: {
            Authorization: `Bearer ${token}`,
          },
          query: { session_id: sessionId },
        });

        if (!response.data || response.error) {
          throw new Error(response.error?.message || 'Failed to fetch session details');
        }

        setSessionDetails(response.data as SessionDetails);
        
        // Complete the progress bar
        setVerificationProgress(100);
        
        // Show success toast
        toast({
          title: 'Subscription verified!',
          description: `You now have access to ${response.data.subscription_tier || 'Fever+'} features.`,
        });
      } catch (error) {
        console.error('Error fetching session details:', error);
        toast({
          title: 'Verification failed',
          description: error instanceof Error ? error.message : 'Failed to verify subscription',
          variant: 'destructive',
        });
        setVerificationProgress(100); // Complete the progress bar anyway
      } finally {
        clearInterval(progressInterval);
        setIsLoading(false);
      }
    };

    fetchSessionDetails();
    
    return () => {
      clearInterval(progressInterval);
    };
  }, [sessionId, user]);

  // No user logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Fallback UI if user reloads without a session_id but is logged in
  if (!sessionId && !isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div className="bg-card rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-3xl font-bold mb-6">Welcome to Fever+</h1>
          
          <div className="mb-6">
            <p className="text-lg mb-4">
              {isSubscribed 
                ? "You're already subscribed to Fever+!"
                : "It looks like you might have refreshed the page or arrived here directly."}
            </p>
            <p className="text-muted-foreground">
              {isSubscribed 
                ? `Your current plan: ${tier}`
                : "If you've just completed checkout and were redirected here, please check your email for confirmation."}
            </p>
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <Button onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
            {!isSubscribed && (
              <Button variant="outline" onClick={() => navigate('/marketplace')}>
                View Plans
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="bg-card rounded-lg shadow-lg p-6">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <div className="space-y-2">
              <Progress value={verificationProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Verifying your subscription...
              </p>
            </div>
            <div className="space-y-4 mt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">
              Thanks for subscribing{user.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h1>
            
            <p className="text-xl mb-6">
              Your account has been upgraded to {sessionDetails?.subscription_tier || 'Fever+'}
            </p>
            
            <div className="bg-muted p-4 rounded-md mb-8 text-left">
              <h3 className="font-medium mb-2">Subscription Details:</h3>
              <ul className="space-y-1 text-sm">
                <li><span className="font-medium">Status:</span> {sessionDetails?.subscription_status || 'Active'}</li>
                <li><span className="font-medium">Plan:</span> {sessionDetails?.subscription_tier || 'Fever+'}</li>
                <li><span className="font-medium">Email:</span> {sessionDetails?.customer_email || user.email}</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/')}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/sessions')}>
                Create New Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
