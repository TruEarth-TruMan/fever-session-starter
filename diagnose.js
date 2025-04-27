
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

// Ensure scripts can be found by requiring with absolute paths
const scriptsDir = path.join(__dirname, 'scripts');
const diagnosticsDir = path.join(scriptsDir, 'diagnostics');

// Require modules using absolute paths
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
console.log(`Script path: ${__filename}`);
console.log(`Scripts directory: ${scriptsDir}`);

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

console.log(`Using root directory: ${rootDir}`);
console.log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);

// Check for electron-builder config explicitly
console.log('\nChecking for electron-builder config files:');
const possibleConfigs = ['electron-builder.cjs', 'electron-builder.js'];
let configFound = false;
let foundConfigPath = null;

for (const configFile of possibleConfigs) {
  const configPath = path.join(rootDir, configFile);
  const exists = fs.existsSync(configPath);
  console.log(`- ${configFile}: ${exists ? '✅ Found' : '❌ Missing'}`);
  
  if (exists) {
    configFound = true;
    foundConfigPath = configPath;
    
    // Try to load it
    try {
      // Make sure to use the absolute path
      const fullConfigPath = path.resolve(rootDir, configFile);
      console.log(`- Full config path: ${fullConfigPath}`);
      
      // Clear require cache to ensure we get a fresh copy
      if (require.cache[require.resolve(fullConfigPath)]) {
        delete require.cache[require.resolve(fullConfigPath)];
        console.log(`  - Cleared require cache for config file`);
      }
      
      const config = require(fullConfigPath);
      console.log(`  - ✅ Successfully loaded ${configFile}`);
      console.log(`  - Config has appId: ${config.appId ? '✅' : '❌'}`);
      console.log(`  - Config has directories: ${config.directories ? '✅' : '❌'}`);
      console.log(`  - Config has files: ${config.files ? '✅' : '❌'}`);
    } catch (err) {
      console.log(`  - ❌ Error loading ${configFile}: ${err.message}`);
      console.log(`  - Error stack: ${err.stack}`);
    }
  }
}

if (!configFound) {
  console.log('\n❌ No electron-builder config found, creating default one...');
  const defaultConfigPath = path.join(rootDir, 'electron-builder.cjs');
  
  const defaultConfig = `/**
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

  try {
    fs.writeFileSync(defaultConfigPath, defaultConfig);
    console.log(`✅ Created electron-builder.cjs at ${defaultConfigPath}`);
    foundConfigPath = defaultConfigPath;
  } catch (err) {
    console.log(`❌ Error creating config: ${err.message}`);
  }
}

// Try loading modules to verify they work
try {
  console.log('\nVerifying required modules can be loaded:');
  const projectValidator = require('./scripts/diagnostics/projectValidator');
  console.log('- projectValidator loaded ✅');
  const dependencyChecker = require('./scripts/diagnostics/dependencyChecker');
  console.log('- dependencyChecker loaded ✅');
  const nodeCompatibility = require('./scripts/diagnostics/nodeCompatibility');
  console.log('- nodeCompatibility loaded ✅');
  const directoryStructure = require('./scripts/diagnostics/directoryStructure');
  console.log('- directoryStructure loaded ✅');
  const configValidator = require('./scripts/diagnostics/configValidator');
  console.log('- configValidator loaded ✅');
} catch (err) {
  console.log(`❌ Error loading modules: ${err.message}`);
  console.log(`Error stack: ${err.stack}`);
  console.log('Continuing with diagnosis despite module loading errors');
}

// Run diagnostic checks
console.log('\nRunning diagnostic checks...');
let projectValid = false;
let missingDeps = [];
let scripts = {};
let nodeCompatible = false;
let directories = { scripts: false, electron: false };
let configValid = false;

try {
  projectValid = validateProjectRoot(rootDir);
  console.log('- Project validation completed');
} catch (err) {
  console.log(`❌ Error in validateProjectRoot: ${err.message}`);
}

try {
  const deps = checkDependencies(rootDir);
  missingDeps = deps.missingDeps || [];
  scripts = deps.scripts || {};
  console.log('- Dependency check completed');
} catch (err) {
  console.log(`❌ Error in checkDependencies: ${err.message}`);
}

try {
  nodeCompatible = checkNodeCompatibility(rootDir);
  console.log('- Node compatibility check completed');
} catch (err) {
  console.log(`❌ Error in checkNodeCompatibility: ${err.message}`);
}

try {
  directories = validateDirectoryStructure(rootDir);
  console.log('- Directory structure validation completed');
} catch (err) {
  console.log(`❌ Error in validateDirectoryStructure: ${err.message}`);
}

try {
  configValid = foundConfigPath ? validateElectronBuilderConfig(rootDir) : false;
  console.log('- Config validation completed');
} catch (err) {
  console.log(`❌ Error in validateElectronBuilderConfig: ${err.message}`);
}

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
    console.log(`- Fix electron-builder configuration issues`);
    if (foundConfigPath) {
      console.log(`  Config file: ${foundConfigPath}`);
    }
  }
}

console.log(`\n=== End of Diagnosis ===\n`);
