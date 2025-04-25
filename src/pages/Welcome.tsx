
import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import { SessionDetails } from '@/types/subscription';
import { LoadingState } from '@/components/welcome/LoadingState';
import { FallbackMessage } from '@/components/welcome/FallbackMessage';
import { SuccessMessage } from '@/components/welcome/SuccessMessage';

export default function Welcome() {
  const location = useLocation();
  const { user } = useAuth();
  const { tier, isSubscribed } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId || !user) {
      if (!sessionId && user) {
        setIsLoading(false);
      }
      return;
    }

    let progressInterval: ReturnType<typeof setInterval>;
    
    progressInterval = setInterval(() => {
      setVerificationProgress(prev => {
        const newProgress = prev + 5;
        return newProgress < 90 ? newProgress : prev;
      });
    }, 300);
    
    const fetchSessionDetails = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const token = authData?.session?.access_token;
        
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await supabase.functions.invoke('get-session-details', {
          body: { session_id: sessionId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data || response.error) {
          throw new Error(response.error?.message || 'Failed to fetch session details');
        }

        setSessionDetails(response.data as SessionDetails);
        setVerificationProgress(100);
        
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
        setVerificationProgress(100);
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!sessionId && !isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <FallbackMessage isSubscribed={isSubscribed} tier={tier} />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="bg-card rounded-lg shadow-lg p-6">
        {isLoading ? (
          <LoadingState verificationProgress={verificationProgress} />
        ) : (
          <SuccessMessage sessionDetails={sessionDetails} userEmail={user.email} />
        )}
      </div>
    </div>
  );
}
