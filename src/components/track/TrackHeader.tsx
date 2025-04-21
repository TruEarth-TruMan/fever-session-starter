
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music, Maximize2, SlidersHorizontal, Pencil } from 'lucide-react';

interface TrackHeaderProps {
  id: string;
  name: string;
  color: string;
  type: string;
  isRecording: boolean;
  isEditing: boolean;
  trackName: string;
  setIsEditing: (value: boolean) => void;
  setTrackName: (value: string) => void;
  onNameChange: (id: string, name: string) => void;
  onFXClick: () => void;
  onExpandClick: () => void;
}

const TrackHeader = ({
  id,
  name,
  color,
  type,
  isRecording,
  isEditing,
  trackName,
  setIsEditing,
  setTrackName,
  onNameChange,
  onFXClick,
  onExpandClick
}: TrackHeaderProps) => {
  const handleNameChange = () => {
    if (trackName.trim() !== '') {
      onNameChange(id, trackName);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameChange();
    } else if (e.key === 'Escape') {
      setTrackName(name);
      setIsEditing(false);
    }
  };

  const getTrackIcon = () => {
    switch(type.toLowerCase()) {
      case 'drums':
      case 'percussion':
        return <Music className="h-4 w-4" style={{ color }} />;
      default:
        return <Music className="h-4 w-4" style={{ color }} />;
    }
  };

  return (
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        {getTrackIcon()}
        
        {isEditing ? (
          <Input
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            onBlur={handleNameChange}
            onKeyDown={handleKeyDown}
            className="h-6 py-1 px-2 w-32 bg-fever-black/40 border-fever-light/20"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-1">
            <span className="font-space font-bold text-sm">{name}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0 hover:bg-fever-dark" 
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {isRecording && (
          <span className="bg-fever-red rounded-full h-2 w-2 animate-pulse"></span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-fever-dark"
          onClick={onFXClick}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 hover:bg-fever-dark" 
          onClick={onExpandClick}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TrackHeader;
