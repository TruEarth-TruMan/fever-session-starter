
import { SessionTemplate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Pencil } from 'lucide-react';
import MarketplaceButton from '../MarketplaceButton';

interface TrackHeaderProps {
  sessionName: string;
  isEditingSession: boolean;
  sessionTemplate: SessionTemplate;
  onBack: () => void;
  onSessionNameChange: () => void;
  setSessionName: (name: string) => void;
  setIsEditingSession: (editing: boolean) => void;
}

const TrackHeader = ({
  sessionName,
  isEditingSession,
  sessionTemplate,
  onBack,
  onSessionNameChange,
  setSessionName,
  setIsEditingSession
}: TrackHeaderProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSessionNameChange();
    } else if (e.key === 'Escape') {
      setSessionName(sessionTemplate.name);
      setIsEditingSession(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        {isEditingSession ? (
          <Input
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onBlur={onSessionNameChange}
            onKeyDown={handleKeyDown}
            className="h-8 py-1 px-2 w-48 bg-fever-black/40 border-fever-light/20"
            autoFocus
          />
        ) : (
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-fever-red">
              {sessionName} Session
            </h1>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 h-6 w-6 p-0" 
              onClick={() => setIsEditingSession(true)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <MarketplaceButton />
      </div>
    </div>
  );
};

export default TrackHeader;
