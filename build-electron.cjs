
#!/usr/bin/env node
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

// Get absolute path to the current directory
const currentDir = process.cwd();
console.log(`Current directory for build-electron.cjs: ${currentDir}`);

// Determine project root directory
let rootDir = currentDir;

// Check if we're in the correct directory
const isProjectRoot = (dir) => {
  return fs.existsSync(path.join(dir, 'package.json')) && 
         fs.existsSync(path.join(dir, 'electron-builder.js'));
};

// If current directory isn't the project root, try to find it
if (!isProjectRoot(rootDir)) {
  console.log('Not in the project root directory. Attempting to locate it...');
  
  // Check parent directory
  const possibleRoot = path.resolve(rootDir, '..');
  if (isProjectRoot(possibleRoot)) {
    rootDir = possibleRoot;
    console.log(`Found project root at parent directory: ${rootDir}`);
  } else {
    // Look for fever-session-starter directory
    const parentDir = path.dirname(rootDir);
    const feverDir = path.join(parentDir, 'fever-session-starter');
    
    if (fs.existsSync(feverDir) && isProjectRoot(feverDir)) {
      rootDir = feverDir;
      console.log(`Found project root at fever-session-starter: ${rootDir}`);
    } else {
      console.error('ERROR: Could not locate the project root directory.');
      console.error('Please run this script from the fever-session-starter directory.');
      process.exit(1);
    }
  }
}

console.log(`Using project root directory: ${rootDir}`);
console.log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);

// Change to the root directory
process.chdir(rootDir);
console.log(`Changed working directory to: ${process.cwd()}`);

// Explicitly set up the paths to the script modules with proper path resolution
const scriptsDir = path.join(rootDir, 'scripts');
console.log(`Scripts directory: ${scriptsDir}`);

if (!fs.existsSync(scriptsDir)) {
  console.error(`ERROR: Scripts directory not found at: ${scriptsDir}`);
  console.error('Creating scripts directory and necessary files...');
  
  // Create scripts directory if it doesn't exist
  fs.mkdirSync(scriptsDir, { recursive: true });
  
  // Create minimal required script files
  const setupBuildDirsContent = `
const fs = require('fs');
const path = require('path');

function setupBuildDirectories(rootDir) {
  console.log(\`Setting up build directories in \${rootDir}\`);
  
  const buildDir = path.join(rootDir, 'build');
  const iconsDir = path.join(buildDir, 'icons');

  if (!fs.existsSync(buildDir)) {
    console.log(\`Creating build directory: \${buildDir}\`);
    fs.mkdirSync(buildDir, { recursive: true });
  }

  if (!fs.existsSync(iconsDir)) {
    console.log(\`Creating icons directory: \${iconsDir}\`);
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  return { buildDir, iconsDir };
}

module.exports = { setupBuildDirectories };
  `;
  fs.writeFileSync(path.join(scriptsDir, 'setupBuildDirs.js'), setupBuildDirsContent);
  
  // Continue creating other required files...
  // [Additional file creation would go here]
}

// Try to import the modules, with better error handling
try {
  // First check if the files exist
  const requiredScripts = [
    'setupBuildDirs.js',
    'generateEntitlements.js',
    'generateUpdateExample.js',
    'ensureDirectories.js',
    'checkViteBuild.js',
    'loadElectronConfig.js'
  ];
  
  const missingScripts = requiredScripts.filter(script => !fs.existsSync(path.join(scriptsDir, script)));
  
  if (missingScripts.length > 0) {
    console.error(`ERROR: Missing required script files: ${missingScripts.join(', ')}`);
    console.error(`Please ensure these files exist in the scripts directory: ${scriptsDir}`);
    process.exit(1);
  }
  
  // Import the modules
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
  
  if (fs.existsSync(scriptsDir)) {
    console.error(`Contents of scripts directory: ${fs.readdirSync(scriptsDir).join(', ')}`);
  }
  
  process.exit(1);
}
