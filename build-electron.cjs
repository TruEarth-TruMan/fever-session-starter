
#!/usr/bin/env node
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

// Import utility functions - use absolute paths to avoid resolution issues
const rootDir = process.env.FORCE_ROOT_DIR || process.cwd();
console.log(`Starting build-electron.cjs in: ${rootDir}`);
console.log(`Script path: ${__filename}`);

// Load with explicit paths to avoid module resolution issues
const checkViteBuildPath = path.join(rootDir, 'scripts', 'checkViteBuild.js');
const loadElectronConfigPath = path.join(rootDir, 'scripts', 'loadElectronConfig.js');
const setupBuildDirsPath = path.join(rootDir, 'scripts', 'setupBuildDirs.js');
const generateEntitlementsPath = path.join(rootDir, 'scripts', 'generateEntitlements.js');
const generateUpdateExamplePath = path.join(rootDir, 'scripts', 'generateUpdateExample.js');
const ensureDirectoriesPath = path.join(rootDir, 'scripts', 'ensureDirectories.js');

// Check that modules exist before requiring them
console.log(`Checking for required modules...`);
[checkViteBuildPath, loadElectronConfigPath, setupBuildDirsPath, ensureDirectoriesPath].forEach(modulePath => {
  console.log(`Module ${modulePath} exists: ${fs.existsSync(modulePath)}`);
});

// Import modules with explicit error handling
const { checkViteBuild } = require(checkViteBuildPath);
const { loadElectronConfig } = require(loadElectronConfigPath);
const { setupBuildDirectories } = require(setupBuildDirsPath);
const { generateMacOSEntitlements } = require(generateEntitlementsPath);
const { generateUpdateExample } = require(generateUpdateExamplePath);
const { ensureDirectories } = require(ensureDirectoriesPath);

// Parse command line args
const args = process.argv.slice(2);
let debugMode = args.includes('--debug');

// Change to the root directory
console.log(`Changing to root directory: ${rootDir}`);
process.chdir(rootDir);
console.log(`Current working directory: ${process.cwd()}`);

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

    // Load electron-builder config
    console.log('Loading electron-builder config...');
    const configPath = path.join(rootDir, 'electron-builder.cjs');
    
    // Use direct requiring instead of utility function to simplify
    console.log(`Loading config directly from: ${configPath}`);
    console.log(`Config file exists: ${fs.existsSync(configPath)}`);
    
    // Clear require cache first
    if (require.cache[require.resolve(configPath)]) {
      delete require.cache[require.resolve(configPath)];
    }
    
    const config = require(configPath);
    console.log('Config loaded successfully');
    
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
