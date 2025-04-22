
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SessionTemplate, Track, Effect } from '@/types';
import SessionCard from '@/components/sessions/SessionCard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Sessions() {
  const [sessions, setSessions] = useState<SessionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure it matches SessionTemplate
      // Make sure tracks are properly cast as Track[]
      const transformedData = data.map(session => {
        // Ensure tracks is an array and has the correct format
        const tracks = Array.isArray(session.tracks) 
          ? session.tracks.map((track: any): Track => ({
              id: track.id || '',
              name: track.name || '',
              type: track.type || '',
              color: track.color || '#000000',
              muted: track.muted || false,
              soloed: track.soloed || false,
              volume: track.volume || 0,
              pan: track.pan || 0,
              inputMonitor: track.inputMonitor || false,
              fx: Array.isArray(track.fx) ? track.fx : [],
              waveform: track.waveform || [],
              isRecording: track.isRecording || false,
              audio: track.audio || undefined
            }))
          : [];
        
        // Ensure fx is an array with the correct format
        const fx = Array.isArray(session.fx) 
          ? session.fx.map((effect: any): Effect => ({
              id: effect.id || '',
              name: effect.name || '',
              type: effect.type || '',
              active: effect.active || false,
              params: effect.params || {}
            }))
          : [];
        
        return {
          id: session.id,
          name: session.name,
          type: session.type,
          tracks: tracks,
          is_favorite: session.is_favorite,
          updated_at: session.updated_at,
          created_at: session.created_at,
          user_id: session.user_id,
          fx: fx,
          loop_region: session.loop_region,
          description: '',
          iconName: getIconForSessionType(session.type)
        };
      });
      
      setSessions(transformedData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading sessions",
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get icon based on session type
  const getIconForSessionType = (type: string): string => {
    switch (type) {
      case 'voice': return 'mic';
      case 'guitar': return 'audio-waveform';
      case 'podcast': return 'mic';
      case 'keyboard': return 'music';
      case 'band': return 'music-4';
      default: return 'music';
    }
  };

  const handleCreateSession = () => {
    navigate('/');
  };

  const filteredSessions = sessions
    .filter(session => 
      session.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime();
    });

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Sessions</h1>
        <Button onClick={handleCreateSession}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sortBy} onValueChange={(value: 'date' | 'name') => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date Modified</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-secondary/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRefresh={fetchSessions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
