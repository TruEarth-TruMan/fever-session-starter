import { useState } from 'react';
import { Track as TrackType } from '@/types';
import AudioMeter from './AudioMeter';
import WaveformVisualizer from './WaveformVisualizer';
import { Expand, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrackVisualizationsProps {
  track: TrackType;
  onPlayClick: () => void;
}

const TrackVisualizations = ({ track, onPlayClick }: TrackVisualizationsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Generate waveform data if not available
  const waveformData = track.waveform && track.waveform.length > 0 
    ? track.waveform 
    : Array.from({ length: 50 }, () => Math.random() * 0.8);

  // Normalize waveform data for better visualization
  const normalizedWaveform = normalizeWaveform(waveformData);

  return (
    <div className={`flex mb-4 ${isExpanded ? 'h-20' : 'h-10'} items-end space-x-2 relative`}>
      {track.inputMonitor && (
        <div className="h-full flex items-center">
          <AudioMeter level={track.isRecording ? 0.7 : 0} height={isExpanded ? 80 : 40} />
        </div>
      )}
      
      <div className="flex-1 cursor-pointer" onClick={onPlayClick}>
        <WaveformVisualizer
          data={normalizedWaveform}
          height={isExpanded ? 80 : 40}
          width="100%"
          color={track.color}
          isExpanded={isExpanded}
        />
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 w-6 h-6 p-0.5 bg-black/20 hover:bg-black/40"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? (
          <Minimize className="h-4 w-4 text-white/70" />
        ) : (
          <Expand className="h-4 w-4 text-white/70" />
        )}
      </Button>
    </div>
  );
};

// Helper function to normalize waveform data to a good visual range
const normalizeWaveform = (data: number[]): number[] => {
  if (!data.length) return [];
  
  // Find max amplitude in the data
  const maxAmplitude = Math.max(...data.map(v => Math.abs(v)));
  
  // If the max is already in a good range (0.5-1.0), return as is
  if (maxAmplitude > 0.5 && maxAmplitude <= 1.0) {
    return data;
  }
  
  // Otherwise normalize to keep peaks visible but not too extreme
  const targetAmplitude = 0.8;
  const normalizeFactor = maxAmplitude > 0 ? targetAmplitude / maxAmplitude : 1;
  
  return data.map(v => v * normalizeFactor);
};

export default TrackVisualizations;
