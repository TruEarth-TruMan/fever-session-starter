
#!/usr/bin/env node
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

// Get absolute path to the project root directory
const rootDir = path.resolve(__dirname);
console.log(`Root directory for build-electron.cjs: ${rootDir}`);
console.log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);

// Check if we're in fever-session-starter folder
if (rootDir.includes('fever-session-starter')) {
  console.log('✓ Correct project directory detected: fever-session-starter');
} else {
  console.log('⚠️ Warning: Not running from fever-session-starter directory');
}

// Explicitly set up the paths to the script modules with proper path resolution
const scriptsDir = path.join(rootDir, 'scripts');
console.log(`Scripts directory: ${scriptsDir}`);
console.log(`Scripts directory exists: ${fs.existsSync(scriptsDir)}`);
if (fs.existsSync(scriptsDir)) {
  console.log(`Files in scripts directory: ${fs.readdirSync(scriptsDir).join(', ')}`);
}

// Import utility functions from scripts with explicit path resolution
try {
  const { setupBuildDirectories } = require(path.join(scriptsDir, 'setupBuildDirs'));
  const { generateMacOSEntitlements } = require(path.join(scriptsDir, 'generateEntitlements'));
  const { generateUpdateExample } = require(path.join(scriptsDir, 'generateUpdateExample'));
  const { ensureDirectories } = require(path.join(scriptsDir, 'ensureDirectories'));
  const { checkViteBuild } = require(path.join(scriptsDir, 'checkViteBuild'));
  const { loadElectronConfig } = require(path.join(scriptsDir, 'loadElectronConfig'));

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

      // Check Vite build using utility function
      checkViteBuild(rootDir);

      // Load electron-builder config using utility function
      const config = loadElectronConfig(rootDir);
      console.log('Electron builder config loaded successfully');

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
      console.log('To make them available for auto-updates and downloads, copy:');
      console.log(' - Windows installers to: public/download/win/');
      console.log(' - macOS installers to: public/download/mac/');
      
      process.exit(0);
    } catch (error) {
      console.error('Build failed:', error);
      process.exit(1);
    }
  }

  // Run the build process
  console.log("Starting build-electron.cjs script");
  buildApp();
} catch (error) {
  console.error(`Failed to import required modules: ${error.message}`);
  console.error(`Current directory: ${process.cwd()}`);
  console.error(`Scripts directory path: ${scriptsDir}`);
  console.error(`Does scripts directory exist: ${fs.existsSync(scriptsDir)}`);
  if (fs.existsSync(scriptsDir)) {
    console.error(`Contents of scripts directory: ${fs.readdirSync(scriptsDir).join(', ')}`);
  }
  process.exit(1);
}
