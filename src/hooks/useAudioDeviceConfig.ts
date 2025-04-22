
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
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
      const devices = await window.electron?.detectAudioInterfaces() || [];
      
      // Group devices by type
      const inputs = devices.filter(d => d.type === 'input');
      const outputs = devices.filter(d => d.type === 'output');
      
      // Auto-select Scarlett interface if available
      const scarlettInput = inputs.find(d => d.isScarlettInterface);
      const scarlettOutput = outputs.find(d => d.isScarlettInterface);
      
      setConfig(prev => ({
        ...prev,
        devices,
        selectedInput: scarlettInput || prev.selectedInput || inputs[0] || null,
        selectedOutput: scarlettOutput || prev.selectedOutput || outputs[0] || null,
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
