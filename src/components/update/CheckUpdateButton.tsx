
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Check, AlertTriangle } from 'lucide-react';
import { useAppUpdater } from '@/hooks/useAppUpdater';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

export const CheckUpdateButton: React.FC = () => {
  const { status, updateInfo, checkForUpdates, isSupported } = useAppUpdater();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleCheckForUpdates = async () => {
    await checkForUpdates();
    setDialogOpen(true);
  };
  
  if (!isSupported) {
    return null; // Don't show in web version
  }
  
  // Determine button appearance based on status
  let icon = <RefreshCw className="h-4 w-4" />;
  let label = "Check for Updates";
  let variant: "default" | "outline" | "secondary" | "ghost" = "outline";
  
  if (status === 'checking') {
    icon = <RefreshCw className="h-4 w-4 animate-spin" />;
    label = "Checking...";
    variant = "outline";
  } else if (status === 'downloading') {
    icon = <Download className="h-4 w-4" />;
    label = "Downloading Update...";
    variant = "secondary";
  } else if (status === 'downloaded') {
    icon = <Check className="h-4 w-4" />;
    label = "Update Ready";
    variant = "default";
  } else if (status === 'error') {
    icon = <AlertTriangle className="h-4 w-4" />;
    label = "Update Error";
    variant = "outline";
  }
  
  return (
    <>
      <Button 
        variant={variant} 
        size="sm" 
        onClick={handleCheckForUpdates}
        disabled={status === 'checking' || status === 'downloading'}
        className="gap-2"
      >
        {icon}
        {label}
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {status === 'checking' && "Checking for Updates..."}
              {status === 'available' && "Update Available"}
              {status === 'not-available' && "No Updates Available"}
              {status === 'downloading' && "Downloading Update..."}
              {status === 'downloaded' && "Update Ready to Install"}
              {status === 'error' && "Update Error"}
            </DialogTitle>
            <DialogDescription className="space-y-4">
              {status === 'checking' && (
                <p>Contacting update server...</p>
              )}
              
              {status === 'not-available' && (
                <p>You're already running the latest version.</p>
              )}
              
              {status === 'available' && (
                <>
                  <p>A new version is available and will be downloaded automatically.</p>
                  {updateInfo.version && <p className="font-medium">Version: {updateInfo.version}</p>}
                </>
              )}
              
              {status === 'downloading' && updateInfo.progress && (
                <>
                  <p>Downloading the latest version...</p>
                  <Progress value={updateInfo.progress.percent} className="w-full" />
                  <p>{Math.round(updateInfo.progress.percent || 0)}%</p>
                </>
              )}
              
              {status === 'downloaded' && (
                <>
                  <p>The update has been downloaded and is ready to install.</p>
                  <p>Please restart the application to apply the update.</p>
                  {updateInfo.version && <p className="font-medium">Version: {updateInfo.version}</p>}
                  {updateInfo.notes && (
                    <div className="mt-2">
                      <h4 className="font-medium">Release Notes:</h4>
                      <p className="text-sm">{updateInfo.notes}</p>
                    </div>
                  )}
                </>
              )}
              
              {status === 'error' && (
                <>
                  <p>There was an error checking for updates.</p>
                  {updateInfo.error && <p className="text-red-500">{updateInfo.error}</p>}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            
            {status === 'downloaded' && (
              <Button variant="default" onClick={() => {
                // Restart and install - only works if app has been packaged
                if (window.electron?.quitAndInstall) {
                  window.electron.quitAndInstall();
                } else {
                  setDialogOpen(false);
                }
              }}>
                Restart Now
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckUpdateButton;
