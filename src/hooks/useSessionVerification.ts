
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SessionDetails } from '@/types/subscription';
import { toast } from '@/hooks/use-toast';

interface SessionVerificationReturn {
  isLoading: boolean;
  sessionDetails: SessionDetails | null;
  verificationProgress: number;
  verifySession: (sessionId: string) => Promise<void>;
}

export function useSessionVerification(): SessionVerificationReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const verifySession = async (sessionId: string) => {
    if (!user) return;

    let progressInterval: ReturnType<typeof setInterval>;
    
    progressInterval = setInterval(() => {
      setVerificationProgress(prev => {
        const newProgress = prev + 5;
        return newProgress < 90 ? newProgress : prev;
      });
    }, 300);

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

  return {
    isLoading,
    sessionDetails,
    verificationProgress,
    verifySession
  };
}
