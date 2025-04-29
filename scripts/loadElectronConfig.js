
const fs = require('fs');
const path = require('path');

/**
 * Loads the electron-builder configuration
 * @param {string} rootDir - The root directory of the project
 * @returns {Object} The electron-builder configuration
 */
function loadElectronConfig(rootDir) {
  console.log(`loadElectronConfig called with rootDir: ${rootDir}`);
  if (!rootDir || typeof rootDir !== 'string') {
    console.error('Error: Invalid rootDir provided to loadElectronConfig');
    rootDir = process.cwd();
    console.log(`Falling back to current directory: ${rootDir}`);
  }
  
  console.log(`Current working directory: ${process.cwd()}`);
  console.log(`Looking for electron-builder config in: ${rootDir}`);
  
  // Strictly prioritize .cjs files first before checking .js files
  const possibleConfigFiles = [
    'electron-builder.cjs',
    'electron-builder.config.cjs',
    'electronBuilder.cjs',
    'electron-builder.js',
    'electron-builder.config.js',
    'electronBuilder.js'
  ];
  
  let configPath = null;
  
  // List all files in the root directory for debugging
  try {
    console.log(`Files in ${rootDir}:`);
    const dirFiles = fs.readdirSync(rootDir);
    dirFiles.forEach(file => {
      console.log(`- ${file}`);
    });
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
  }
  
  for (const filename of possibleConfigFiles) {
    const fullPath = path.resolve(rootDir, filename);
    console.log(`Checking for config at: ${fullPath} - Exists: ${fs.existsSync(fullPath)}`);
    
    if (fs.existsSync(fullPath)) {
      configPath = fullPath;
      console.log(`Found electron-builder config at: ${configPath}`);
      break;
    }
  }
  
  if (!configPath) {
    console.error('No electron-builder configuration file found.');
    throw new Error('Could not find electron-builder configuration file. Please create one at the project root.');
  }
  
  try {
    console.log(`Loading config from: ${configPath}`);
    // Clear require cache to ensure we get a fresh copy
    if (require.cache[require.resolve(configPath)]) {
      delete require.cache[require.resolve(configPath)];
      console.log('Cleared require cache for config file');
    }
    
    // Use dynamic import with a try-catch as a more reliable alternative
    console.log('Attempting to load config...');
    try {
      const config = require(configPath);
      console.log('Config loaded successfully:');
      logConfigSummary(config);
      return config;
    } catch (err) {
      console.error('Failed to load config:', err.message);
      throw err;
    }
  } catch (error) {
    console.error('Failed to load electron-builder config:', error);
    console.error('Error details:', error.stack);
    throw new Error(`Failed to load electron-builder configuration: ${error.message}`);
  }
}

/**
 * Logs a summary of the loaded configuration
 * @param {Object} config - The electron-builder configuration
 */
function logConfigSummary(config) {
  console.log(`- appId: ${config.appId ? '✓' : '✗'}`);
  console.log(`- productName: ${config.productName ? '✓' : '✗'}`);
  console.log(`- directories: ${config.directories ? '✓' : '✗'}`);
  console.log(`- files: ${config.files ? '✓' : '✗'}`);
  console.log(`- asar: ${config.asar !== undefined ? config.asar : 'default (true)'}`);
  console.log(`- mac config: ${config.mac ? '✓' : '✗'}`);
  console.log(`- win config: ${config.win ? '✓' : '✗'}`);
  console.log(`- publish config: ${config.publish ? '✓' : '✗'}`);
}

module.exports = { loadElectronConfig };
