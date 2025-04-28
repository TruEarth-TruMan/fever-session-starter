
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Ensure we're using absolute paths for script location
const scriptDir = __dirname;
console.log('=== Fever Environment Diagnostic Tool v3.0 ===');
console.log(`Current Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform} (${os.release()})`);
console.log(`Architecture: ${process.arch}`);
console.log(`Current directory: ${process.cwd()}`);
console.log(`Script directory: ${scriptDir}`);
console.log(`Script path: ${__filename}`);

// Try to get more system info
try {
  console.log(`Total memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Free memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
} catch (err) {
  console.log(`Could not get memory info: ${err.message}`);
}

// Create scripts directory structure if it doesn't exist
const projectRoot = process.cwd();
const scriptsDir = path.join(projectRoot, 'scripts');
const utilsDir = path.join(scriptsDir, 'utils');
const diagnosticsDir = path.join(scriptsDir, 'diagnostics');
const checksDir = path.join(diagnosticsDir, 'checks');

// Create directories if they don't exist
[scriptsDir, utilsDir, diagnosticsDir, checksDir].forEach(dir => {
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

// Check for key utility files and create them if they don't exist
const loggerPath = path.join(utilsDir, 'logger.js');
if (!fs.existsSync(loggerPath)) {
  console.log(`Creating missing logger.js at ${loggerPath}`);
  try {
    fs.writeFileSync(loggerPath, `
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const prefix = isError ? '[ERROR]' : '[INFO]';
  if (isError) { console.error(\`\${prefix} \${timestamp}: \${message}\`); }
  else { console.log(\`\${prefix} \${timestamp}: \${message}\`); }
}
module.exports = { log };`);
    console.log(`Created logger.js successfully`);
  } catch (err) {
    console.log(`Error creating logger.js: ${err.message}`);
  }
}

const pathResolverPath = path.join(utilsDir, 'pathResolver.js');
if (!fs.existsSync(pathResolverPath)) {
  console.log(`Creating missing pathResolver.js at ${pathResolverPath}`);
  try {
    fs.writeFileSync(pathResolverPath, `
const fs = require('fs');
const path = require('path');

function resolveProjectRoot(forcedPath) {
  if (forcedPath && fs.existsSync(forcedPath)) {
    console.log(\`Using forced root directory: \${forcedPath}\`);
    return forcedPath;
  }
  const cwd = process.cwd();
  console.log(\`Using current directory as root: \${cwd}\`);
  return cwd;
}

function resolveFilePath(rootDir, filePath) {
  if (!rootDir) return null;
  const fullPath = path.resolve(rootDir, filePath);
  return fs.existsSync(fullPath) ? fullPath : null;
}

function safeRequire(modulePath) {
  try {
    const absolutePath = path.isAbsolute(modulePath) ? 
      modulePath : path.resolve(process.cwd(), modulePath);
    if (!fs.existsSync(absolutePath)) return null;
    return require(absolutePath);
  } catch (err) {
    console.error(\`Failed to require module: \${modulePath}\`);
    return null;
  }
}

module.exports = { resolveProjectRoot, resolveFilePath, safeRequire };`);
    console.log(`Created pathResolver.js successfully`);
  } catch (err) {
    console.log(`Error creating pathResolver.js: ${err.message}`);
  }
}

// Check for environment files
console.log('\nChecking for environment files:');
['.env', '.env.local', '.env.development'].forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  console.log(`- ${envFile}: ${fs.existsSync(envPath) ? 'EXISTS' : 'NOT FOUND'}`);
  
  if (fs.existsSync(envPath)) {
    try {
      const stats = fs.statSync(envPath);
      console.log(`  - Size: ${stats.size} bytes, Modified: ${stats.mtime}`);
      
      // Read .env file but don't display contents (for security)
      const content = fs.readFileSync(envPath, 'utf8');
      const lineCount = content.split('\n').length;
      console.log(`  - Contains ${lineCount} lines`);
      
      // Just log var names without values for diagnostics
      const varNames = content.split('\n')
        .filter(line => line.trim() && !line.trim().startsWith('#'))
        .map(line => line.split('=')[0])
        .join(', ');
      
      console.log(`  - Environment variables: ${varNames || 'none'}`);
    } catch (err) {
      console.log(`  - Error reading file: ${err.message}`);
    }
  }
});

// Check for custom environment variables that might be used in the build
const relevantEnvVars = [
  'NODE_ENV', 
  'FORCE_ROOT_DIR', 
  'BUILD_DIR', 
  'ELECTRON_BUILDER_CONFIG',
  'DEBUG'
];

console.log('\nChecking for relevant environment variables:');
relevantEnvVars.forEach(envVar => {
  console.log(`- ${envVar}: ${process.env[envVar] ? 'SET' : 'NOT SET'}`);
});

// Ensure we can create, access and require modules properly
console.log('\nValidating module system:');

// Create a test module
const testModulePath = path.join(scriptsDir, 'test-module.js');
try {
  fs.writeFileSync(testModulePath, `
module.exports = { 
  testFunction: function() { 
    return 'Test module loaded successfully'; 
  } 
};`);
  console.log(`Created test module at ${testModulePath}`);
  
  // Try to require the test module
  try {
    const testModule = require(testModulePath);
    if (testModule && typeof testModule.testFunction === 'function') {
      console.log(`✅ Test module loaded: ${testModule.testFunction()}`);
    } else {
      console.log(`❌ Test module loaded but missing expected function`);
    }
  } catch (requireErr) {
    console.log(`❌ Failed to require test module: ${requireErr.message}`);
    console.log(`Stack trace: ${requireErr.stack}`);
  }
  
  // Clean up the test module
  try {
    fs.unlinkSync(testModulePath);
    console.log(`Cleaned up test module`);
  } catch (cleanErr) {
    console.log(`Error cleaning up test module: ${cleanErr.message}`);
  }
} catch (testErr) {
  console.log(`❌ Failed to create test module: ${testErr.message}`);
}

// List key project files
console.log('\nChecking for key project files:');
['package.json', 'vite.config.ts', 'electron-builder.cjs', 'electron-builder.js', 'build.js', 'build-electron.cjs'].forEach(file => {
  const filePath = path.join(projectRoot, file);
  const exists = fs.existsSync(filePath);
  console.log(`- ${file}: ${exists ? '✅ Found' : '❌ Missing'}`);
  
  if (exists) {
    try {
      const stats = fs.statSync(filePath);
      console.log(`  - Size: ${stats.size} bytes, Modified: ${stats.mtime}`);
    } catch (err) {
      console.log(`  - Error getting file stats: ${err.message}`);
    }
  }
});

// Create or update electron-builder.cjs configuration
console.log('\nEnsuring electron-builder.cjs config exists:');
const configPath = path.join(projectRoot, 'electron-builder.cjs');
if (!fs.existsSync(configPath)) {
  console.log('Creating electron-builder.cjs...');
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
    fs.writeFileSync(configPath, defaultConfig);
    console.log(`✅ Created electron-builder.cjs successfully`);
  } catch (err) {
    console.log(`❌ Error creating config: ${err.message}`);
  }
} else {
  console.log(`electron-builder.cjs exists at ${configPath}`);
}

// Check Node.js version compatibility
console.log('\nChecking Node.js version compatibility:');

// Create Node version check file if it doesn't exist
const nodeVersionCheckPath = path.join(checksDir, 'nodeVersionCheck.js');
if (!fs.existsSync(nodeVersionCheckPath)) {
  console.log(`Creating nodeVersionCheck.js...`);
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

// Try loading the Node version check module directly
try {
  console.log(`Attempting to load nodeVersionCheck.js directly...`);
  const nodeVersionCheck = require(path.join(checksDir, 'nodeVersionCheck.js'));
  if (nodeVersionCheck && typeof nodeVersionCheck.checkNodeVersion === 'function') {
    const { isCompatible, requiresElectronBuilderUpdate } = nodeVersionCheck.checkNodeVersion();
    console.log(`Node.js version check: Compatible=${isCompatible}, NeedsUpdate=${requiresElectronBuilderUpdate}`);
  } else {
    console.log(`❌ nodeVersionCheck.js loaded but missing checkNodeVersion function`);
  }
} catch (nodeVersionErr) {
  console.log(`❌ Error loading nodeVersionCheck.js directly: ${nodeVersionErr.message}`);
  console.log(`Stack trace: ${nodeVersionErr.stack}`);
}

// Create package version check file if it doesn't exist
const packageVersionCheckPath = path.join(checksDir, 'packageVersionCheck.js');
if (!fs.existsSync(packageVersionCheckPath)) {
  console.log(`Creating packageVersionCheck.js...`);
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

// Try loading the package version check module directly
try {
  console.log(`Attempting to load packageVersionCheck.js directly...`);
  const packageVersionCheck = require(path.join(checksDir, 'packageVersionCheck.js'));
  if (packageVersionCheck && typeof packageVersionCheck.checkElectronBuilderVersion === 'function') {
    const isCompatible = packageVersionCheck.checkElectronBuilderVersion(projectRoot);
    console.log(`Package version check: Compatible=${isCompatible}`);
  } else {
    console.log(`❌ packageVersionCheck.js loaded but missing checkElectronBuilderVersion function`);
  }
} catch (packageVersionErr) {
  console.log(`❌ Error loading packageVersionCheck.js directly: ${packageVersionErr.message}`);
  console.log(`Stack trace: ${packageVersionErr.stack}`);
}

console.log('\n=== Environment Diagnostic Complete ===');
console.log('Next steps:');
console.log('1. First run: node diagnose.js');
console.log('2. Then run: node build.js --debug');
console.log(`Note: If module errors persist, try setting NODE_PATH environment variable:`);
console.log(`export NODE_PATH=${path.resolve(projectRoot, 'node_modules')}`);
