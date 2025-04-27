
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Define path to scripts directory and ensure it exists
const scriptsDir = path.resolve(__dirname, 'scripts');
if (!fs.existsSync(scriptsDir)) {
  console.error(`Scripts directory not found at ${scriptsDir}`);
  process.exit(1);
}

// Explicitly require each module with full path
const setupBuildDirsPath = path.resolve(scriptsDir, 'setupBuildDirs.js');
const generateEntitlementsPath = path.resolve(scriptsDir, 'generateEntitlements.js');
const generateUpdateExamplePath = path.resolve(scriptsDir, 'generateUpdateExample.js');

// Verify each module file exists before requiring
if (!fs.existsSync(setupBuildDirsPath)) {
  console.error(`Module not found: ${setupBuildDirsPath}`);
  process.exit(1);
}

if (!fs.existsSync(generateEntitlementsPath)) {
  console.error(`Module not found: ${generateEntitlementsPath}`);
  process.exit(1);
}

if (!fs.existsSync(generateUpdateExamplePath)) {
  console.error(`Module not found: ${generateUpdateExamplePath}`);
  process.exit(1);
}

// Now require the modules
const { setupBuildDirectories } = require(setupBuildDirsPath);
const { generateMacOSEntitlements } = require(generateEntitlementsPath);
const { generateUpdateExample } = require(generateUpdateExamplePath);

// Config file
const configPath = path.resolve(__dirname, 'electron-builder.js');
if (!fs.existsSync(configPath)) {
  console.error(`Config not found: ${configPath}`);
  process.exit(1);
}
const config = require(configPath);

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
    
    // Verify setupBuildDirectories function exists
    if (typeof setupBuildDirectories !== 'function') {
      throw new Error('setupBuildDirectories is not a function');
    }
    
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
