
#!/usr/bin/env node
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

// Import utility functions
const { checkViteBuild } = require('./scripts/checkViteBuild.js');
const { loadElectronConfig } = require('./scripts/loadElectronConfig.js');
const { setupBuildDirectories } = require('./scripts/setupBuildDirs.js');
const { generateMacOSEntitlements } = require('./scripts/generateEntitlements.js');
const { generateUpdateExample } = require('./scripts/generateUpdateExample.js');
const { ensureDirectories } = require('./scripts/ensureDirectories.js');

// Get absolute path to the current directory
const currentDir = process.cwd();
console.log(`Current directory for build-electron.cjs: ${currentDir}`);
console.log(`Script path: ${__filename}`);

// Parse command line args
const args = process.argv.slice(2);
let debugMode = args.includes('--debug');

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

// Check for electron-builder config explicitly
console.log('Checking for electron-builder config files:');
const possibleConfigs = [
  'electron-builder.cjs', 
  'electron-builder.js', 
  'electron-builder.config.cjs',
  'electron-builder.config.js'
];

let configFound = false;
for (const configFile of possibleConfigs) {
  const configPath = path.join(rootDir, configFile);
  console.log(`Checking ${configFile}: ${fs.existsSync(configPath) ? 'EXISTS' : 'NOT FOUND'}`);
  if (fs.existsSync(configPath)) {
    configFound = true;
  }
}

if (!configFound) {
  console.log('No electron-builder config found, will create one automatically during build process');
}

// Main build process
async function buildApp() {
  try {
    // Set up build environment
    console.log('Setting up build environment...');
    
    // Setup build directories using utility function
    const { buildDir } = setupBuildDirectories(rootDir);
    console.log(`Build directory: ${buildDir}`);

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
    
    if (debugMode) {
      console.log('Config:', JSON.stringify(config, null, 2));
    }

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
    
    if (debugMode && error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    process.exit(1);
  }
}

// Run the build process
console.log("Starting build-electron.cjs script");
buildApp();
