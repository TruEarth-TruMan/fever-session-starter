
import { useState, useEffect, useCallback } from 'react';
import { isElectron } from '@/utils/environment';
import { useToast } from '@/hooks/use-toast';
import { 
  getCurrentEnvironment, 
  getUserUpdatePreferences, 
  saveUpdatePreferences, 
  getBetaUserId,
  setBetaUserId
} from '@/utils/updateConfig';

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';

interface UpdateProgress {
  percent?: number;
  bytesPerSecond?: number;
  total?: number;
  transferred?: number;
}

interface UpdateInfo {
  version?: string;
  notes?: string;
  date?: string;
  progress?: UpdateProgress;
  error?: string;
}

export function useAppUpdater() {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({});
  const [isElectronApp, setIsElectronApp] = useState<boolean>(false);
  const [betaId, setBetaId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Initialize
  useEffect(() => {
    const electronDetected = isElectron();
    setIsElectronApp(electronDetected);
    
    // Load beta user ID if available
    const storedBetaId = getBetaUserId();
    if (storedBetaId) {
      setBetaId(storedBetaId);
    }
    
    if (electronDetected && window.electron?.onUpdateStatus) {
      // Set up event listener for update events from main process
      const removeListener = window.electron.onUpdateStatus((updateStatus) => {
        console.log('Update status received:', updateStatus);
        
        if (updateStatus.status) {
          setStatus(updateStatus.status);
          
          // Extract info from the status update
          const info: UpdateInfo = {};
          
          if (updateStatus.info) {
            if (updateStatus.info.version) info.version = updateStatus.info.version;
            if (updateStatus.info.notes) info.notes = updateStatus.info.notes;
            if (updateStatus.info.date) info.date = updateStatus.info.date;
            if (updateStatus.info.percent !== undefined) {
              info.progress = {
                percent: updateStatus.info.percent,
                bytesPerSecond: updateStatus.info.bytesPerSecond,
                total: updateStatus.info.total,
                transferred: updateStatus.info.transferred
              };
            }
          }
          
          if (updateStatus.error) {
            info.error = updateStatus.error;
          }
          
          setUpdateInfo(info);
          
          // Show toast notifications for important events
          switch (updateStatus.status) {
            case 'available':
              toast({
                title: 'Update Available',
                description: `Version ${info.version || 'newer'} is available and downloading.`
              });
              break;
            case 'downloaded':
              toast({
                title: 'Update Ready',
                description: 'Restart the app to apply the new version.'
              });
              break;
            case 'error':
              toast({
                variant: 'destructive',
                title: 'Update Error',
                description: info.error || 'Failed to check for updates.'
              });
              break;
          }
        }
      });
      
      // Clean up event listener on unmount
      return () => {
        removeListener();
      };
    }
  }, [toast]);
  
  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!isElectronApp || !window.electron?.checkForUpdates) {
      return { success: false, error: 'Update checking is only available in the desktop app' };
    }
    
    setStatus('checking');
    toast({
      title: 'Checking for Updates',
      description: 'Contacting update server...'
    });
    
    try {
      // Include beta ID if available
      const options = betaId ? { betaId } : undefined;
      const result = await window.electron.checkForUpdates(options);
      return result;
    } catch (error) {
      console.error('Error checking for updates:', error);
      setStatus('error');
      setUpdateInfo({ error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: String(error) };
    }
  }, [isElectronApp, toast, betaId]);
  
  // Set update channel
  const setUpdateChannel = useCallback(async (channel: string) => {
    if (!isElectronApp || !window.electron?.setUpdateChannel) {
      return { success: false, error: 'Update channel setting is only available in the desktop app' };
    }
    
    try {
      const result = await window.electron.setUpdateChannel(channel);
      
      // Update user preferences
      const currentPrefs = getUserUpdatePreferences();
      saveUpdatePreferences({
        ...currentPrefs,
        channel
      });
      
      if (result.success) {
        toast({
          title: 'Update Channel Changed',
          description: `Set to ${channel} channel. Changes will apply on next update check.`
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error setting update channel:', error);
      return { success: false, error: String(error) };
    }
  }, [isElectronApp, toast]);
  
  // Register as beta tester
  const registerAsBetaTester = useCallback((id: string) => {
    setBetaUserId(id);
    setBetaId(id);
    
    toast({
      title: 'Beta Testing Enabled',
      description: 'Your installation is now registered for beta updates.'
    });
    
    return true;
  }, [toast]);
  
  return {
    status,
    updateInfo,
    isSupported: isElectronApp,
    checkForUpdates,
    setUpdateChannel,
    currentEnvironment: getCurrentEnvironment(),
    betaId,
    registerAsBetaTester
  };
}
