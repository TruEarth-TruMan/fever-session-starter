
#!/usr/bin/env node

/**
 * Module Verification Utility
 * 
 * This script helps diagnose module loading issues by testing
 * critical dependencies and modules required by the build system.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions for consistent console output
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const prefix = isError ? `${colors.red}[ERROR]${colors.reset}` : `${colors.green}[INFO]${colors.reset}`;
  
  if (isError) {
    console.error(`${prefix} ${timestamp}: ${message}`);
  } else {
    console.log(`${prefix} ${timestamp}: ${message}`);
  }
}

function checkFileExists(filePath, description) {
  log(`Checking for ${description} at: ${filePath}`);
  
  // Check for exact path
  if (fs.existsSync(filePath)) {
    log(`✓ ${description} found at: ${filePath}`, false);
    return { exists: true, path: filePath };
  }
  
  // Check for variations with different extensions
  const extensions = ['', '.js', '.cjs', '.mjs'];
  const basename = filePath.replace(/\.\w+$/, '');
  
  for (const ext of extensions) {
    const pathWithExt = `${basename}${ext}`;
    if (fs.existsSync(pathWithExt)) {
      log(`✓ ${description} found with extension: ${pathWithExt}`, false);
      return { exists: true, path: pathWithExt };
    }
  }
  
  log(`✗ ${description} not found at: ${filePath}`, true);
  return { exists: false, path: null };
}

function testRequire(modulePath, description) {
  log(`Testing require for ${description}: ${modulePath}`);
  
  try {
    require(modulePath);
    log(`✓ Successfully required ${description}`, false);
    return true;
  } catch (error) {
    log(`✗ Failed to require ${description}: ${error.message}`, true);
    
    if (error.code === 'MODULE_NOT_FOUND') {
      const missingModule = error.message.match(/Cannot find module '([^']+)'/);
      if (missingModule && missingModule[1]) {
        log(`Missing module: ${missingModule[1]}`, true);
      }
    }
    
    return false;
  }
}

// Get directories to check
const rootDir = process.cwd();
const scriptsDir = path.join(rootDir, 'scripts');
const diagnosticsDir = path.join(scriptsDir, 'diagnostics');
const coreDir = path.join(diagnosticsDir, 'core');
const utilsDir = path.join(scriptsDir, 'utils');

// Print system information
log(`\n=== Module Verification Utility ===`);
log(`Running verification at: ${new Date().toISOString()}`);
log(`Platform: ${process.platform}`);
log(`Architecture: ${process.arch}`);
log(`Node.js: ${process.version}`);
log(`Current directory: ${rootDir}\n`);

// Check for critical directories
const directories = [
  { path: scriptsDir, name: 'scripts directory' },
  { path: diagnosticsDir, name: 'diagnostics directory' },
  { path: coreDir, name: 'core diagnostics directory' },
  { path: utilsDir, name: 'utils directory' }
];

let hasErrors = false;
directories.forEach(dir => {
  if (!fs.existsSync(dir.path)) {
    log(`${dir.name} not found at: ${dir.path}`, true);
    hasErrors = true;
  } else {
    log(`${dir.name} exists at: ${dir.path}`, false);
  }
});

if (hasErrors) {
  log(`\nDirectory structure issues detected. Creating missing directories...`, false);
  directories.forEach(dir => {
    if (!fs.existsSync(dir.path)) {
      try {
        fs.mkdirSync(dir.path, { recursive: true });
        log(`Created ${dir.name} at: ${dir.path}`, false);
      } catch (err) {
        log(`Failed to create ${dir.name}: ${err.message}`, true);
      }
    }
  });
}

// Check for critical build files
const criticalFiles = [
  { path: path.join(rootDir, 'build.js'), description: 'Main build script' },
  { path: path.join(rootDir, 'build-electron.cjs'), description: 'Electron build script' },
  { path: path.join(rootDir, 'electron-builder.cjs'), description: 'Electron builder config' },
  { path: path.join(scriptsDir, 'diagnose.js'), description: 'Diagnostics script' },
  { path: path.join(utilsDir, 'logger.js'), description: 'Logger utility' },
  { path: path.join(diagnosticsDir, 'core', 'runDiagnostics.js'), description: 'Core diagnostics runner' }
];

criticalFiles.forEach(file => {
  checkFileExists(file.path, file.description);
});

// Test requiring key modules
const modulesToTest = [
  { path: './scripts/utils/logger', description: 'Logger utility' },
  { path: './scripts/diagnostics/core/runDiagnostics', description: 'Diagnostics runner' },
  { path: './scripts/diagnostics/projectValidator', description: 'Project validator' },
  { path: './scripts/diagnostics/nodeCompatibility', description: 'Node compatibility checker' }
];

let requireErrors = false;
modulesToTest.forEach(module => {
  const success = testRequire(module.path, module.description);
  if (!success) {
    requireErrors = true;
  }
});

// Final summary and recommendations
log('\n=== Verification Summary ===');

if (requireErrors) {
  log('❌ Module loading issues detected.', true);
  log('\nRecommended actions:');
  log('1. Ensure all required files exist in the correct locations');
  log('2. Check if NODE_PATH environment variable is set correctly');
  log('3. Try running "node check-environment.js" to verify your environment');
  log('4. If the issue persists, try "node diagnose.js" to get a full diagnosis');
} else {
  log('✅ All modules verified successfully.', false);
  log('\nNext steps:');
  log('1. Run "node diagnose.js" to check the project structure');
  log('2. Run "node build.js --debug" to build with debug output');
}

log('\n=== End of Verification ===\n');
