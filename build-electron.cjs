
#!/usr/bin/env node
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

// Get absolute path to the current directory
const currentDir = process.cwd();
console.log(`Current directory for build-electron.cjs: ${currentDir}`);
console.log(`Script path: ${__filename}`);

// If FORCE_ROOT_DIR is set, use that as the root directory
let rootDir = process.env.FORCE_ROOT_DIR || currentDir;
console.log(`Using root directory from environment: ${rootDir}`);

// Hard-coded path fallback if needed
if (!fs.existsSync(path.join(rootDir, 'package.json'))) {
  console.log('No package.json found in provided rootDir, trying fallback paths...');
  
  // Try some common paths
  const possiblePaths = [
    currentDir,
    path.join(currentDir, '..'),
    path.join(currentDir, '..', 'fever-session-starter'),
    'C:\\Users\\robbi\\fever-session-starter'
  ];
  
  for (const possiblePath of possiblePaths) {
    console.log(`Checking path: ${possiblePath}`);
    if (fs.existsSync(path.join(possiblePath, 'package.json'))) {
      rootDir = possiblePath;
      console.log(`Found package.json at: ${possiblePath}`);
      break;
    }
  }
}

console.log(`Using project root directory: ${rootDir}`);
console.log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);

// Change to the root directory
process.chdir(rootDir);
console.log(`Changed working directory to: ${process.cwd()}`);

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(rootDir, 'scripts');
if (!fs.existsSync(scriptsDir)) {
  console.log(`Creating scripts directory: ${scriptsDir}`);
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Ensure all required script files are in place
console.log("Checking for required script files");

// First verify the check functions actually exist
const checkViteBuildPath = path.join(scriptsDir, 'checkViteBuild.js');
const loadElectronConfigPath = path.join(scriptsDir, 'loadElectronConfig.js');

if (!fs.existsSync(checkViteBuildPath)) {
  console.error(`ERROR: Required script file not found: ${checkViteBuildPath}`);
  process.exit(1);
}

if (!fs.existsSync(loadElectronConfigPath)) {
  console.error(`ERROR: Required script file not found: ${loadElectronConfigPath}`);
  process.exit(1);
}

// Explicitly require them by absolute path
const { checkViteBuild } = require(checkViteBuildPath);
const { loadElectronConfig } = require(loadElectronConfigPath);

// Try to require the other modules - set fallback empty functions if not found
let setupBuildDirectories = () => ({ buildDir: path.join(rootDir, 'build') });
let generateMacOSEntitlements = () => {};
let generateUpdateExample = () => {};
let ensureDirectories = () => {};

try {
  const { setupBuildDirectories: setup } = require(path.join(scriptsDir, 'setupBuildDirs'));
  setupBuildDirectories = setup;
} catch (error) {
  console.warn(`Warning: Could not load setupBuildDirs.js: ${error.message}`);
}

try {
  const { generateMacOSEntitlements: genMac } = require(path.join(scriptsDir, 'generateEntitlements'));
  generateMacOSEntitlements = genMac;
} catch (error) {
  console.warn(`Warning: Could not load generateEntitlements.js: ${error.message}`);
}

try {
  const { generateUpdateExample: genUpdate } = require(path.join(scriptsDir, 'generateUpdateExample'));
  generateUpdateExample = genUpdate;
} catch (error) {
  console.warn(`Warning: Could not load generateUpdateExample.js: ${error.message}`);
}

try {
  const { ensureDirectories: ensureDirs } = require(path.join(scriptsDir, 'ensureDirectories'));
  ensureDirectories = ensureDirs;
} catch (error) {
  console.warn(`Warning: Could not load ensureDirectories.js: ${error.message}`);
}

// Main build process
async function buildApp() {
  try {
    // Set up build environment
    console.log('Setting up build environment...');
    
    // Setup build directories using utility function
    const { buildDir } = setupBuildDirectories(rootDir);
    console.log(`Build directory created: ${buildDir}`);

    // Generate required files using utility functions
    console.log('Generating entitlements and update manifest...');
    generateMacOSEntitlements(buildDir);
    generateUpdateExample(rootDir);
    
    // Ensure download directories exist
    ensureDirectories(rootDir);

    // Check Vite build using utility function - this is critical
    console.log('Checking Vite build...');
    checkViteBuild(rootDir);

    // Load electron-builder config using utility function - this is critical
    console.log('Loading electron-builder config...');
    const config = loadElectronConfig(rootDir);
    console.log('Electron builder config loaded successfully');
    console.log('Config:', JSON.stringify(config, null, 2));

    // Build the app using electron-builder
    console.log('Starting Electron build process...');
    const results = await builder.build({
      config,
      publish: process.env.PUBLISH === 'always' ? 'always' : 'never'
    });

    console.log('Build successful!');
    console.log('Built artifacts:');
    results.forEach(result => {
      console.log(` - ${result.file} (${(result.size / 1024 / 1024).toFixed(2)} MB)`);
    });

    console.log('You can find the installers in the "release" directory.');
    
    process.exit(0);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run the build process
console.log("Starting build-electron.cjs script");
buildApp();
