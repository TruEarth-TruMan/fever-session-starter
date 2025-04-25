
import { useEffect, useState } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useSessionVerification } from '@/hooks/useSessionVerification';
import { LoadingState } from '@/components/welcome/LoadingState';
import { FallbackMessage } from '@/components/welcome/FallbackMessage';
import { SuccessMessage } from '@/components/welcome/SuccessMessage';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Welcome() {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { tier, isSubscribed } = useSubscription();
  const { isLoading, sessionDetails, verificationProgress, verifySession } = useSessionVerification();
  const [isProcessingAuth, setIsProcessingAuth] = useState(true);
  
  // Extract both session_id and any auth parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');
  
  // Check for auth related parameters
  const hasAuthParams = location.hash.includes('access_token') || 
                       location.hash.includes('error_description') || 
                       searchParams.has('error_description');

  useEffect(() => {
    async function handleAuthRedirect() {
      if (!hasAuthParams) {
        setIsProcessingAuth(false);
        return;
      }
      
      try {
        // Handle the auth redirect
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          toast({
            title: "Authentication failed",
            description: error.message,
            variant: "destructive"
          });
        } else if (data?.session) {
          toast({
            title: "Authentication successful",
            description: "You've been successfully signed in."
          });
        }
      } catch (error) {
        console.error("Error processing authentication:", error);
        toast({
          title: "Authentication error",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      } finally {
        setIsProcessingAuth(false);
      }
    }

    handleAuthRedirect();
  }, [hasAuthParams]);

  useEffect(() => {
    // Only verify Stripe sessions if we're not processing auth and have a sessionId
    if (!isProcessingAuth && sessionId && user) {
      verifySession(sessionId);
    }
  }, [sessionId, user, isProcessingAuth, verifySession]);

  // Show loading while authentication is processing
  if (authLoading || isProcessingAuth) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <LoadingState verificationProgress={30} />
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If there's a sessionId, show verification loading or result
  if (sessionId) {
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

  // If no sessionId but user is logged in, show appropriate welcome message
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="bg-card rounded-lg shadow-lg p-6">
        <FallbackMessage isSubscribed={isSubscribed} tier={tier} />
      </div>
    </div>
  );
}
