
#!/usr/bin/env node
// Enhanced build script with better diagnostics and module resolution tracking

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const Module = require('module');

// Add support for command-line arguments
const args = process.argv.slice(2);
let forceRootDir = null;
let debugMode = false;

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
  // Add more common paths that might be relevant
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
  'ensureDirectories.js'
];

// Helper function to check the content of a module
function analyzeModuleContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const requires = [];
    const regex = /require\(['"]([^'"]+)['"]\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      requires.push(match[1]);
    }
    return { 
      size: content.length, 
      requires,
      lines: content.split('\n').length,
      hasExports: content.includes('module.exports')
    };
  } catch (err) {
    return { error: err.message };
  }
}

// Check required scripts with detailed analysis
log('\nChecking required script files:');
for (const script of requiredScripts) {
  const scriptPath = path.join(scriptsDir, script);
  const exists = fs.existsSync(scriptPath);
  log(`- ${script}: ${exists ? '✅ Found' : '❌ Missing'}`);
  
  if (exists && debugMode) {
    // Analyze the script file
    const analysis = analyzeModuleContent(scriptPath);
    log(`  - File size: ${analysis.size} bytes, ${analysis.lines} lines`);
    log(`  - Has module.exports: ${analysis.hasExports ? 'Yes' : 'No'}`);
    if (analysis.requires && analysis.requires.length > 0) {
      log(`  - Requires modules: ${analysis.requires.join(', ')}`);
      
      // Try to find each required module
      for (const requiredModule of analysis.requires) {
        try {
          // Skip node core modules
          if (Module.builtinModules.includes(requiredModule)) {
            log(`    - ${requiredModule}: Built-in Node.js module`);
            continue;
          }
          
          // Try to resolve the module
          const resolvedPath = require.resolve(requiredModule, {
            paths: [scriptsDir, rootDir, path.join(rootDir, 'node_modules')]
          });
          log(`    - ${requiredModule}: Found at ${resolvedPath}`);
        } catch (err) {
          log(`    - ${requiredModule}: ❌ Not found - ${err.code}`, true);
        }
      }
    }
  }
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
    } else {
      // If the file isn't found even with case-insensitivity, try to find similar files
      const similar = allFiles.filter(file => file.includes(lowerMissing.replace('.js', '')));
      if (similar.length > 0) {
        log(`Possible matches for ${missing}: ${similar.join(', ')}`);
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

// Add script to intercept require calls for debugging
if (debugMode) {
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function wrappedRequire(path) {
    try {
      const result = originalRequire.call(this, path);
      console.log(`  [Module loaded successfully]: ${path}`);
      return result;
    } catch (err) {
      console.error(`  [Module load error]: ${path} - ${err.message}`);
      throw err;
    }
  };
}

// Verify we have the necessary files
const requiredFiles = ['package.json', 'electron-builder.js', 'vite.config.ts', 'build-electron.cjs'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(rootDir, file)));

if (missingFiles.length > 0) {
  log(`Missing required files: ${missingFiles.join(', ')}`, true);
  log('Please ensure all required files are present in the project root.', true);
  process.exit(1);
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
  
  // Debug the module resolution for build-electron.cjs
  if (debugMode) {
    log('Analyzing build-electron.cjs for module requirements:');
    const analysis = analyzeModuleContent(buildElectronPath);
    if (analysis.requires && analysis.requires.length > 0) {
      log(`Required modules from build-electron.cjs: ${analysis.requires.join(', ')}`);
    }
  }
  
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
