
#!/usr/bin/env node
// Simple build script to help run the Electron build process

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Fever build process...');

// Get absolute path to the project root directory
const rootDir = path.resolve(__dirname);
console.log(`Starting directory: ${process.cwd()}`);
console.log(`Script location: ${__dirname}`);
console.log(`Detected root directory: ${rootDir}`);

// Check if we're in fever-session-starter folder
if (rootDir.includes('fever-session-starter')) {
  console.log('✓ Correct project directory detected: fever-session-starter');
} else {
  console.log('⚠️ Warning: Not running from fever-session-starter directory');
  console.log('Current directory structure:');
  console.log(`Files in directory: ${fs.readdirSync(rootDir).join(', ')}`);
}

process.chdir(rootDir);
console.log(`Changed working directory to: ${process.cwd()}`);

try {
  console.log('\n1. Running Vite build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n2. Running Electron build...');
  const buildElectronPath = path.join(rootDir, 'build-electron.cjs');
  
  // Verify that the file exists before trying to execute it
  if (!fs.existsSync(buildElectronPath)) {
    throw new Error(`Could not find build-electron.cjs at path: ${buildElectronPath}`);
  }
  
  console.log(`Executing build script: ${buildElectronPath}`);
  
  // Run using node with the full absolute path 
  execSync(`node "${buildElectronPath}"`, { stdio: 'inherit' });
  
  console.log('\n✓ Build completed successfully!');
  console.log('\nInstallers are located in the "release" directory.');
  console.log('To use with auto-updates, copy:');
  console.log(' - Windows: release/*.exe to public/download/win/');
  console.log(' - macOS:   release/*.dmg to public/download/mac/');
} catch (error) {
  console.error('\n✗ Build failed:', error.message);
  console.error('\nFull error details:', error);
  process.exit(1);
}
