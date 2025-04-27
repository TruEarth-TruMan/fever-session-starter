
// Simple build script to help run the Electron build process
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Fever build process...');

try {
  console.log('\n1. Running Vite build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n2. Running Electron build...');
  const buildElectronPath = path.resolve(__dirname, 'build-electron.cjs');
  
  // Verify that the file exists before trying to execute it
  if (!fs.existsSync(buildElectronPath)) {
    throw new Error(`Could not find build-electron.cjs at path: ${buildElectronPath}`);
  }
  
  execSync(`node "${buildElectronPath}"`, { stdio: 'inherit' });
  
  console.log('\n✓ Build completed successfully!');
  console.log('\nInstallers are located in the "release" directory.');
  console.log('To use with auto-updates, copy:');
  console.log(' - Windows: release/*.exe to public/download/win/');
  console.log(' - macOS:   release/*.dmg to public/download/mac/');
} catch (error) {
  console.error('\n✗ Build failed:', error.message);
  process.exit(1);
}
