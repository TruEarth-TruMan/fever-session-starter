
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

/**
 * Enhanced logging for update process
 */
export function logUpdate(message: string, details?: any): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[UPDATE ${timestamp}] ${message}`;
  
  console.log(logMessage);
  if (details) {
    console.log('Details:', details);
  }
  
  // In production, we could also save logs to a file
  if (process.env.NODE_ENV === 'production') {
    try {
      const logDir = path.join(app.getPath('userData'), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, 'update.log');
      fs.appendFileSync(logFile, `${logMessage}\n`);
      if (details) {
        fs.appendFileSync(logFile, `Details: ${JSON.stringify(details)}\n`);
      }
    } catch (err) {
      console.error('Failed to write update log:', err);
    }
  }
}
