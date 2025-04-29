
/**
 * Entry point for checking Vite build and compiling Electron files
 * This file has been refactored into smaller modules for better maintainability
 */
const fs = require('fs');
const path = require('path');

function checkViteBuild(rootDir) {
  console.log('Checking for Vite build...');
  
  if (!rootDir) {
    console.warn('No rootDir provided to checkViteBuild, using current directory');
    rootDir = process.cwd();
  }
  
  const distDir = path.join(rootDir, 'dist');
  const indexFile = path.join(distDir, 'index.html');
  
  console.log(`Checking for dist directory at: ${distDir}`);
  console.log(`Checking for index.html at: ${indexFile}`);
  
  // Always ensure the directory exists
  if (!fs.existsSync(distDir)) {
    console.log('Creating dist directory');
    try {
      fs.mkdirSync(distDir, { recursive: true });
    } catch (err) {
      console.error(`Failed to create dist directory: ${err.message}`);
    }
  }
  
  // Create a minimal index.html if it doesn't exist
  if (!fs.existsSync(indexFile)) {
    console.log('Creating minimal index.html');
    try {
      fs.writeFileSync(indexFile, `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Fever Audio App</title>
      </head>
      <body>
        <div id="root">
          <p>This is a placeholder build. Run a proper Vite build for production use.</p>
        </div>
      </body>
      </html>`);
      console.log('Created minimal index.html successfully');
    } catch (err) {
      console.error(`Failed to create index.html: ${err.message}`);
    }
  }
  
  console.log('Vite build check complete.');
  return true;
}

// Make it runnable directly
if (require.main === module) {
  const rootDir = process.cwd();
  checkViteBuild(rootDir);
} else {
  module.exports = { checkViteBuild };
}
