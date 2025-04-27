
#!/usr/bin/env node
// Electron Builder script

const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Ensure we're working in the right directory
const rootDir = __dirname;
console.log(`Root directory for build-electron.cjs: ${rootDir}`);

// Setup build directories
function setupBuildDirectories() {
  console.log(`Setting up build directories in ${rootDir}`);
  
  const buildDir = path.join(rootDir, 'build');
  const iconsDir = path.join(buildDir, 'icons');

  if (!fs.existsSync(buildDir)) {
    console.log(`Creating build directory: ${buildDir}`);
    fs.mkdirSync(buildDir, { recursive: true });
  }

  if (!fs.existsSync(iconsDir)) {
    console.log(`Creating icons directory: ${iconsDir}`);
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  return { buildDir, iconsDir };
}

// Generate macOS entitlements
function generateMacOSEntitlements(buildDir) {
  console.log(`Generating macOS entitlements in ${buildDir}`);
  
  const entitlementsPath = path.join(buildDir, 'entitlements.mac.plist');
  const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.device.audio-input</key>
    <true/>
  </dict>
</plist>`;

  console.log(`Writing entitlements file to: ${entitlementsPath}`);
  fs.writeFileSync(entitlementsPath, entitlementsContent);
  console.log(`Generated entitlements file at ${entitlementsPath}`);
  
  return entitlementsPath;
}

// Generate update example
function generateUpdateExample() {
  console.log(`Generating update example in ${rootDir}`);
  
  // Get package.json version or use default
  let currentVersion = '1.0.1';
  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    console.log(`Reading package.json from: ${packageJsonPath}`);
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      currentVersion = packageJson.version || currentVersion;
      console.log(`Found version in package.json: ${currentVersion}`);
    } else {
      console.warn(`package.json not found at ${packageJsonPath}, using default version: ${currentVersion}`);
    }
  } catch (error) {
    console.warn(`Could not read version from package.json, using default: ${currentVersion}`);
    console.error(error);
  }

  // Create update manifest
  const updateJsonPath = path.join(rootDir, 'fever-update.json');
  const updateJsonContent = {
    version: currentVersion,
    notes: "New version with bug fixes and performance improvements",
    releaseDate: new Date().toISOString(),
    platforms: {
      "darwin-x64": {
        url: `https://feverstudio.live/download/mac/Fever-${currentVersion}-x64.dmg`,
        signature: "", // Optional: Add code signing signature here
      },
      "darwin-arm64": {
        url: `https://feverstudio.live/download/mac/Fever-${currentVersion}-arm64.dmg`,
        signature: "", // Optional: Add code signing signature here
      },
      "win32-x64": {
        url: `https://feverstudio.live/download/win/Fever-${currentVersion}-setup.exe`,
        signature: "", // Optional: Add code signing signature here
      }
    }
  };

  console.log(`Writing update manifest to: ${updateJsonPath}`);
  fs.writeFileSync(
    updateJsonPath, 
    JSON.stringify(updateJsonContent, null, 2),
    'utf-8'
  );
  
  console.log(`Generated update manifest at ${updateJsonPath}`);
  
  // Also copy to public directory for serving during development
  const publicUpdatePath = path.join(rootDir, 'public', 'fever-update.json');
  try {
    // Ensure public directory exists
    const publicDir = path.join(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      console.log(`Creating public directory: ${publicDir}`);
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    console.log(`Copying update manifest to: ${publicUpdatePath}`);
    fs.writeFileSync(
      publicUpdatePath, 
      JSON.stringify(updateJsonContent, null, 2),
      'utf-8'
    );
    console.log(`Copied update manifest to ${publicUpdatePath} for development`);
  } catch (error) {
    console.warn(`Could not copy update manifest to public directory: ${error.message}`);
  }
  
  return updateJsonPath;
}

// Create output directories if they don't exist
const ensureDirectoriesExist = () => {
  const publicDownloadDirs = [
    path.join(rootDir, 'public', 'download', 'win'),
    path.join(rootDir, 'public', 'download', 'mac')
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
    // Set up build environment with more detailed logging
    console.log('Setting up build environment...');
    console.log(`Current directory: ${__dirname}`);
    
    // Setup build directories
    const { buildDir } = setupBuildDirectories();
    console.log(`Build directory created: ${buildDir}`);

    // Generate required files
    console.log('Generating entitlements and update manifest...');
    generateMacOSEntitlements(buildDir);
    generateUpdateExample();
    
    // Ensure download directories exist
    ensureDirectoriesExist();

    // Check if Vite build exists, if not, run it
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

    // Config file - load it directly from the filesystem
    const configPath = path.join(rootDir, 'electron-builder.js');
    console.log(`Loading config from: ${configPath}`);
    
    if (!fs.existsSync(configPath)) {
      console.error(`Config not found: ${configPath}`);
      process.exit(1);
    }
    
    // Explicitly require the config file using the full path
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
