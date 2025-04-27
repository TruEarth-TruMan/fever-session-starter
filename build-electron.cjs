#!/usr/bin/env node
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

// Get absolute path to the project root directory
const rootDir = path.resolve(__dirname);
console.log(`Root directory: ${rootDir}`);
console.log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);

// Explicitly set up the paths to the script modules with proper path resolution
const scriptsDir = path.join(rootDir, 'scripts');

// Import utility functions from scripts with explicit path resolution
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
    console.log(`Root directory for build-electron.cjs: ${rootDir}`);
    
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
