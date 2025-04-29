
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAppVersion, logTelemetry } from '@/utils/appInfo';
import { isElectron, getPlatform } from '@/utils/environment';
import { useAppConfig } from '@/utils/appConfig';
import { getAudioDevices } from '@/utils/audioDeviceDetection';

export function AppDiagnostics() {
  const [appVersion, setAppVersion] = useState<string>('Loading...');
  const [platform, setPlatform] = useState<string>('Detecting...');
  const [audioDeviceCount, setAudioDeviceCount] = useState<number>(0);
  const [telemetryStatus, setTelemetryStatus] = useState<string>('Not tested');
  const appConfig = useAppConfig();

  useEffect(() => {
    async function loadDiagnostics() {
      try {
        // Get app version
        const version = await getAppVersion();
        setAppVersion(version);
        
        // Get platform
        const detectedPlatform = getPlatform();
        setPlatform(detectedPlatform);
        
        // Get audio devices
        const devices = await getAudioDevices();
        setAudioDeviceCount(devices.length);
        
        console.log('Diagnostics loaded successfully');
      } catch (error) {
        console.error('Error loading diagnostics:', error);
      }
    }
    
    loadDiagnostics();
  }, []);

  const handleSendTelemetry = async () => {
    try {
      setTelemetryStatus('Sending...');
      const success = await logTelemetry({
        event: 'diagnostics_test',
        timestamp: new Date().toISOString(),
        platform: platform,
        version: appVersion
      });
      
      setTelemetryStatus(success ? 'Sent successfully' : 'Failed to send');
    } catch (error) {
      console.error('Error sending telemetry:', error);
      setTelemetryStatus('Error: ' + (error as Error).message);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>App Diagnostics</CardTitle>
        <CardDescription>
          Check the status of Electron integration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Running in Electron:</div>
          <div>{isElectron() ? 'Yes ✓' : 'No ✗'}</div>
          
          <div className="font-medium">App Version:</div>
          <div>{appVersion}</div>
          
          <div className="font-medium">Platform:</div>
          <div>{platform}</div>
          
          <div className="font-medium">Environment:</div>
          <div>{appConfig.environment}</div>
          
          <div className="font-medium">Audio Devices:</div>
          <div>{audioDeviceCount} detected</div>
          
          <div className="font-medium">Telemetry Status:</div>
          <div>{telemetryStatus}</div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSendTelemetry} 
          variant="default" 
          className="w-full"
        >
          Test Telemetry IPC
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AppDiagnostics;
