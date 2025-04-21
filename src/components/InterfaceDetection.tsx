
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

// Declare the electron global type
declare global {
  interface Window {
    electron?: {
      detectAudioInterfaces: () => Promise<{
        id: string;
        name: string;
        type: 'input' | 'output';
        isScarlettInterface: boolean;
      }[]>;
    };
  }
}

interface InterfaceDetectionProps {
  onDetected: () => void;
}

const InterfaceDetection = ({ onDetected }: InterfaceDetectionProps) => {
  const [open, setOpen] = useState(true);
  const [detecting, setDetecting] = useState(true);
  const [detected, setDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const detectInterfaces = async () => {
      try {
        if (window.electron) {
          const devices = await window.electron.detectAudioInterfaces();
          const hasScarlettInterface = devices.some(device => device.isScarlettInterface);
          setDetected(hasScarlettInterface);
        } else {
          // Fallback for web - simulate detection
          setTimeout(() => {
            setDetected(true);
          }, 2000);
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
  
  const handleContinue = () => {
    setOpen(false);
    onDetected();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-fever-black border border-fever-red sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-fever-light text-center">
            Interface Detection
          </DialogTitle>
          <DialogDescription className="text-center text-fever-light/70">
            {detecting ? (
              "Scanning for Focusrite Scarlett interface..."
            ) : error ? (
              error
            ) : detected ? (
              "Scarlett interface detected. Ready to record?"
            ) : (
              "No interface detected. You can continue with system audio."
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center py-6">
          {detecting ? (
            <div className="w-16 h-16 rounded-full border-4 border-fever-red border-t-transparent animate-spin"></div>
          ) : detected ? (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-fever-red/20 text-fever-red text-3xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-fever-amber/20 text-fever-amber text-3xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-center sm:justify-center">
          <Button 
            onClick={handleContinue} 
            disabled={detecting} 
            className={`w-full ${detected ? 'bg-fever-red hover:bg-fever-red/80' : 'bg-fever-amber hover:bg-fever-amber/80'} text-white`}
          >
            {detected ? 'Continue to Session' : 'Continue Anyway'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterfaceDetection;

