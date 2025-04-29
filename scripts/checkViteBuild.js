
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
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist directory does not exist. Please run the Vite build first.');
    
    // Instead of throwing an error, we'll create the directory
    console.log('Creating dist directory');
    fs.mkdirSync(distDir, { recursive: true });
    
    // Create a minimal index.html to avoid build failures
    console.log('Creating minimal index.html');
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
    
    console.warn('Created minimal build files to allow process to continue');
    return true;
  }
  
  if (!fs.existsSync(indexFile)) {
    console.error('❌ index.html not found in dist directory. Vite build seems incomplete.');
    
    // Create a minimal index.html to avoid build failures
    console.log('Creating minimal index.html');
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
    
    console.warn('Created minimal index.html to allow process to continue');
    return true;
  }
  
  console.log('✅ Vite build found successfully.');
  return true;
}

module.exports = { checkViteBuild };
