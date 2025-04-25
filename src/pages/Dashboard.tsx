
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Music, Download, Clock, Settings } from 'lucide-react';

export default function Dashboard() {
  const location = useLocation();
  const { user } = useAuth();
  const { tier, isSubscribed, subscriptionEnd, isLoading } = useSubscription();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Extract session_id from URL query parameters if present
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    async function fetchRecentSessions() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        setRecentSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your recent sessions',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingSessions(false);
      }
    }

    fetchRecentSessions();
  }, [user]);

  return (
    <MainLayout>
      <div className="container max-w-5xl mx-auto py-10 px-4">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Welcome & Status Section */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome to Fever{isSubscribed ? '+' : ''}
              </h1>
              <p className="text-fever-light/70">
                {user?.email && `Signed in as ${user.email}`}
              </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Subscription Card */}
              <div className="bg-fever-dark/30 backdrop-blur-sm rounded-lg p-6 border border-fever-light/10">
                <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-fever-light/70">Current Plan</span>
                      {isSubscribed && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Active</span>}
                    </div>
                    <p className="font-medium text-lg">
                      {tier === 'free' ? 'Free Account' : tier.replace('_', ' ').charAt(0).toUpperCase() + tier.replace('_', ' ').slice(1)}
                    </p>
                  </div>

                  {subscriptionEnd && (
                    <div>
                      <span className="text-sm text-fever-light/70">Next billing date</span>
                      <p className="font-medium">
                        {new Date(subscriptionEnd).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="py-2">
                    {isSubscribed ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-fever-light">Features included:</p>
                        <ul className="text-sm text-fever-light/70 space-y-1">
                          <li className="flex items-center">
                            <span className="mr-2 text-green-400">✓</span> Unlimited projects
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 text-green-400">✓</span> Premium templates
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 text-green-400">✓</span> AI-powered assistance
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 text-green-400">✓</span> Cloud storage
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <Button onClick={() => window.location.href = '/marketplace'} className="w-full">
                        Upgrade to Fever+
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick Actions Card */}
              <div className="bg-fever-dark/30 backdrop-blur-sm rounded-lg p-6 border border-fever-light/10">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center" onClick={() => window.location.href = '/sessions'}>
                    <Music className="h-6 w-6 mb-2" />
                    <span>New Session</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center" onClick={() => window.location.href = '/marketplace'}>
                    <Download className="h-6 w-6 mb-2" />
                    <span>Templates</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center" disabled={!isSubscribed}>
                    <Clock className="h-6 w-6 mb-2" />
                    <span>Recent</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center" disabled={!isSubscribed}>
                    <Settings className="h-6 w-6 mb-2" />
                    <span>Settings</span>
                  </Button>
                </div>
                
                {!isSubscribed && (
                  <p className="text-xs text-fever-light/50 mt-4 text-center">
                    Some features require Fever+ subscription
                  </p>
                )}
              </div>
            </div>
            
            {/* Recent Sessions */}
            <div className="bg-fever-dark/30 backdrop-blur-sm rounded-lg p-6 border border-fever-light/10">
              <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
              
              {isLoadingSessions ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : recentSessions.length > 0 ? (
                <div className="divide-y divide-fever-light/10">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{session.name}</h3>
                        <p className="text-sm text-fever-light/70">
                          Last updated: {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => window.location.href = `/sessions/${session.id}`}>
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-fever-light/70">
                  No sessions yet. Create your first session to get started.
                </p>
              )}
              
              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/sessions'}>
                  View All Sessions
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
