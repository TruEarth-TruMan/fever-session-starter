
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionTemplate } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Star, PlayCircle } from 'lucide-react';

interface SessionCardProps {
  session: SessionTemplate;
  onRefresh: () => void;
}

export default function SessionCard({ session, onRefresh }: SessionCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(session.name);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRename = async () => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ name: newName })
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Session renamed",
        description: `Successfully renamed to "${newName}"`
      });
      onRefresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error renaming session",
        description: "Please try again later."
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Session deleted",
        description: "Session has been permanently removed."
      });
      onRefresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting session",
        description: "Please try again later."
      });
    }
  };

  const toggleFavorite = async () => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_favorite: !session.is_favorite })
        .eq('id', session.id);

      if (error) throw error;
      onRefresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating favorite status",
        description: "Please try again later."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          {isRenaming ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
              autoFocus
            />
          ) : (
            <CardTitle className="flex items-center gap-2">
              {session.name}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRenaming(true)}
                className="h-6 w-6"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardTitle>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={session.is_favorite ? "text-yellow-500" : ""}
          >
            <Star className="h-4 w-4" fill={session.is_favorite ? "currentColor" : "none"} />
          </Button>
        </div>
        <CardDescription>
          Last modified {formatDistanceToNow(new Date(session.updated_at))} ago
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p>{session.tracks.length} tracks</p>
          <p className="capitalize">{session.type} session</p>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="secondary" onClick={() => navigate(`/session/${session.id}`)}>
          <PlayCircle className="mr-2 h-4 w-4" />
          Resume
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{session.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
