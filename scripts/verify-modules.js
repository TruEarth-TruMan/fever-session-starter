#!/usr/bin/env node

/**
 * Module Verification Utility
 * Combines detailed and quick diagnostic logic to ensure all critical files and modules are available.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m'
};

// Console logger
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const prefix = isError ? `${colors.red}[ERROR]${colors.reset}` : `${colors.green}[INFO]${colors.reset}`;
  const output = `${prefix} ${timestamp}: ${message}`;
  isError ? console.error(output) : console.log(output);
}

// Quick file existence check
function checkFileExists(filePath, description) {
  log(`Checking for ${description} at: ${filePath}`);
  if (fs.existsSync(filePath)) {
    log(`✓ ${description} found`);
    return true;
  } else {
    log(`✗ ${description} not found`, true);
    return false;
  }
}

// Attempt require
function testRequire(modulePath, description) {
  log(`Requiring ${description}: ${modulePath}`);
  try {
    require(modulePath);
    log(`✓ Successfully required ${description}`);
    return true;
  } catch (error) {
    log(`✗ Failed to require ${description}: ${error.message}`, true);
    return false;
  }
}

// Project root
const root = process.cwd();
log(`\n🔍 Running module verification at ${root}`);

// Check critical files
const criticalFiles = [
  { path: path.join(root, 'electron-builder.cjs'), description: 'Electron Builder config' },
  { path: path.join(root, 'build-electron.cjs'), description: 'Electron build script' },
  { path: path.join(root, 'vite.config.js'), description: 'Vite config' },
  { path: path.join(root, 'src', 'main.ts'), description: 'Main Electron entry' },
  { path: path.join(root, 'src', 'preload.ts'), description: 'Electron preload' },
];

let missing = 0;
criticalFiles.forEach(({ path: file, description }) => {
  if (!checkFileExists(file, description)) missing++;
});

// Check requiring modules
const modulesToCheck = [
  { path: './electron-builder.cjs', description: 'Electron Builder config' },
  { path: './build-electron.cjs', description: 'Build script' },
];

let failedRequires = 0;
modulesToCheck.forEach(({ path, description }) => {
  if (!testRequire(path, description)) failedRequires++;
});

// Final output
console.log('\n📊 Summary:');
if (missing === 0 && failedRequires === 0) {
  log('✅ All files and modules validated successfully.');
} else {
  log('❌ Issues detected. Check errors above.', true);
}

console.log('📦 Run "node build.js --debug" to test your build.\n');
