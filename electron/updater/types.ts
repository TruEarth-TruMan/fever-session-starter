
import { BrowserWindow } from 'electron';

// Update check statuses that will be sent to the renderer
export enum UpdateStatus {
  CHECKING = 'checking',
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'not-available',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded',
  ERROR = 'error'
}

export interface UpdateConfig {
  channel: string;
  feedUrl: string;
  betaId?: string;
}

export interface UpdaterDependencies {
  mainWindow: BrowserWindow;
}
