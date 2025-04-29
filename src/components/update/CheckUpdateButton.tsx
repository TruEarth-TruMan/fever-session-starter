
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Check, AlertTriangle } from 'lucide-react';
import { useAppUpdater } from '@/hooks/useAppUpdater';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { getAppVersion } from '@/utils/appInfo';

export const CheckUpdateButton: React.FC = () => {
  const { status, updateInfo, checkForUpdates, isSupported, installUpdate } = useAppUpdater();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  
  useEffect(() => {
    // Get current app version
    getAppVersion().then(version => {
      setCurrentVersion(version);
    });
  }, []);
  
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
        <DialogContent className="max-w-md">
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
              {/* Current version info */}
              <div className="text-sm text-muted-foreground mt-1 mb-2">
                Current version: {currentVersion}
              </div>
              
              {status === 'checking' && (
                <div className="space-y-2">
                  <p>Contacting update server...</p>
                  <Progress value={100} className="w-full animate-pulse" />
                </div>
              )}
              
              {status === 'not-available' && (
                <p>You're already running the latest version.</p>
              )}
              
              {status === 'available' && (
                <div className="space-y-2">
                  <p>A new version is available and will be downloaded automatically.</p>
                  {updateInfo.version && (
                    <p className="font-medium">New version: {updateInfo.version}</p>
                  )}
                </div>
              )}
              
              {status === 'downloading' && updateInfo.progress && (
                <div className="space-y-2">
                  <p>Downloading the latest version...</p>
                  <Progress value={updateInfo.progress.percent} className="w-full" />
                  <div className="flex justify-between">
                    <span>{Math.round(updateInfo.progress.percent || 0)}%</span>
                    {updateInfo.progress.bytesPerSecond && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round((updateInfo.progress.bytesPerSecond || 0) / 1024)} KB/s
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {status === 'downloaded' && (
                <div className="space-y-3">
                  <p>The update has been downloaded and is ready to install.</p>
                  <p>Please restart the application to apply the update.</p>
                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-md border border-green-200 dark:border-green-800">
                    {updateInfo.version && (
                      <p className="text-sm font-medium">New version: {updateInfo.version}</p>
                    )}
                    {updateInfo.notes && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Release Notes:</h4>
                        <p className="text-sm mt-1 whitespace-pre-line">{updateInfo.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {status === 'error' && (
                <div className="space-y-2">
                  <p>There was an error checking for updates.</p>
                  {updateInfo.error && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{updateInfo.error}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            
            {status === 'downloaded' && (
              <Button variant="default" onClick={() => {
                // Restart and install
                installUpdate();
                setDialogOpen(false);
              }}>
                Restart Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckUpdateButton;
