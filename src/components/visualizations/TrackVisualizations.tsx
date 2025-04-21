
import { Track as TrackType } from '@/types';
import AudioMeter from './AudioMeter';
import WaveformVisualizer from './WaveformVisualizer';

interface TrackVisualizationsProps {
  track: TrackType;
  onPlayClick: () => void;
}

const TrackVisualizations = ({ track, onPlayClick }: TrackVisualizationsProps) => {
  const waveformData = track.waveform && track.waveform.length > 0 
    ? track.waveform 
    : Array.from({ length: 50 }, () => Math.random() * 0.8);

  return (
    <div className="flex mb-4 h-20 items-end space-x-2">
      {track.inputMonitor && (
        <div className="h-full flex items-center">
          <AudioMeter level={track.isRecording ? 0.7 : 0} height={80} />
        </div>
      )}
      
      <div className="flex-1 cursor-pointer" onClick={onPlayClick}>
        <WaveformVisualizer
          data={waveformData}
          height={80}
          width={track.inputMonitor ? 'calc(100% - 28px)' : '100%'}
          color={track.color}
        />
      </div>
    </div>
  );
};

export default TrackVisualizations;
