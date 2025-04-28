
const fs = require('fs');
const path = require('path');
const os = require('os');
const { log } = require('../../utils/logger');
const { validateProjectRoot } = require('../projectValidator');
const { checkDependencies } = require('../dependencyChecker');
const { checkNodeCompatibility } = require('../nodeCompatibility');
const { validateDirectoryStructure } = require('../directoryStructure');
const { validateElectronBuilderConfig } = require('../configValidator');
const { createDefaultConfig } = require('./configGenerator');

function runDiagnostics(rootDir) {
  console.log(`\n=== Fever Build System Diagnostics ===`);
  console.log(`Running diagnosis at: ${new Date().toISOString()}`);
  console.log(`Platform: ${process.platform} (${os.release()})`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Node.js: ${process.version}`);

  if (!rootDir) {
    rootDir = process.cwd();
  }

  console.log(`Using root directory: ${rootDir}`);

  // Run core diagnostics
  const projectValid = validateProjectRoot(rootDir);
  const { missingDeps, scripts } = checkDependencies(rootDir);
  const nodeCompatible = checkNodeCompatibility(rootDir);
  const directories = validateDirectoryStructure(rootDir);
  const configValid = validateElectronBuilderConfig(rootDir);

  // Generate final report
  generateReport({
    projectValid,
    missingDeps,
    scripts,
    nodeCompatible,
    directories,
    configValid,
    rootDir
  });

  return {
    projectValid,
    missingDeps,
    nodeCompatible,
    directories,
    configValid
  };
}

function generateReport(results) {
  const {
    projectValid,
    missingDeps,
    nodeCompatible,
    directories,
    configValid,
    rootDir
  } = results;

  console.log(`\n=== Diagnosis Summary ===`);
  const isReady = projectValid && 
                  missingDeps.length === 0 && 
                  nodeCompatible &&
                  directories.scripts &&
                  directories.electron &&
                  configValid;

  if (isReady) {
    console.log(`✅ The project structure appears to be ready for building.`);
    console.log(`\nRecommended next steps:`);
    console.log(`1. Run Vite build: npm run build`);
    console.log(`2. Run Electron build: node build.js --debug --root="${rootDir}"`);
  } else {
    console.log(`❌ The project structure has issues that need to be resolved.`);
    console.log(`\nRecommended actions:`);
    if (missingDeps.length > 0) {
      console.log(`- Install missing dependencies: npm install --save-dev ${missingDeps.join(' ')}`);
    }
    if (!nodeCompatible) {
      console.log(`- Update electron-builder to v26+ for Node.js v22 compatibility`);
    }
    if (!directories.scripts || !directories.electron) {
      console.log(`- Set up missing directory structure`);
    }
    if (!configValid) {
      console.log(`- Fix electron-builder configuration issues`);
    }
  }

  console.log(`\n=== End of Diagnosis ===\n`);
}

module.exports = { runDiagnostics };
