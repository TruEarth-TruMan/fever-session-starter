
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateProjectRoot } = require('./scripts/diagnostics/projectValidator');
const { checkDependencies } = require('./scripts/diagnostics/dependencyChecker');
const { checkNodeCompatibility } = require('./scripts/diagnostics/nodeCompatibility');
const { validateDirectoryStructure } = require('./scripts/diagnostics/directoryStructure');
const { validateElectronBuilderConfig } = require('./scripts/diagnostics/configValidator');

console.log(`\n=== Fever Build System Diagnostics ===`);
console.log(`Running diagnosis at: ${new Date().toISOString()}`);
console.log(`Platform: ${process.platform} (${os.release()})`);
console.log(`Architecture: ${process.arch}`);
console.log(`Node.js: ${process.version}`);

// Get root directory
const args = process.argv.slice(2);
let rootDir = null;

// Parse arguments
for (const arg of args) {
  if (arg.startsWith('--root=')) {
    rootDir = arg.substring(7).replace(/^"(.*)"$/, '$1');
  }
}

if (!rootDir) {
  rootDir = process.cwd();
}

// Run diagnostic checks
const projectValid = validateProjectRoot(rootDir);
const { missingDeps, scripts } = checkDependencies(rootDir);
const nodeCompatible = checkNodeCompatibility(rootDir);
const directories = validateDirectoryStructure(rootDir);
const configValid = validateElectronBuilderConfig(rootDir);

// Final report
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
    console.log(`- Fix electron-builder.js configuration issues`);
  }
}

console.log(`\n=== End of Diagnosis ===\n`);
