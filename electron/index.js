
try {
  console.log('Loading Electron main process...');
  console.log(`Architecture: ${process.arch}`);
  console.log(`Platform: ${process.platform}`);
  
  require('./main.ts');
} catch (error) {
  console.error('Error in Electron main process:', error);
  
  // Try to show error in UI if possible
  const { app, BrowserWindow, dialog } = require('electron');
  
  app.whenReady().then(() => {
    dialog.showErrorBox(
      'Fever Application Error',
      `The application failed to start properly.\n\nError: ${error.message}\n\nPlease contact support.`
    );
    
    app.quit();
  });
}
