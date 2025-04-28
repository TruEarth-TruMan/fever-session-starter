
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log(`\n=== Fever Build System Diagnostics ===`);
console.log(`Running diagnosis at: ${new Date().toISOString()}`);
console.log(`Platform: ${process.platform} (${os.release()})`);
console.log(`Architecture: ${process.arch}`);
console.log(`Node.js: ${process.version}`);
console.log(`Script path: ${__filename}`);

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

// Define absolute path to scripts directory
const scriptsDir = path.resolve(__dirname, 'scripts');
console.log(`Scripts directory: ${scriptsDir}`);
console.log(`Using root directory: ${rootDir}`);

// Ensure directories exist
const diagnosticsDir = path.join(scriptsDir, 'diagnostics');
const checksDir = path.join(diagnosticsDir, 'checks');
const utilsDir = path.join(scriptsDir, 'utils');

[scriptsDir, diagnosticsDir, checksDir, utilsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } catch (err) {
      console.log(`Error creating directory ${dir}: ${err.message}`);
    }
  }
});

try {
  console.log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);
} catch (err) {
  console.error(`Error reading root directory: ${err.message}`);
}

// Safe require function with better error handling
function safeRequire(modulePath) {
  try {
    console.log(`Attempting to require: ${modulePath}`);
    
    // First, ensure we have an absolute path
    const absolutePath = path.isAbsolute(modulePath) ? 
      modulePath : path.resolve(process.cwd(), modulePath);
    
    console.log(`Full path: ${absolutePath}`);
    
    // Check if the file exists before requiring
    if (!fs.existsSync(absolutePath)) {
      console.error(`Module file does not exist: ${absolutePath}`);
      
      // Try to find the file with different extensions
      const dir = path.dirname(absolutePath);
      const basename = path.basename(absolutePath, path.extname(absolutePath));
      
      if (fs.existsSync(dir)) {
        console.log(`Searching for ${basename} in ${dir}...`);
        const files = fs.readdirSync(dir);
        const possibleMatches = files.filter(f => f.startsWith(basename));
        
        if (possibleMatches.length > 0) {
          console.log(`Possible matches: ${possibleMatches.join(', ')}`);
        } else {
          console.log(`No files matching ${basename} found in ${dir}`);
        }
      }
      
      return null;
    }
    
    // Clear require cache to ensure fresh load
    const resolvedPath = require.resolve(absolutePath);
    if (require.cache[resolvedPath]) {
      delete require.cache[resolvedPath];
      console.log(`Cleared require cache for: ${absolutePath}`);
    }
    
    const requiredModule = require(absolutePath);
    console.log(`Successfully required module: ${absolutePath}`);
    return requiredModule;
  } catch (err) {
    console.error(`Failed to require module: ${modulePath}`);
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    
    // Print directory listing to help diagnose the issue
    try {
      const dir = path.dirname(path.isAbsolute(modulePath) ? 
        modulePath : path.resolve(process.cwd(), modulePath));
      
      if (fs.existsSync(dir)) {
        console.log(`Files in ${dir}: ${fs.readdirSync(dir).join(', ')}`);
      } else {
        console.log(`Directory doesn't exist: ${dir}`);
      }
    } catch (listErr) {
      console.error(`Couldn't list directory contents: ${listErr.message}`);
    }
    
    return null;
  }
}

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

// Create necessary validation modules if they don't exist
const projectValidatorPath = path.join(diagnosticsDir, 'projectValidator.js');
if (!fs.existsSync(projectValidatorPath)) {
  console.log(`Creating missing projectValidator.js script`);
  try {
    fs.writeFileSync(projectValidatorPath, `
/**
 * Project structure validator
 */
const fs = require('fs');
const path = require('path');

function validateProjectRoot(rootDir) {
  console.log('\\n1. Validating project root: ' + rootDir);
  
  // Check for essential files
  const essentialFiles = ['package.json', 'vite.config.ts'];
  let allFound = true;
  
  console.log('Checking for essential project files:');
  essentialFiles.forEach(file => {
    const exists = fs.existsSync(path.join(rootDir, file));
    console.log('- ' + file + ': ' + (exists ? '✅' : '❌'));
    if (!exists) allFound = false;
  });
  
  if (!allFound) {
    console.log('❌ Not all essential files were found');
    return false;
  }
  
  console.log('✅ Project root validation successful');
  return true;
}

module.exports = { validateProjectRoot };`);
    console.log(`✅ Created projectValidator.js successfully`);
  } catch (err) {
    console.log(`❌ Error creating projectValidator.js: ${err.message}`);
  }
}

const dependencyCheckerPath = path.join(diagnosticsDir, 'dependencyChecker.js');
if (!fs.existsSync(dependencyCheckerPath)) {
  console.log(`Creating missing dependencyChecker.js script`);
  try {
    fs.writeFileSync(dependencyCheckerPath, `
/**
 * Dependency checker
 */
const fs = require('fs');
const path = require('path');

function checkDependencies(rootDir) {
  console.log('\\n2. Checking dependencies');
  
  // Check for package.json
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    return { missingDeps: ['electron', 'electron-builder', 'vite'], scripts: {} };
  }
  
  // Read package.json
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('✅ package.json loaded successfully');
  } catch (err) {
    console.log('❌ Error parsing package.json: ' + err.message);
    return { missingDeps: ['electron', 'electron-builder', 'vite'], scripts: {} };
  }
  
  // Check required dependencies
  const requiredDeps = ['electron', 'electron-builder', 'vite'];
  const missingDeps = [];
  
  console.log('Checking required dependencies:');
  requiredDeps.forEach(dep => {
    const hasDep = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    console.log('- ' + dep + ': ' + (hasDep ? '✅' : '❌'));
    if (!hasDep) {
      missingDeps.push(dep);
    }
  });
  
  // Check build scripts
  const scripts = packageJson.scripts || {};
  console.log('\\nChecking build scripts:');
  console.log('- build script: ' + (scripts.build ? '✅' : '❌'));
  
  return { missingDeps, scripts };
}

module.exports = { checkDependencies };`);
    console.log(`✅ Created dependencyChecker.js successfully`);
  } catch (err) {
    console.log(`❌ Error creating dependencyChecker.js: ${err.message}`);
  }
}

const directoryStructurePath = path.join(diagnosticsDir, 'directoryStructure.js');
if (!fs.existsSync(directoryStructurePath)) {
  console.log(`Creating missing directoryStructure.js script`);
  try {
    fs.writeFileSync(directoryStructurePath, `
/**
 * Directory structure validator
 */
const fs = require('fs');
const path = require('path');

function validateDirectoryStructure(rootDir) {
  console.log('\\n4. Validating directory structure');
  
  // Check for important directories
  const directories = {
    scripts: false,
    electron: false,
    src: false,
    build: false
  };
  
  console.log('Checking for important directories:');
  Object.keys(directories).forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    const exists = fs.existsSync(dirPath);
    console.log('- ' + dir + ': ' + (exists ? '✅' : '❌'));
    directories[dir] = exists;
  });
  
  // Create missing directories
  Object.keys(directories).forEach(dir => {
    if (!directories[dir]) {
      const dirPath = path.join(rootDir, dir);
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        directories[dir] = true;
        console.log('  Created directory: ' + dir);
      } catch (err) {
        console.log('  Error creating directory ' + dir + ': ' + err.message);
      }
    }
  });
  
  return directories;
}

module.exports = { validateDirectoryStructure };`);
    console.log(`✅ Created directoryStructure.js successfully`);
  } catch (err) {
    console.log(`❌ Error creating directoryStructure.js: ${err.message}`);
  }
}

const configValidatorPath = path.join(diagnosticsDir, 'configValidator.js');
if (!fs.existsSync(configValidatorPath)) {
  console.log(`Creating missing configValidator.js script`);
  try {
    fs.writeFileSync(configValidatorPath, `
const fs = require('fs');
const path = require('path');

function validateElectronBuilderConfig(rootDir) {
  console.log('\\n5. Checking electron-builder configuration');
  
  // Check for both .cjs and .js files
  const possiblePaths = [
    path.join(rootDir, 'electron-builder.cjs'),
    path.join(rootDir, 'electron-builder.js')
  ];
  
  let configPath = null;
  
  for (const checkPath of possiblePaths) {
    console.log('Checking for config at ' + checkPath + ': ' + (fs.existsSync(checkPath) ? 'EXISTS' : 'NOT FOUND'));
    if (fs.existsSync(checkPath)) {
      configPath = checkPath;
      break;
    }
  }
  
  if (!configPath) {
    console.log('❌ No electron-builder configuration file found');
    console.log('Creating a default configuration file...');
    
    configPath = path.join(rootDir, 'electron-builder.cjs');
    const defaultConfig = \`/**
 * Fever Application Packaging Configuration
 */
module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  copyright: "Copyright © 2025",
  directories: { output: "release", buildResources: "build" },
  files: ["dist/**/*", "electron/**/*", "!node_modules/**/*"],
  mac: { 
    category: "public.app-category.music",
    target: [
      { target: "dmg", arch: ["x64", "arm64"] },
      { target: "zip", arch: ["x64", "arm64"] }
    ]
  },
  win: { target: [{ target: "nsis", arch: ["x64"] }] },
  publish: [{ provider: "generic", url: "https://feverstudio.live/update" }]
};\`;
    
    try {
      fs.writeFileSync(configPath, defaultConfig);
      console.log('Created default config at ' + configPath);
    } catch (err) {
      console.log('❌ Failed to create default config: ' + err.message);
      return false;
    }
  }
  
  try {
    console.log('Using config file: ' + configPath);
    
    // Clear require cache to ensure we get a fresh copy
    if (require.cache[require.resolve(configPath)]) {
      delete require.cache[require.resolve(configPath)];
    }
    
    const config = require(configPath);
    
    // Basic validation of config object
    const hasAppId = config.appId && typeof config.appId === 'string';
    const hasProductName = config.productName && typeof config.productName === 'string';
    const hasDirectories = config.directories && typeof config.directories === 'object';
    const hasFiles = config.files && Array.isArray(config.files);
    
    console.log('- appId: ' + (hasAppId ? '✅' : '❌'));
    console.log('- productName: ' + (hasProductName ? '✅' : '❌'));
    console.log('- directories: ' + (hasDirectories ? '✅' : '❌'));
    console.log('- files: ' + (hasFiles ? '✅' : '❌'));
    
    return hasAppId && hasProductName && hasDirectories && hasFiles;
    
  } catch (err) {
    console.log('❌ Error analyzing electron-builder config: ' + err.message);
    return false;
  }
}

module.exports = { validateElectronBuilderConfig };`);
    console.log(`✅ Created configValidator.js successfully`);
  } catch (err) {
    console.log(`❌ Error creating configValidator.js: ${err.message}`);
  }
}

const nodeCompatibilityPath = path.join(diagnosticsDir, 'nodeCompatibility.js');
if (!fs.existsSync(nodeCompatibilityPath)) {
  console.log(`Creating nodeCompatibility.js script`);
  try {
    fs.writeFileSync(nodeCompatibilityPath, `
/**
 * Node.js compatibility checker
 */
const fs = require('fs');
const path = require('path');

function checkNodeCompatibility(rootDir) {
  console.log('\\n3. Checking Node.js compatibility');
  
  // Get the current Node.js version
  const nodeVersion = process.version;
  console.log('Current Node.js version: ' + nodeVersion);
  
  // Extract major version number
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  console.log('Major version: ' + majorVersion);
  
  let isCompatible = true;
  
  // Node.js v22 requires electron-builder v26+
  if (majorVersion >= 22) {
    console.log('Using Node.js v22+. Checking electron-builder version...');
    
    // Check if package.json exists
    const packageJsonPath = path.join(rootDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const electronBuilderVersion = packageJson.devDependencies?.['electron-builder'] || 
                                       packageJson.dependencies?.['electron-builder'];
        
        if (electronBuilderVersion) {
          console.log('Found electron-builder version: ' + electronBuilderVersion);
          
          // Extract version number (remove ^ or ~ if present)
          const versionNumber = electronBuilderVersion.replace(/[\\^~]/, '').split('.')[0];
          if (parseInt(versionNumber) >= 26) {
            console.log('✅ electron-builder v26+ detected, compatible with Node.js v22');
          } else {
            console.log('❌ electron-builder version is below v26, not fully compatible with Node.js v22');
            isCompatible = false;
          }
        }
      } catch (err) {
        console.log('Error parsing package.json: ' + err.message);
      }
    }
  } else {
    console.log('✅ Node.js ' + nodeVersion + ' is compatible with electron-builder');
  }
  
  return isCompatible;
}

module.exports = { checkNodeCompatibility };`);
    console.log(`✅ Created nodeCompatibility.js successfully`);
  } catch (err) {
    console.log(`❌ Error creating nodeCompatibility.js: ${err.message}`);
  }
}

// Create directory for node version check if it doesn't exist
const checksConfigDir = path.join(checksDir, 'config');
if (!fs.existsSync(checksConfigDir)) {
  try {
    fs.mkdirSync(checksConfigDir, { recursive: true });
    console.log(`Created directory: ${checksConfigDir}`);
  } catch (err) {
    console.log(`Error creating directory ${checksConfigDir}: ${err.message}`);
  }
}

const nodeVersionCheckPath = path.join(checksDir, 'nodeVersionCheck.js');
if (!fs.existsSync(nodeVersionCheckPath)) {
  console.log(`Creating nodeVersionCheck.js script`);
  try {
    fs.writeFileSync(nodeVersionCheckPath, `
/**
 * Check Node.js version compatibility
 */

function checkNodeVersion() {
  const nodeVersion = process.version;
  console.log('Current Node.js version: ' + nodeVersion);
  
  // Extract major version number
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  console.log('Major version: ' + majorVersion);
  
  let isCompatible = true;
  let requiresElectronBuilderUpdate = false;
  
  // Node.js v22 requires electron-builder v26+
  if (majorVersion >= 22) {
    console.log('Using Node.js v22+. electron-builder v26+ is recommended.');
    requiresElectronBuilderUpdate = true;
  }
  
  return { isCompatible, requiresElectronBuilderUpdate };
}

module.exports = { checkNodeVersion };`);
    console.log(`✅ Created nodeVersionCheck.js successfully`);
  } catch (err) {
    console.log(`❌ Error creating nodeVersionCheck.js: ${err.message}`);
  }
}

const packageVersionCheckPath = path.join(checksDir, 'packageVersionCheck.js');
if (!fs.existsSync(packageVersionCheckPath)) {
  console.log(`Creating packageVersionCheck.js script`);
  try {
    fs.writeFileSync(packageVersionCheckPath, `
/**
 * Check package versions for compatibility
 */
const fs = require('fs');
const path = require('path');

function checkElectronBuilderVersion(rootDir) {
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const electronBuilderVersion = packageJson.devDependencies?.['electron-builder'] || 
                                     packageJson.dependencies?.['electron-builder'];
      
      if (electronBuilderVersion) {
        console.log('Found electron-builder version: ' + electronBuilderVersion);
        
        // Extract version number (remove ^ or ~ if present)
        const versionNumber = electronBuilderVersion.replace(/[\\^~]/, '').split('.')[0];
        if (parseInt(versionNumber) >= 26) {
          console.log('✅ electron-builder v26+ detected, compatible with Node.js v22');
          return true;
        } else {
          console.log('❌ electron-builder version is below v26, not fully compatible with Node.js v22');
          return false;
        }
      }
    } catch (err) {
      console.log('Error parsing package.json: ' + err.message);
    }
  } else {
    console.log('❌ package.json not found at: ' + packageJsonPath);
  }
  
  return false;
}

module.exports = { checkElectronBuilderVersion };`);
    console.log(`✅ Created packageVersionCheck.js successfully`);
  } catch (err) {
    console.log(`❌ Error creating packageVersionCheck.js: ${err.message}`);
  }
}

// Try loading module manually first to check for errors
console.log('\nVerifying required modules can be loaded:');

// Always use absolute paths for requiring modules
const projectValidator = safeRequire(path.resolve(__dirname, 'scripts', 'diagnostics', 'projectValidator.js'));
console.log(`projectValidator loaded: ${projectValidator ? '✅' : '❌'}`);

const dependencyChecker = safeRequire(path.resolve(__dirname, 'scripts', 'diagnostics', 'dependencyChecker.js'));
console.log(`dependencyChecker loaded: ${dependencyChecker ? '✅' : '❌'}`);

const nodeCompatibility = safeRequire(path.resolve(__dirname, 'scripts', 'diagnostics', 'nodeCompatibility.js'));
console.log(`nodeCompatibility loaded: ${nodeCompatibility ? '✅' : '❌'}`);

const directoryStructure = safeRequire(path.resolve(__dirname, 'scripts', 'diagnostics', 'directoryStructure.js'));
console.log(`directoryStructure loaded: ${directoryStructure ? '✅' : '❌'}`);

const configValidator = safeRequire(path.resolve(__dirname, 'scripts', 'diagnostics', 'configValidator.js'));
console.log(`configValidator loaded: ${configValidator ? '✅' : '❌'}`);

// Run diagnostic checks
console.log('\nRunning diagnostic checks...');
let projectValid = false;
let missingDeps = [];
let scripts = {};
let nodeCompatible = false;
let directories = { scripts: false, electron: false };
let configValid = false;

if (projectValidator) {
  try {
    projectValid = projectValidator.validateProjectRoot(rootDir);
    console.log('- Project validation completed');
  } catch (err) {
    console.log(`❌ Error in validateProjectRoot: ${err.message}`);
  }
}

if (dependencyChecker) {
  try {
    const deps = dependencyChecker.checkDependencies(rootDir);
    missingDeps = deps.missingDeps || [];
    scripts = deps.scripts || {};
    console.log('- Dependency check completed');
  } catch (err) {
    console.log(`❌ Error in checkDependencies: ${err.message}`);
  }
}

if (nodeCompatibility) {
  try {
    nodeCompatible = nodeCompatibility.checkNodeCompatibility(rootDir);
    console.log('- Node compatibility check completed');
  } catch (err) {
    console.log(`❌ Error in checkNodeCompatibility: ${err.message}`);
  }
}

if (directoryStructure) {
  try {
    directories = directoryStructure.validateDirectoryStructure(rootDir);
    console.log('- Directory structure validation completed');
  } catch (err) {
    console.log(`❌ Error in validateDirectoryStructure: ${err.message}`);
  }
}

if (configValidator && foundConfigPath) {
  try {
    configValid = configValidator.validateElectronBuilderConfig(rootDir);
    console.log('- Config validation completed');
  } catch (err) {
    console.log(`❌ Error in validateElectronBuilderConfig: ${err.message}`);
  }
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
