
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, User, UserPlus } from 'lucide-react';
import { useAppUpdater } from '@/hooks/useAppUpdater';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getUserUpdatePreferences, saveUpdatePreferences } from '@/utils/updateConfig';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { getAppVersion } from '@/utils/appInfo';

export const UpdatesMenu: React.FC = () => {
  const { status, updateInfo, isSupported, setUpdateChannel, currentEnvironment, betaId, registerAsBetaTester } = useAppUpdater();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preferences, setPreferences] = useState(() => getUserUpdatePreferences());
  const [betaCodeInput, setBetaCodeInput] = useState('');
  const [appVersion, setAppVersion] = useState<string>('');
  
  React.useEffect(() => {
    // Get app version for display
    getAppVersion().then(version => {
      setAppVersion(version);
    });
  }, []);
  
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

  const handleBetaRegistration = () => {
    if (betaCodeInput.trim()) {
      registerAsBetaTester(betaCodeInput.trim());
      setBetaCodeInput('');
    }
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Settings</DialogTitle>
            <DialogDescription>
              Configure how and when Fever checks for updates.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Version</h3>
              <p className="text-sm text-muted-foreground">
                Fever {appVersion} ({currentEnvironment})
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Update Channel</h3>
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
              <h3 className="text-sm font-medium">Auto-Update Settings</h3>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-check" 
                  checked={preferences.autoCheck}
                  onCheckedChange={handleAutoCheckChange}
                />
                <Label htmlFor="auto-check">Check for updates automatically</Label>
              </div>
            </div>
            
            {/* Beta tester registration section */}
            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                Beta Testing Program
              </h3>
              
              {betaId ? (
                <div className="flex items-center space-x-2 text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded">
                  <User className="h-4 w-4 text-blue-500" />
                  <span>Registered beta tester: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{betaId}</code></span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Enter your beta tester code to register for early access updates.
                  </p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Beta tester code" 
                      value={betaCodeInput}
                      onChange={(e) => setBetaCodeInput(e.target.value)}
                      className="text-sm h-8"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBetaRegistration}
                      disabled={!betaCodeInput.trim()}
                    >
                      Register
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Status</h3>
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
