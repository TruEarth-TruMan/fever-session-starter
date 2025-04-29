
/**
 * Entry point for checking Vite build and compiling Electron files
 * This file has been refactored into smaller modules for better maintainability
 */
const fs = require('fs');
const path = require('path');

function checkViteBuild(rootDir) {
  console.log('Checking for Vite build...');
  
  const distDir = path.join(rootDir, 'dist');
  const indexFile = path.join(distDir, 'index.html');
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist directory does not exist. Please run the Vite build first.');
    throw new Error('Vite build not found. Please run npm run build first.');
  }
  
  if (!fs.existsSync(indexFile)) {
    console.error('❌ index.html not found in dist directory. Vite build seems incomplete.');
    throw new Error('Vite build is incomplete. Missing index.html');
  }
  
  console.log('✅ Vite build found successfully.');
  return true;
}

module.exports = { checkViteBuild };
