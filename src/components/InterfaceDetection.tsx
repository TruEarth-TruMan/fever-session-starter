
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

interface InterfaceDetectionProps {
  onDetected: () => void;
}

const InterfaceDetection = ({ onDetected }: InterfaceDetectionProps) => {
  const [open, setOpen] = useState(true);
  const [detecting, setDetecting] = useState(true);
  const [detected, setDetected] = useState(false);
  
  // Simulate interface detection
  useEffect(() => {
    const timer = setTimeout(() => {
      setDetecting(false);
      setDetected(true);
    }, 2000);
    
    return () => clearTimeout(timer);
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
