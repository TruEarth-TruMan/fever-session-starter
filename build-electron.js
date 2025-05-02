
// Entry point for Electron build process
// This script provides a convenient way to build your Electron app

console.log('Starting Fever Electron build process...');

// Import required modules
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Determine the root directory
const rootDir = process.cwd();
console.log(`Running in directory: ${rootDir}`);
console.log(`Node.js version: ${process.version}`);

// Check for build-electron.cjs first
const buildElectronCjs = path.join(rootDir, 'build-electron.cjs');

if (fs.existsSync(buildElectronCjs)) {
  console.log('Found build-electron.cjs, executing it...');
  try {
    execSync(`node "${buildElectronCjs}"`, { 
      stdio: 'inherit',
      env: { ...process.env, FORCE_ROOT_DIR: rootDir }
    });
    console.log('✅ Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
} else {
  // Fall back to the build.js script
  const buildJs = path.join(rootDir, 'build.js');
  
  if (fs.existsSync(buildJs)) {
    console.log('Found build.js, executing it...');
    try {
      execSync(`node "${buildJs}"`, { 
        stdio: 'inherit',
        cwd: rootDir
      });
      console.log('✅ Build completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ Error: Could not find any build script (build-electron.cjs or build.js)');
    console.error('Please make sure you have the correct build scripts in your project.');
    process.exit(1);
  }
}
