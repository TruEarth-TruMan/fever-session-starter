
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useAppUpdater } from '@/hooks/useAppUpdater';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getUserUpdatePreferences, saveUpdatePreferences } from '@/utils/updateConfig';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const UpdatesMenu: React.FC = () => {
  const { status, updateInfo, isSupported, setUpdateChannel, currentEnvironment } = useAppUpdater();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preferences, setPreferences] = useState(() => getUserUpdatePreferences());
  
  if (!isSupported) {
    return null; // Don't show in web version
  }
  
  const handleChannelChange = async (channel: string) => {
    setPreferences(prev => ({
      ...prev,
      channel
    }));
    
    await setUpdateChannel(channel);
    saveUpdatePreferences({
      ...preferences,
      channel
    });
  };
  
  const handleAutoCheckChange = (checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      autoCheck: checked
    }));
    saveUpdatePreferences({
      ...preferences,
      autoCheck: checked
    });
  };
  
  let statusColor = "text-gray-400";
  
  if (status === 'downloading') {
    statusColor = "text-blue-500";
  } else if (status === 'downloaded') {
    statusColor = "text-green-500";
  } else if (status === 'error') {
    statusColor = "text-red-500";
  }
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        <Download className={`h-4 w-4 ${statusColor}`} />
        {status === 'downloaded' && <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>}
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Settings</DialogTitle>
            <DialogDescription>
              Configure how and when Fever checks for updates.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Current Environment</h3>
              <p className="text-sm text-muted-foreground">
                You are running in {currentEnvironment} mode.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Update Channel</h3>
              <RadioGroup 
                value={preferences.channel} 
                onValueChange={handleChannelChange}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="latest" id="latest" />
                  <Label htmlFor="latest">Stable (recommended)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beta" id="beta" />
                  <Label htmlFor="beta">Beta (preview features)</Label>
                </div>
                {currentEnvironment === 'development' && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dev" id="dev" />
                    <Label htmlFor="dev">Development (unstable)</Label>
                  </div>
                )}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Auto-Update Settings</h3>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-check" 
                  checked={preferences.autoCheck}
                  onCheckedChange={handleAutoCheckChange}
                />
                <Label htmlFor="auto-check">Check for updates automatically</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Current Status</h3>
              <p className="text-sm capitalize">
                Status: <span className={statusColor}>{status}</span>
              </p>
              
              {updateInfo.version && (
                <p className="text-sm">Latest version: {updateInfo.version}</p>
              )}
              
              {status === 'error' && updateInfo.error && (
                <p className="text-sm text-red-500">{updateInfo.error}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdatesMenu;
