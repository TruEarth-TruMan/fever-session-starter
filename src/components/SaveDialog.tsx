
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SaveDialogProps {
  sessionName: string;
  setSessionName: (name: string) => void;
}

const SaveDialog = ({ sessionName, setSessionName }: SaveDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-fever-light/20 bg-fever-dark flex gap-2">
          <Save className="h-4 w-4" />
          <span>Save</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-fever-dark border-fever-light/20">
        <DialogHeader>
          <DialogTitle className="text-fever-light">Save Session</DialogTitle>
          <DialogDescription className="text-fever-light/70">
            Save your current session progress.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="session-name" className="text-fever-light mb-2 block">
            Session Name
          </Label>
          <Input
            id="session-name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="bg-fever-black/40 border-fever-light/20 text-fever-light"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="border-fever-light/20 text-fever-light">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            className="bg-fever-red text-white hover:bg-fever-red/80"
            onClick={() => console.log('Saving session:', sessionName)}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveDialog;
