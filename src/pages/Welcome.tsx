
import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useSessionVerification } from '@/hooks/useSessionVerification';
import { LoadingState } from '@/components/welcome/LoadingState';
import { FallbackMessage } from '@/components/welcome/FallbackMessage';
import { SuccessMessage } from '@/components/welcome/SuccessMessage';

export default function Welcome() {
  const location = useLocation();
  const { user } = useAuth();
  const { tier, isSubscribed } = useSubscription();
  const { isLoading, sessionDetails, verificationProgress, verifySession } = useSessionVerification();
  
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId || !user) {
      if (!sessionId && user) {
        verifySession('');
      }
      return;
    }

    verifySession(sessionId);
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
