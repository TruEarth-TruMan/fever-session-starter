
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { setupBuildDirectories } = require('./scripts/setupBuildDirs');
const { generateMacOSEntitlements } = require('./scripts/generateEntitlements');
const { generateUpdateExample } = require('./scripts/generateUpdateExample');
const config = require('./electron-builder.js');

// Create output directories if they don't exist
const ensureDirectoriesExist = () => {
  const publicDownloadDirs = [
    path.join(__dirname, 'public', 'download', 'win'),
    path.join(__dirname, 'public', 'download', 'mac')
  ];
  
  publicDownloadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Main build process
async function buildApp() {
  try {
    // Set up build environment
    console.log('Setting up build environment...');
    const rootDir = __dirname;
    const { buildDir } = setupBuildDirectories(rootDir);

    // Generate required files
    console.log('Generating entitlements and update manifest...');
    generateMacOSEntitlements(buildDir);
    generateUpdateExample(rootDir);
    
    // Ensure download directories exist
    ensureDirectoriesExist();

    // Check if Vite build exists, if not, run it
    if (!fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
      console.log('Vite build not found. Running build process...');
      try {
        execSync('npm run build', { stdio: 'inherit' });
      } catch (error) {
        console.error('Vite build failed:', error.message);
        process.exit(1);
      }
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

    // Copy artifacts to public download folders if needed
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
buildApp();
