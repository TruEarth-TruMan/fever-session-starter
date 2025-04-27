
#!/usr/bin/env node
// Simple build script to help run the Electron build process

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Utility function for consistent logging
function log(message, isError = false) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  const prefix = isError ? '❌ ERROR' : '🔹 INFO';
  console[isError ? 'error' : 'log'](`[${timestamp}] ${prefix}: ${message}`);
}

log('Starting Fever build process...');
log(`Current Node.js version: ${process.version}`);
log(`Current working directory: ${process.cwd()}`);
log(`Script path: ${__filename}`);

// Get absolute path to the project directory - try multiple approaches
let rootDir = null;
const possibleRootDirs = [
  process.cwd(),
  path.dirname(__dirname),
  'C:\\Users\\robbi\\fever-session-starter'
];

// Validation function
function isValidProjectRoot(dir) {
  return fs.existsSync(path.join(dir, 'package.json')) && 
         fs.existsSync(path.join(dir, 'vite.config.ts'));
}

// Try each possible root directory
for (const dir of possibleRootDirs) {
  try {
    if (fs.existsSync(dir) && isValidProjectRoot(dir)) {
      rootDir = dir;
      log(`Found valid project root at: ${rootDir}`);
      break;
    }
  } catch (err) {
    log(`Error checking directory ${dir}: ${err.message}`, true);
  }
}

if (!rootDir) {
  log('Could not determine project root directory. Please run this script from the project root.', true);
  log('Run the check-environment.js script to diagnose your environment.', true);
  process.exit(1);
}

log(`Using project root directory: ${rootDir}`);
process.chdir(rootDir);
log(`Working directory set to: ${process.cwd()}`);
log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(rootDir, 'scripts');
if (!fs.existsSync(scriptsDir)) {
  log(`Creating scripts directory: ${scriptsDir}`);
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Check for required scripts
const requiredScripts = [
  'checkViteBuild.js', 
  'loadElectronConfig.js', 
  'setupBuildDirs.js',
  'generateEntitlements.js', 
  'generateUpdateExample.js', 
  'ensureDirectories.js'
];

const missingScripts = requiredScripts.filter(script => !fs.existsSync(path.join(scriptsDir, script)));

if (missingScripts.length > 0) {
  log(`Missing required script files: ${missingScripts.join(', ')}`, true);
  log('Please ensure all required script files are present in the scripts directory.', true);
  process.exit(1);
}

// Verify we have the necessary files
const requiredFiles = ['package.json', 'electron-builder.js', 'vite.config.ts', 'build-electron.cjs'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(rootDir, file)));

if (missingFiles.length > 0) {
  log(`Missing required files: ${missingFiles.join(', ')}`, true);
  log('Please ensure all required files are present in the project root.', true);
  process.exit(1);
}

try {
  log('\n1. Running Vite build...');
  execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
  
  log('\n2. Running Electron build...');
  const buildElectronPath = path.join(rootDir, 'build-electron.cjs');
  
  // Verify that the file exists before trying to execute it
  if (!fs.existsSync(buildElectronPath)) {
    throw new Error(`Could not find build-electron.cjs at path: ${buildElectronPath}`);
  }
  
  log(`Executing build script: ${buildElectronPath}`);
  
  // Run explicitly with node, using the absolute path and passing root directory as env var
  execSync(`node "${buildElectronPath}"`, { 
    stdio: 'inherit', 
    cwd: rootDir,
    env: { ...process.env, FORCE_ROOT_DIR: rootDir }
  });
  
  log('\n✓ Build completed successfully!');
  log('\nInstallers are located in the "release" directory.');
  log('To use with auto-updates, copy:');
  log(' - Windows: release/*.exe to public/download/win/');
  log(' - macOS:   release/*.dmg to public/download/mac/');
} catch (error) {
  log('\n✗ Build failed:', true);
  log(`${error.message}`, true);
  if (error.stdout) log(`Standard output: ${error.stdout}`, true);
  if (error.stderr) log(`Error output: ${error.stderr}`, true);
  process.exit(1);
}
