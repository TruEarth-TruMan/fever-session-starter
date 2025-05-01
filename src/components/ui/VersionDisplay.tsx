
import { useState, useEffect } from 'react';

interface AppVersionInfo {
  version: string;
  environment: 'development' | 'production';
}

export const VersionDisplay = () => {
  const [appInfo, setAppInfo] = useState<AppVersionInfo>({
    version: '1.0.0',
    environment: process.env.NODE_ENV as 'development' | 'production'
  });

  useEffect(() => {
    // Get version from Electron if available
    if (window.electron?.getAppVersion) {
      window.electron.getAppVersion()
        .then((version) => {
          setAppInfo(prev => ({ ...prev, version }));
        })
        .catch((err) => {
          console.error('Failed to get app version:', err);
        });
    }
  }, []);

  return (
    <div className="text-xs text-muted-foreground opacity-70 hover:opacity-100 transition-opacity">
      Fever v{appInfo.version}
      {appInfo.environment === 'development' && ' (Dev)'}
    </div>
  );
};
