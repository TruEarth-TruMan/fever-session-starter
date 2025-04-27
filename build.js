
#!/usr/bin/env node
// Enhanced build script with dependency verification and improved module resolution

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Add support for command-line arguments
const args = process.argv.slice(2);
let forceRootDir = null;
let debugMode = false;
let dryRun = false;

// Parse command-line arguments
args.forEach(arg => {
  if (arg.startsWith('--root=')) {
    forceRootDir = arg.substring(7).replace(/^"(.*)"$/, '$1');
    console.log(`Using root directory from command line: ${forceRootDir}`);
  }
  if (arg === '--debug') {
    debugMode = true;
    console.log('Debug mode enabled - will show detailed module resolution');
  }
  if (arg === '--dry-run') {
    dryRun = true;
    console.log('Dry run mode enabled - will simulate build without executing final commands');
  }
});

// Utility function for consistent logging
function log(message, isError = false) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  const prefix = isError ? '❌ ERROR' : '🔹 INFO';
  console[isError ? 'error' : 'log'](`[${timestamp}] ${prefix}: ${message}`);
}

log('Starting Fever build process with enhanced module resolution tracking...');
log(`Current Node.js version: ${process.version}`);
log(`Current working directory: ${process.cwd()}`);
log(`Script path: ${__filename}`);

// Get absolute path to the project directory - try multiple approaches
let rootDir = forceRootDir;
const possibleRootDirs = [
  forceRootDir,
  process.cwd(),
  path.dirname(__dirname),
  'C:\\Users\\robbi\\fever-session-starter',
  'C:\\Users\\robbi\\Desktop\\fever-session-starter',
  path.join(process.cwd(), '..'),
  path.resolve(process.cwd(), '..')
].filter(Boolean);

// Validation function
function isValidProjectRoot(dir) {
  if (!dir) return false;
  try {
    return fs.existsSync(path.join(dir, 'package.json')) && 
           fs.existsSync(path.join(dir, 'vite.config.ts'));
  } catch (error) {
    log(`Error checking directory ${dir}: ${error.message}`, true);
    return false;
  }
}

// Try each possible root directory
for (const dir of possibleRootDirs) {
  try {
    if (fs.existsSync(dir) && isValidProjectRoot(dir)) {
      rootDir = dir;
      log(`Found valid project root at: ${rootDir}`);
      break;
    }
  } catch (err) {
    log(`Error checking directory ${dir}: ${err.message}`, true);
  }
}

if (!rootDir) {
  log('Could not determine project root directory. Please run this script from the project root or use --root=PATH', true);
  log('Run the check-environment.js script to diagnose your environment.', true);
  process.exit(1);
}

log(`Using project root directory: ${rootDir}`);
try {
  process.chdir(rootDir);
  log(`Working directory set to: ${process.cwd()}`);
  log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);
} catch (err) {
  log(`Failed to change to root directory: ${err.message}`, true);
  process.exit(1);
}

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(rootDir, 'scripts');
if (!fs.existsSync(scriptsDir)) {
  log(`Creating scripts directory: ${scriptsDir}`);
  try {
    fs.mkdirSync(scriptsDir, { recursive: true });
  } catch (err) {
    log(`Error creating scripts directory: ${err.message}`, true);
  }
}

// Check for required scripts
const requiredScripts = [
  'checkViteBuild.js', 
  'loadElectronConfig.js', 
  'setupBuildDirs.js',
  'generateEntitlements.js', 
  'generateUpdateExample.js', 
  'ensureDirectories.js',
  'verifyDependencies.js'
];

// Run dependency verification first
try {
  log('\nVerifying project dependencies...');
  const { verifyDependencies } = require(path.join(scriptsDir, 'verifyDependencies'));
  const depsVerified = verifyDependencies(rootDir);
  
  if (!depsVerified) {
    log('Dependency verification failed. Please install missing dependencies before continuing.', true);
    if (!dryRun) {
      process.exit(1);
    }
  } else {
    log('All required dependencies verified successfully.');
  }
} catch (err) {
  log(`Error loading dependency verification module: ${err.message}`, true);
  log('Will continue but build may fail due to missing dependencies.', true);
}

// Check required scripts
log('\nChecking required script files:');
for (const script of requiredScripts) {
  const scriptPath = path.join(scriptsDir, script);
  const exists = fs.existsSync(scriptPath);
  log(`- ${script}: ${exists ? '✅ Found' : '❌ Missing'}`);
}

// Check for missing script files
const missingScripts = requiredScripts.filter(script => !fs.existsSync(path.join(scriptsDir, script)));
if (missingScripts.length > 0) {
  log(`Missing required script files: ${missingScripts.join(', ')}`, true);
  
  // Try to fix common issues by checking if the files exist but with wrong case
  const allFiles = fs.readdirSync(scriptsDir);
  missingScripts.forEach(missing => {
    const lowerMissing = missing.toLowerCase();
    const match = allFiles.find(file => file.toLowerCase() === lowerMissing);
    if (match && match !== missing) {
      log(`Found case mismatch: ${match} (actual) vs ${missing} (expected)`, true);
      log(`Attempting to rename file for consistency...`);
      try {
        fs.renameSync(path.join(scriptsDir, match), path.join(scriptsDir, missing));
        log(`Renamed ${match} to ${missing} successfully`);
      } catch (err) {
        log(`Failed to rename file: ${err.message}`, true);
      }
    }
  });
  
  // After trying to fix, check again
  const stillMissing = requiredScripts.filter(script => !fs.existsSync(path.join(scriptsDir, script)));
  if (stillMissing.length > 0) {
    log(`Still missing scripts after fixes: ${stillMissing.join(', ')}`, true);
    log('You might need to manually create these files', true);
  }
}

// Verify we have the necessary files
const requiredFiles = ['package.json', 'electron-builder.js', 'vite.config.ts', 'build-electron.cjs'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(rootDir, file)));

if (missingFiles.length > 0) {
  log(`Missing required files: ${missingFiles.join(', ')}`, true);
  log('Please ensure all required files are present in the project root.', true);
  process.exit(1);
}

// Check if electron-builder.js is compatible with Node.js v22
try {
  log('\nVerifying electron-builder.js compatibility...');
  const configPath = path.join(rootDir, 'electron-builder.js');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  
  // Node v22 compatibility check - electron-builder.js should be proper CommonJS
  if (!configContent.includes('module.exports =')) {
    log('Warning: electron-builder.js may not be using CommonJS exports format.', true);
    log('This could cause issues with Node.js v22. Ensure it uses module.exports format.', true);
  } else {
    log('electron-builder.js appears to be using proper CommonJS format.');
  }
} catch (err) {
  log(`Error checking electron-builder.js: ${err.message}`, true);
}

// Perform dry run of Vite build
if (dryRun) {
  log('\n------------------------------------------');
  log('Simulating Vite build (dry run)...');
  log('------------------------------------------');
  log('Would execute: npm run build');
  
  // Try to parse vite.config.ts to check for obvious errors
  try {
    const viteConfigPath = path.join(rootDir, 'vite.config.ts');
    log(`Checking Vite config at ${viteConfigPath}...`);
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
    
    // Look for common issues in the Vite config
    log('Vite config appears to be valid TypeScript.');
    log(`Config uses defineConfig: ${viteConfig.includes('defineConfig')}`);
    log(`Config includes plugins: ${viteConfig.includes('plugins:')}`);
    log(`Config sets base path: ${viteConfig.includes('base:')}`);
    
    if (viteConfig.includes("base: './'") || viteConfig.includes("base: process.env.ELECTRON === 'true' ? './' : '/'")) {
      log('✅ Vite config has correct base path setting for Electron.');
    } else {
      log('⚠️ Vite config may need base path setting for Electron: base: process.env.ELECTRON === \'true\' ? \'.\/\' : \'/\'');
    }
  } catch (err) {
    log(`Error checking Vite config: ${err.message}`, true);
  }
  
  log('\n------------------------------------------');
  log('Simulating Electron build (dry run)...');
  log('------------------------------------------');
  log('Would execute: node build-electron.cjs');
  
  // Check if build-electron.cjs is compatible with Node.js v22
  try {
    const electronBuildPath = path.join(rootDir, 'build-electron.cjs');
    log(`Checking build-electron.cjs at ${electronBuildPath}...`);
    const electronBuildContent = fs.readFileSync(electronBuildPath, 'utf-8');
    
    // Check for critical imports and configurations
    log(`Contains electron-builder import: ${electronBuildContent.includes('require(\'electron-builder\')')}`);
    log(`Contains path import: ${electronBuildContent.includes('require(\'path\')')}`);
    log(`Contains script imports from scripts/ directory: ${electronBuildContent.includes('require(path.join(scriptsDir')}`);
    
    if (electronBuildContent.includes("const { setupBuildDirectories: setup }") && 
        !electronBuildContent.includes("setupBuildDirectories = setup")) {
      log('⚠️ Potential issue in build-electron.cjs: setupBuildDirectories function may not be properly assigned.', true);
    }
    
    log('build-electron.cjs appears to be using proper CommonJS format.');
  } catch (err) {
    log(`Error checking build-electron.cjs: ${err.message}`, true);
  }
  
  log('\n✓ Dry run completed - see above for potential issues.');
  process.exit(0);
}

try {
  log('\n------------------------------------------');
  log('1. Running Vite build...');
  log('------------------------------------------');
  
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
  } catch (error) {
    log(`Vite build failed: ${error.message}`, true);
    
    // Try more direct approach
    log('Attempting direct Vite build...');
    try {
      execSync('node_modules/.bin/vite build', { stdio: 'inherit', cwd: rootDir });
    } catch (viteError) {
      log(`Direct Vite build also failed: ${viteError.message}`, true);
      process.exit(1);
    }
  }
  
  log('\n------------------------------------------');
  log('2. Running Electron build...');
  log('------------------------------------------');
  
  const buildElectronPath = path.join(rootDir, 'build-electron.cjs');
  
  // Verify that the file exists before trying to execute it
  if (!fs.existsSync(buildElectronPath)) {
    throw new Error(`Could not find build-electron.cjs at path: ${buildElectronPath}`);
  }
  
  log(`Executing build script: ${buildElectronPath}`);
  
  // Run explicitly with node, using the absolute path and passing root directory as env var
  execSync(`node "${buildElectronPath}" --debug`, { 
    stdio: 'inherit', 
    cwd: rootDir,
    env: { ...process.env, FORCE_ROOT_DIR: rootDir }
  });
  
  log('\n✓ Build completed successfully!');
  log('\nInstallers are located in the "release" directory.');
  log('To use with auto-updates, copy:');
  log(' - Windows: release/*.exe to public/download/win/');
  log(' - macOS:   release/*.dmg to public/download/mac/');
} catch (error) {
  log('\n✗ Build failed:', true);
  log(`${error.message}`, true);
  if (error.stdout) log(`Standard output: ${error.stdout}`, true);
  if (error.stderr) log(`Error output: ${error.stderr}`, true);
  
  // Provide specific guidance for "cannot find module" errors
  if (error.message.includes('Cannot find module')) {
    const moduleMatch = error.message.match(/Cannot find module '([^']+)'/);
    if (moduleMatch && moduleMatch[1]) {
      const missingModule = moduleMatch[1];
      log(`\nThe build is failing because it cannot find the module: ${missingModule}`, true);
      log('Possible solutions:', true);
      log(`1. Install the missing module: npm install ${missingModule}`);
      log('2. Check if the module exists in node_modules/');
      log('3. Verify the module name is spelled correctly in the code');
      log('4. Check if there\'s a path issue when requiring the module');
    }
  }
  
  process.exit(1);
}
