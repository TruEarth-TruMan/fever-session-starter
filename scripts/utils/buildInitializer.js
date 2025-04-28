
const { log } = require('./logger');
const { resolveProjectRoot } = require('./pathResolver');
const { setupScriptsDirectory } = require('./scriptSetup');
const { validateBuildConfig } = require('./buildValidator');
const { verifyDependencies } = require('../verifyDependencies');
const { executeBuild } = require('./buildExecutor');
const path = require('path');
const fs = require('fs');

/**
 * Initialize and run the build process
 */
async function initializeBuild() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const forceRootDir = args.find(arg => arg.startsWith('--root='))?.substring(7).replace(/^"(.*)"$/, '$1');
  const debugMode = args.includes('--debug');
  const dryRun = args.includes('--dry-run');

  // Resolve project root
  const rootDir = resolveProjectRoot(forceRootDir);
  if (!rootDir) {
    throw new Error('Could not determine project root directory');
  }
  log(`Using project root directory: ${rootDir}`);
  
  // Ensure scripts directory and critical files exist
  setupScriptsDirectory(rootDir);
  
  // Log directory contents for debugging
  if (debugMode) {
    logDebugInfo(rootDir);
  }

  // Validate build configuration
  try {
    validateBuildConfig(rootDir);
  } catch (validationError) {
    log(`Validation error: ${validationError.message}`, true);
    log('Continuing despite validation errors', true);
  }

  // Verify dependencies
  let depsVerified = false;
  try {
    depsVerified = await verifyDependencies(rootDir);
  } catch (depsError) {
    log(`Dependency verification error: ${depsError.message}`, true);
    log('Continuing despite dependency verification errors', true);
    depsVerified = true;
  }

  // Execute build
  try {
    await executeBuild(rootDir, dryRun);
  } catch (buildError) {
    throw new Error(`Build execution failed: ${buildError.message}`);
  }
}

/**
 * Log debug information about the project
 * @param {string} rootDir - The root directory of the project
 */
function logDebugInfo(rootDir) {
  try {
    log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);
    
    // Check for electron-builder.cjs specifically
    const electronBuilderCjsPath = path.resolve(rootDir, 'electron-builder.cjs');
    const electronBuilderJsPath = path.resolve(rootDir, 'electron-builder.js');
    
    log(`electron-builder.cjs exists: ${fs.existsSync(electronBuilderCjsPath)}`);
    log(`electron-builder.js exists: ${fs.existsSync(electronBuilderJsPath)}`);
    
    // If neither exists, create electron-builder.cjs
    if (!fs.existsSync(electronBuilderCjsPath) && !fs.existsSync(electronBuilderJsPath)) {
      log('Creating electron-builder.cjs...', true);
      
      // Create from scratch with minimal config
      const minimalConfig = createMinimalElectronBuilderConfig();
      fs.writeFileSync(electronBuilderCjsPath, minimalConfig);
      log(`Created minimal electron-builder.cjs: ${fs.existsSync(electronBuilderCjsPath)}`, false);
    }
  } catch (err) {
    log(`Error reading directory: ${err.message}`, true);
  }
}

/**
 * Create minimal electron-builder configuration
 * @returns {string} - The minimal configuration as a string
 */
function createMinimalElectronBuilderConfig() {
  return `/**
 * Fever Application Packaging Configuration
 */
module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  copyright: "Copyright © 2025",
  directories: { output: "release", buildResources: "build" },
  files: ["dist/**/*", "electron/**/*", "!node_modules/**/*"],
  mac: { category: "public.app-category.music", target: ["dmg", "zip"] },
  win: { target: ["nsis"] },
  publish: [{ provider: "generic", url: "https://feverstudio.live/update" }]
};`;
}

module.exports = { initializeBuild };
