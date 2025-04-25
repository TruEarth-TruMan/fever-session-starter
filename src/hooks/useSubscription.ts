
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type SubscriptionTier = 'free' | 'fever_plus' | 'premium';

interface SubscriptionData {
  isLoading: boolean;
  tier: SubscriptionTier;
  isSubscribed: boolean;
  subscriptionEnd: string | null;
  error: Error | null;
}

export function useSubscription(): SubscriptionData {
  const { user } = useAuth();
  const [data, setData] = useState<SubscriptionData>({
    isLoading: true,
    tier: 'free',
    isSubscribed: false,
    subscriptionEnd: null,
    error: null,
  });

  useEffect(() => {
    async function fetchSubscriptionData() {
      if (!user) {
        setData({
          isLoading: false,
          tier: 'free',
          isSubscribed: false,
          subscriptionEnd: null,
          error: null,
        });
        return;
      }

      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_end, fever_plus')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching subscription data:', error);
          setData({
            isLoading: false,
            tier: 'free',
            isSubscribed: false,
            subscriptionEnd: null,
            error: new Error(error.message),
          });
          return;
        }

        const tier = (profileData?.subscription_tier || 'free') as SubscriptionTier;
        
        setData({
          isLoading: false,
          tier,
          isSubscribed: tier !== 'free',
          subscriptionEnd: profileData?.subscription_end || null,
          error: null,
        });
      } catch (error) {
        console.error('Error in useSubscription hook:', error);
        setData({
          isLoading: false,
          tier: 'free',
          isSubscribed: false,
          subscriptionEnd: null,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    }

    fetchSubscriptionData();
  }, [user]);

  return data;
}
