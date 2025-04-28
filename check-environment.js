
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Ensure we're using absolute paths for script location
const scriptDir = __dirname;
console.log('=== Fever Environment Diagnostic Tool v2.5 ===');
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

// Safe require function with better error handling
function safeRequire(filePath) {
  try {
    console.log(`Attempting to require: ${filePath}`);
    
    // Ensure we're using an absolute path
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    console.log(`Absolute path: ${absolutePath}`);
    
    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      console.log(`File does not exist: ${absolutePath}`);
      return null;
    }
    
    // Clear cache to ensure fresh load
    if (require.cache[require.resolve(absolutePath)]) {
      delete require.cache[require.resolve(absolutePath)];
      console.log(`Cleared require cache for: ${absolutePath}`);
    }
    
    const module = require(absolutePath);
    console.log(`Successfully required: ${filePath}`);
    return module;
  } catch (err) {
    console.log(`Error requiring ${filePath}: ${err.message}`);
    console.log(`Stack trace: ${err.stack}`);
    return null;
  }
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

// Ensure project validator script exists
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
  console.log('1. Validating project root: ' + rootDir);
  
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

// Test loading modules from the scripts directory
console.log('\nTesting module resolution:');
try {
  console.log('Attempting to load projectValidator.js...');
  if (fs.existsSync(projectValidatorPath)) {
    delete require.cache[require.resolve(projectValidatorPath)];
    const projectValidator = require(projectValidatorPath);
    console.log('✅ Successfully loaded projectValidator module');
    
    if (typeof projectValidator.validateProjectRoot === 'function') {
      const result = projectValidator.validateProjectRoot(projectRoot);
      console.log(`Project validation result: ${result ? '✅ Passed' : '❌ Failed'}`);
    } else {
      console.log('❌ projectValidator.validateProjectRoot is not a function');
    }
  } else {
    console.log(`❌ projectValidator.js not found at ${projectValidatorPath}`);
  }
} catch (err) {
  console.log(`❌ Error loading projectValidator: ${err.message}`);
  console.log(`Stack trace: ${err.stack}`);
}

console.log('\n=== Environment Diagnostic Complete ===');
console.log('If you need to run build.js with the correct path, try:');
console.log(`node build.js --debug --root="${projectRoot}"`);
