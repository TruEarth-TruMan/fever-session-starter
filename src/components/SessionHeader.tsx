
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Pencil } from 'lucide-react';
import SaveDialog from './SaveDialog';
import ExportDialog from './ExportDialog';

interface SessionHeaderProps {
  sessionName: string;
  setSessionName: (name: string) => void;
  isEditingSession: boolean;
  setIsEditingSession: (isEditing: boolean) => void;
  handleSessionNameChange: () => void;
  onBack: () => void;
  exportProps: {
    exportFormat: string;
    setExportFormat: (format: string) => void;
    exportQuality: string;
    setExportQuality: (quality: string) => void;
    handleExport: () => void;
    getExportPreset: () => string;
  };
}

const SessionHeader = ({
  sessionName,
  setSessionName,
  isEditingSession,
  setIsEditingSession,
  handleSessionNameChange,
  onBack,
  exportProps
}: SessionHeaderProps) => {
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
            onBlur={handleSessionNameChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSessionNameChange();
              if (e.key === 'Escape') {
                setSessionName(sessionName);
                setIsEditingSession(false);
              }
            }}
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
        <SaveDialog 
          sessionName={sessionName}
          setSessionName={setSessionName}
        />
        <ExportDialog {...exportProps} />
      </div>
    </div>
  );
};

export default SessionHeader;
