
// Simple build script to help run the Electron build process
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Fever build process...');

try {
  console.log('\n1. Running Vite build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n2. Running Electron build...');
  const buildElectronPath = path.join(__dirname, 'build-electron.cjs');
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
