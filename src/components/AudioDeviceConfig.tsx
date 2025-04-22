
import { useState } from 'react';
import { Volume2, Mic, RefreshCw, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAudioDeviceConfig } from '@/hooks/useAudioDeviceConfig';
import AudioMeter from './visualizations/AudioMeter';
import { cn } from '@/lib/utils';

const AudioDeviceConfig = () => {
  const { 
    devices, 
    selectedInput, 
    selectedOutput, 
    isLoading,
    refreshDevices,
    selectInput,
    selectOutput
  } = useAudioDeviceConfig();
  
  const [isTesting, setIsTesting] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);

  const inputs = devices.filter(d => d.type === 'input');
  const outputs = devices.filter(d => d.type === 'output');

  const handleTestInput = async () => {
    if (!selectedInput) return;
    
    setIsTesting(true);
    // Start polling input level
    const interval = setInterval(async () => {
      if (window.electron) {
        const level = await window.electron.getInputLevel();
        setInputLevel(level);
      }
    }, 50);

    // Stop after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsTesting(false);
      setInputLevel(0);
    }, 5000);
  };

  const handleTestOutput = () => {
    if (!selectedOutput) return;
    // Play a test tone through Web Audio API
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 500);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Audio Device Configuration</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshDevices}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Input Device
            </label>
            <div className="flex gap-2">
              <Select
                value={selectedInput?.id}
                onValueChange={selectInput}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select input device" />
                </SelectTrigger>
                <SelectContent>
                  {inputs.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestInput}
                disabled={!selectedInput || isTesting}
              >
                Test Input
              </Button>
            </div>
            {isTesting && (
              <div className="flex items-center gap-2">
                <AudioMeter level={inputLevel} />
                <span className="text-sm text-muted-foreground">
                  Testing input...
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Output Device
            </label>
            <div className="flex gap-2">
              <Select
                value={selectedOutput?.id}
                onValueChange={selectOutput}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select output device" />
                </SelectTrigger>
                <SelectContent>
                  {outputs.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestOutput}
                disabled={!selectedOutput}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Test Output
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioDeviceConfig;
