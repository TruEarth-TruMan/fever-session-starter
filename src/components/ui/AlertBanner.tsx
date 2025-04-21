
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X } from 'lucide-react';

export type AlertType = 'error' | 'warning' | 'info' | 'success';

interface AlertBannerProps {
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const AlertBanner = ({ type, title, message, duration = 5000, onClose }: AlertBannerProps) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [duration]);
  
  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };
  
  if (!visible) return null;
  
  const alertStyles = {
    error: 'bg-fever-red/10 border-fever-red text-fever-red',
    warning: 'bg-fever-amber/10 border-fever-amber text-fever-amber',
    info: 'bg-fever-blue/10 border-fever-blue text-fever-blue',
    success: 'bg-green-600/10 border-green-600 text-green-600',
  };
  
  return (
    <Alert className={`${alertStyles[type]} mb-4 animate-fade-in`}>
      <div className="flex justify-between items-start">
        <div>
          <AlertTitle className="font-semibold">{title}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </div>
        <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
};

export default AlertBanner;
