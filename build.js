
#!/usr/bin/env node
// Simple build script to help run the Electron build process

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Fever build process...');

// Get absolute path to the project directory
const currentDir = process.cwd();
console.log(`Current working directory: ${currentDir}`);

// Try to determine the root directory
let rootDir = currentDir;

// Check if we're in the correct directory by looking for key project files
const isProjectRoot = (dir) => {
  return fs.existsSync(path.join(dir, 'package.json')) && 
         fs.existsSync(path.join(dir, 'electron-builder.js'));
};

// If current directory isn't the project root, try to find it
if (!isProjectRoot(rootDir)) {
  console.log('Not in the project root directory. Attempting to locate it...');
  
  // Check if we're in a subdirectory of the project
  const possibleRoot = path.resolve(rootDir, '..');
  if (isProjectRoot(possibleRoot)) {
    rootDir = possibleRoot;
    console.log(`Found project root at parent directory: ${rootDir}`);
  } else {
    // Check if fever-session-starter exists in parent or sibling directories
    const parentDir = path.dirname(rootDir);
    const feverDir = path.join(parentDir, 'fever-session-starter');
    
    if (fs.existsSync(feverDir) && isProjectRoot(feverDir)) {
      rootDir = feverDir;
      console.log(`Found project root at fever-session-starter: ${rootDir}`);
    } else {
      console.error('ERROR: Could not locate the project root directory.');
      console.error('Please run this script from the fever-session-starter directory.');
      console.error(`Current directory: ${currentDir}`);
      console.error(`Files in current directory: ${fs.readdirSync(currentDir).join(', ')}`);
      process.exit(1);
    }
  }
}

console.log(`Using project root directory: ${rootDir}`);
console.log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);

// Change to the root directory
process.chdir(rootDir);
console.log(`Changed working directory to: ${process.cwd()}`);

// Verify we have the necessary files
const requiredFiles = ['package.json', 'electron-builder.js', 'vite.config.ts'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(rootDir, file)));

if (missingFiles.length > 0) {
  console.error(`ERROR: Missing required files: ${missingFiles.join(', ')}`);
  console.error('Cannot proceed with build process.');
  process.exit(1);
}

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
