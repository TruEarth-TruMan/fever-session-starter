
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NetworkContextType {
  isOnline: boolean;
  lastChecked: Date;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  lastChecked: new Date()
});

export const useNetworkStatus = () => useContext(NetworkContext);

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkContextType>({
    isOnline: navigator.onLine,
    lastChecked: new Date()
  });
  const { toast } = useToast();

  useEffect(() => {
    // Initial check
    checkNetworkStatus();

    // Event listeners for online/offline status
    const handleOnline = () => {
      setNetworkStatus({ isOnline: true, lastChecked: new Date() });
      toast({
        title: "Connection Restored",
        description: "You are back online."
      });
    };

    const handleOffline = () => {
      setNetworkStatus({ isOnline: false, lastChecked: new Date() });
      toast({
        variant: "destructive",
        title: "Connection Lost",
        description: "You are working offline. Changes will be saved locally."
      });
    };

    // Check network status periodically
    const checkNetworkStatus = () => {
      const online = navigator.onLine;
      if (online !== networkStatus.isOnline) {
        setNetworkStatus({
          isOnline: online,
          lastChecked: new Date()
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const intervalId = setInterval(checkNetworkStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [networkStatus.isOnline]);

  return (
    <NetworkContext.Provider value={networkStatus}>
      {children}
    </NetworkContext.Provider>
  );
};
