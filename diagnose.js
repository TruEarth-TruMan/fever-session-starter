
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
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);
      console.log(`  - ✅ Successfully loaded ${configFile}`);
      console.log(`  - Config has appId: ${config.appId ? '✅' : '❌'}`);
      console.log(`  - Config has directories: ${config.directories ? '✅' : '❌'}`);
      console.log(`  - Config has files: ${config.files ? '✅' : '❌'}`);
    } catch (err) {
      console.log(`  - ❌ Error loading ${configFile}: ${err.message}`);
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

// Run diagnostic checks
console.log('\nRunning diagnostic checks...');
const projectValid = validateProjectRoot(rootDir);
const { missingDeps, scripts } = checkDependencies(rootDir);
const nodeCompatible = checkNodeCompatibility(rootDir);
const directories = validateDirectoryStructure(rootDir);
const configValid = foundConfigPath ? validateElectronBuilderConfig(rootDir) : false;

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
