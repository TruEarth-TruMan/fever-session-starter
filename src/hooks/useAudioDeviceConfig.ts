
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAudioDevices } from '@/utils/audioDeviceDetection';
import { getDeviceRecommendation } from '@/utils/deviceClassification';

export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  isScarlettInterface?: boolean;
  // New universal interface detection
  isProfessionalInterface?: boolean;
  deviceScore?: number;
  deviceBrand?: string;
  deviceCategory?: 'professional' | 'prosumer' | 'consumer' | 'builtin';
  deviceFeatures?: string[];
}

export interface AudioDeviceConfig {
  selectedInput: AudioDevice | null;
  selectedOutput: AudioDevice | null;
  devices: AudioDevice[];
  isLoading: boolean;
  error: string | null;
}

export const useAudioDeviceConfig = () => {
  const [config, setConfig] = useState<AudioDeviceConfig>({
    selectedInput: null,
    selectedOutput: null,
    devices: [],
    isLoading: true,
    error: null
  });
  const { toast } = useToast();

  const refreshDevices = async () => {
    setConfig(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const devices = await getAudioDevices();
      
      // Group devices by type
      const inputs = devices.filter(d => d.type === 'input');
      const outputs = devices.filter(d => d.type === 'output');
      
      // Smart device selection based on scoring
      const bestInput = inputs[0]; // Already sorted by score
      const bestOutput = outputs[0]; // Already sorted by score
      
      // Show recommendation for the best device found
      if (bestInput && bestInput.deviceScore && bestInput.deviceScore > 50) {
        const recommendation = getDeviceRecommendation({
          score: bestInput.deviceScore,
          category: bestInput.deviceCategory || 'consumer',
          brand: bestInput.deviceBrand || 'Unknown',
          features: bestInput.deviceFeatures || []
        });
        
        toast({
          title: "Audio Interface Detected",
          description: recommendation,
          duration: 4000,
        });
      }
      
      setConfig(prev => ({
        ...prev,
        devices,
        selectedInput: bestInput || prev.selectedInput || null,
        selectedOutput: bestOutput || prev.selectedOutput || null,
        isLoading: false
      }));
    } catch (err) {
      setConfig(prev => ({
        ...prev,
        error: 'Failed to detect audio devices',
        isLoading: false
      }));
      toast({
        variant: "destructive",
        title: "Device Detection Failed",
        description: "Unable to detect audio devices. Please check your connections."
      });
    }
  };

  const selectInput = async (deviceId: string) => {
    const device = config.devices.find(d => d.id === deviceId);
    if (!device) return;

    try {
      const initialized = await window.electron?.initializeAudio(deviceId);
      if (initialized) {
        setConfig(prev => ({ ...prev, selectedInput: device }));
        toast({
          title: "Input Device Updated",
          description: `Now using: ${device.name}`
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Device Selection Failed",
        description: "Failed to initialize the selected input device."
      });
    }
  };

  const selectOutput = (deviceId: string) => {
    const device = config.devices.find(d => d.id === deviceId);
    if (!device) return;
    
    setConfig(prev => ({ ...prev, selectedOutput: device }));
    toast({
      title: "Output Device Updated",
      description: `Now using: ${device.name}`
    });
  };

  useEffect(() => {
    refreshDevices();
    
    // Set up device change listener
    const handleDeviceChange = () => {
      refreshDevices();
      toast({
        title: "Audio Devices Changed",
        description: "Refreshing available devices..."
      });
    };

    // Poll for device changes every 5 seconds
    const interval = setInterval(handleDeviceChange, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    ...config,
    refreshDevices,
    selectInput,
    selectOutput
  };
};
