
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Ensure we're using absolute paths for script location
const scriptDir = __dirname;
console.log('=== Fever Environment Diagnostic Tool v2.4 ===');
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

// If the cwd is not the project root, try to find it
const projectRoot = process.cwd();
console.log(`\nUsing project root: ${projectRoot}`);

// Check if we're in the project root
const isProjectRoot = fs.existsSync(path.join(projectRoot, 'package.json')) && 
                      fs.existsSync(path.join(projectRoot, 'vite.config.ts'));

console.log(`Is current directory project root? ${isProjectRoot ? 'YES' : 'NO'}`);

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

// Test loading electron-builder.cjs
console.log('\nTesting load of electron-builder.cjs:');
try {
  const configAbsPath = path.resolve(projectRoot, 'electron-builder.cjs');
  console.log(`Absolute path: ${configAbsPath}`);
  
  if (require.cache[configAbsPath]) {
    delete require.cache[configAbsPath];
    console.log('Cleared require cache for config');
  }
  
  if (!fs.existsSync(configAbsPath)) {
    console.log(`❌ Config file doesn't exist at ${configAbsPath}`);
  } else {
    const fileContent = fs.readFileSync(configAbsPath, 'utf8');
    console.log(`Config file size: ${fileContent.length} bytes`);
    
    const config = require(configAbsPath);
    console.log('✅ Successfully loaded config file!');
    console.log(`Config has appId: ${config.appId ? '✅' : '❌'}`);
    console.log(`Config has directories: ${config.directories ? '✅' : '❌'}`);
  }
} catch (err) {
  console.log(`❌ Error loading config: ${err.message}`);
  console.log(`Error stack: ${err.stack}`);
}

// Check module resolution
console.log('\nTesting module resolution:');
const testModules = [
  { name: 'fs (built-in)', path: 'fs' },
  { name: 'path (built-in)', path: 'path' },
  { name: 'path resolver', path: path.join(projectRoot, 'scripts', 'utils', 'pathResolver.js') },
  { name: 'logger', path: path.join(projectRoot, 'scripts', 'utils', 'logger.js') },
  { name: 'build validator', path: path.join(projectRoot, 'scripts', 'utils', 'buildValidator.js') }
];

testModules.forEach(mod => {
  try {
    console.log(`Trying to require: ${mod.name} (${mod.path})`);
    const required = require(mod.path);
    console.log(`✅ Successfully loaded ${mod.name}`);
  } catch (err) {
    console.log(`❌ Failed to load ${mod.name}: ${err.message}`);
    
    // If it's a file module (not built-in), check existence
    if (!mod.path.includes('node_modules') && mod.path.includes('/')) {
      console.log(`File exists: ${fs.existsSync(mod.path) ? 'YES' : 'NO'}`);
      
      // List directory contents
      try {
        const dir = path.dirname(mod.path);
        console.log(`Files in ${dir}: ${fs.readdirSync(dir).join(', ')}`);
      } catch (dirErr) {
        console.log(`Error listing directory: ${dirErr.message}`);
      }
    }
  }
});

// Ensure scripts directory exists
const scriptsDir = path.join(projectRoot, 'scripts');
const utilsDir = path.join(scriptsDir, 'utils');

console.log('\nChecking directory structure:');
console.log(`- scripts directory: ${fs.existsSync(scriptsDir) ? '✅ Exists' : '❌ Missing'}`);
console.log(`- scripts/utils directory: ${fs.existsSync(utilsDir) ? '✅ Exists' : '❌ Missing'}`);

// Create required directories if missing
if (!fs.existsSync(scriptsDir)) {
  try {
    fs.mkdirSync(scriptsDir, { recursive: true });
    console.log('✅ Created scripts directory');
  } catch (err) {
    console.log(`❌ Failed to create scripts directory: ${err.message}`);
  }
}

if (!fs.existsSync(utilsDir)) {
  try {
    fs.mkdirSync(utilsDir, { recursive: true });
    console.log('✅ Created scripts/utils directory');
  } catch (err) {
    console.log(`❌ Failed to create scripts/utils directory: ${err.message}`);
  }
}

console.log('\n=== Environment Diagnostic Complete ===');
console.log('If you need to run build.js with the correct path, try:');
console.log(`node build.js --debug --root="${projectRoot}"`);
