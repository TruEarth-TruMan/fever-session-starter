
#!/usr/bin/env node
// Simple build script to help run the Electron build process

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Fever build process...');
console.log(`Current Node.js version: ${process.version}`);
console.log(`Current working directory: ${process.cwd()}`);
console.log(`Script path: ${__filename}`);
console.log(`Directory name: ${__dirname}`);

// Get absolute path to the project directory
const currentDir = process.cwd();
const rootDir = currentDir;

console.log(`Using project root directory: ${rootDir}`);
console.log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(rootDir, 'scripts');
if (!fs.existsSync(scriptsDir)) {
  console.log(`Creating scripts directory: ${scriptsDir}`);
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// List of script files we need
const requiredScriptFiles = {
  'checkViteBuild.js': path.join(scriptsDir, 'checkViteBuild.js'),
  'loadElectronConfig.js': path.join(scriptsDir, 'loadElectronConfig.js'),
  'setupBuildDirs.js': path.join(scriptsDir, 'setupBuildDirs.js'),
  'generateEntitlements.js': path.join(scriptsDir, 'generateEntitlements.js'),
  'generateUpdateExample.js': path.join(scriptsDir, 'generateUpdateExample.js'),
  'ensureDirectories.js': path.join(scriptsDir, 'ensureDirectories.js')
};

// Check that all required script files exist
const missingFiles = Object.entries(requiredScriptFiles)
  .filter(([_, filePath]) => !fs.existsSync(filePath))
  .map(([fileName, _]) => fileName);

if (missingFiles.length > 0) {
  console.error(`ERROR: Missing required script files: ${missingFiles.join(', ')}`);
  console.error('Cannot proceed with build process.');
  process.exit(1);
}

// Verify we have the necessary files
const requiredFiles = ['package.json', 'electron-builder.js', 'vite.config.ts'];
const missingProjectFiles = requiredFiles.filter(file => !fs.existsSync(path.join(rootDir, file)));

if (missingProjectFiles.length > 0) {
  console.error(`ERROR: Missing required files: ${missingProjectFiles.join(', ')}`);
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
  execSync(`node "${buildElectronPath}"`, { stdio: 'inherit', env: { ...process.env, FORCE_ROOT_DIR: rootDir } });
  
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
