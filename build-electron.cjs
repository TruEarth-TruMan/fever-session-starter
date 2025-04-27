
#!/usr/bin/env node
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Import utility functions from scripts
const { setupBuildDirectories } = require('./scripts/setupBuildDirs');
const { generateMacOSEntitlements } = require('./scripts/generateEntitlements');
const { generateUpdateExample } = require('./scripts/generateUpdateExample');
const { ensureDirectories } = require('./scripts/ensureDirectories');

// Main build process
async function buildApp() {
  try {
    // Set up build environment
    console.log('Setting up build environment...');
    const rootDir = __dirname;
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

    // Check if Vite build exists
    const distPath = path.join(rootDir, 'dist', 'index.html');
    console.log(`Checking for Vite build at: ${distPath}`);
    
    if (!fs.existsSync(distPath)) {
      console.log('Vite build not found. Running build process...');
      try {
        execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
      } catch (error) {
        console.error('Vite build failed:', error.message);
        process.exit(1);
      }
    } else {
      console.log('Vite build found. Proceeding with Electron build...');
    }

    // Load electron-builder config
    const configPath = path.join(rootDir, 'electron-builder.js');
    console.log(`Loading config from: ${configPath}`);
    
    if (!fs.existsSync(configPath)) {
      console.error(`Config not found: ${configPath}`);
      process.exit(1);
    }
    
    const config = require(configPath);

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

