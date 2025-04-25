
import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const location = useLocation();
  const { user } = useAuth();
  const { tier, isSubscribed, subscriptionEnd } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  // Extract session_id from URL query parameters if present
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    async function verifySession() {
      if (!sessionId || !user) return;
      
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) throw new Error('Authentication required');

        const response = await supabase.functions.invoke('get-session-details', {
          body: { session_id: sessionId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.data || response.error) {
          throw new Error(response.error?.message || 'Failed to verify subscription');
        }

        toast({
          title: 'Welcome to Fever+!',
          description: `Your ${response.data.subscription_tier} subscription is now active.`,
        });

      } catch (error) {
        console.error('Error verifying session:', error);
        toast({
          title: 'Verification failed',
          description: error instanceof Error ? error.message : 'Failed to verify subscription',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, [sessionId, user]);

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="bg-card rounded-lg shadow-lg p-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Progress value={45} className="w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Welcome to Fever+</h1>
              <p className="text-muted-foreground">
                {user.email && `Signed in as ${user.email}`}
              </p>
            </div>

            <div className="bg-accent/10 rounded-lg p-4 space-y-2">
              <h2 className="font-semibold">Subscription Status</h2>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Plan:</span>{' '}
                  {tier.charAt(0).toUpperCase() + tier.slice(1).replace('_', ' ')}
                </p>
                {subscriptionEnd && (
                  <p>
                    <span className="font-medium">Next billing date:</span>{' '}
                    {new Date(subscriptionEnd).toLocaleDateString()}
                  </p>
                )}
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={isSubscribed ? 'text-green-600' : 'text-yellow-600'}>
                    {isSubscribed ? 'Active' : 'Free Plan'}
                  </span>
                </p>
              </div>
            </div>

            {!isSubscribed && (
              <div className="pt-4">
                <Button onClick={() => window.location.href = '/marketplace'}>
                  Upgrade to Fever+
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
