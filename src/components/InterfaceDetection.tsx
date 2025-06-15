import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { getAudioDevices } from '@/utils/audioDeviceDetection';
import { getDeviceRecommendation } from '@/utils/deviceClassification';
import { AudioDevice } from '@/types/electron';

interface InterfaceDetectionProps {
  onDetected: () => void;
}

const InterfaceDetection = ({ onDetected }: InterfaceDetectionProps) => {
  const [open, setOpen] = useState(true);
  const [detecting, setDetecting] = useState(true);
  const [detected, setDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [detectedDevice, setDetectedDevice] = useState<AudioDevice | null>(null);
  
  useEffect(() => {
    const detectInterfaces = async () => {
      try {
        setDetecting(true);
        const devices = await getAudioDevices();
        
        // Find the best professional audio interface
        const professionalInputs = devices.filter(device => 
          device.type === 'input' && 
          (device.isProfessionalInterface || device.isScarlettInterface)
        );
        
        if (professionalInputs.length > 0) {
          const bestDevice = professionalInputs[0]; // Already sorted by score
          setSelectedDevice(bestDevice.id);
          setDetectedDevice(bestDevice);
          setDetected(true);
        }
      } catch (err) {
        setError('Failed to detect audio interfaces');
        console.error('Interface detection error:', err);
      } finally {
        setDetecting(false);
      }
    };

    detectInterfaces();
  }, []);

  const { isInitialized, error: audioError } = useAudioEngine(selectedDevice);
  
  const handleContinue = () => {
    if (isInitialized || !window.electron) {
      setOpen(false);
      onDetected();
    }
  };

  const getDetectionMessage = () => {
    if (detecting) {
      return "Scanning for professional audio interfaces...";
    }
    if (error) {
      return error;
    }
    if (detected && detectedDevice) {
      const recommendation = getDeviceRecommendation({
        score: detectedDevice.deviceScore || 0,
        category: detectedDevice.deviceCategory || 'consumer',
        brand: detectedDevice.deviceBrand || 'Unknown',
        features: detectedDevice.deviceFeatures || []
      });
      return `${detectedDevice.deviceBrand || 'Professional'} audio interface detected! ${recommendation}`;
    }
    return "No professional audio interface detected. You can continue with system audio or connect an interface.";
  };

  const getIcon = () => {
    if (detecting) {
      return (
        <div className="w-16 h-16 rounded-full border-4 border-fever-red border-t-transparent animate-spin"></div>
      );
    }
    if (detected) {
      return (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-fever-red/20 text-fever-red text-3xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
        </div>
      );
    }
    return (
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-fever-amber/20 text-fever-amber text-3xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-fever-black border border-fever-red sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-fever-light text-center">
            Audio Interface Detection
          </DialogTitle>
          <DialogDescription className="text-center text-fever-light/70">
            {getDetectionMessage()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center py-6">
          {getIcon()}
        </div>

        {detectedDevice && (
          <div className="text-center space-y-2">
            <p className="text-sm text-fever-light/80">
              <strong>{detectedDevice.name}</strong>
            </p>
            {detectedDevice.deviceFeatures && detectedDevice.deviceFeatures.length > 0 && (
              <p className="text-xs text-fever-light/60">
                Features: {detectedDevice.deviceFeatures.join(', ')}
              </p>
            )}
          </div>
        )}
        
        <DialogFooter className="flex justify-center sm:justify-center">
          <Button 
            onClick={handleContinue} 
            disabled={detecting} 
            className={`w-full ${detected ? 'bg-fever-red hover:bg-fever-red/80' : 'bg-fever-amber hover:bg-fever-amber/80'} text-white`}
          >
            {detected ? 'Continue to Session' : 'Continue with System Audio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterfaceDetection;
