
import { useState } from 'react';
import { Volume2, Mic, RefreshCw, PlayCircle, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'professional':
        return <Award className="h-3 w-3" />;
      case 'prosumer':
        return <Star className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'professional':
        return 'bg-green-600 text-white';
      case 'prosumer':
        return 'bg-blue-600 text-white';
      case 'consumer':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const formatDeviceName = (device: any) => {
    const hasScore = device.deviceScore && device.deviceScore > 0;
    return (
      <div className="flex items-center justify-between w-full">
        <span className="truncate">{device.name}</span>
        <div className="flex items-center gap-1 ml-2">
          {device.deviceCategory && (
            <Badge className={cn("text-xs px-1 py-0", getCategoryColor(device.deviceCategory))}>
              {getCategoryIcon(device.deviceCategory)}
              {device.deviceBrand || device.deviceCategory}
            </Badge>
          )}
          {hasScore && (
            <span className="text-xs text-muted-foreground">
              ({device.deviceScore})
            </span>
          )}
        </div>
      </div>
    );
  };

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
                <SelectTrigger className="w-[400px]">
                  <SelectValue placeholder="Select input device" />
                </SelectTrigger>
                <SelectContent>
                  {inputs.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      {formatDeviceName(device)}
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
            {selectedInput && selectedInput.deviceFeatures && selectedInput.deviceFeatures.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {selectedInput.deviceFeatures.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
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
                <SelectTrigger className="w-[400px]">
                  <SelectValue placeholder="Select output device" />
                </SelectTrigger>
                <SelectContent>
                  {outputs.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      {formatDeviceName(device)}
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
            {selectedOutput && selectedOutput.deviceFeatures && selectedOutput.deviceFeatures.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {selectedOutput.deviceFeatures.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioDeviceConfig;
