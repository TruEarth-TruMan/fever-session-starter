
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
  
  const configPath = path.join(rootDir, 'electron-builder.js');
  console.log(`Loading config from: ${configPath}`);
  
  if (!fs.existsSync(configPath)) {
    console.error(`Config not found: ${configPath}`);
    console.error(`Current directory: ${process.cwd()}`);
    console.error(`Root directory: ${rootDir}`);
    console.error(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);
    
    // Try to find in parent directory
    const parentConfigPath = path.join(path.dirname(rootDir), 'electron-builder.js');
    if (fs.existsSync(parentConfigPath)) {
      console.log(`Found config in parent directory: ${parentConfigPath}`);
      const config = require(parentConfigPath);
      return config;
    }
    
    // Create a minimal config if the file doesn't exist
    console.log('Creating a minimal electron-builder config file...');
    const minimalConfig = `
module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  copyright: "Copyright © 2025",
  directories: {
    output: "release",
    buildResources: "build",
  },
  files: [
    "dist/**/*",
    "electron/**/*",
    "!node_modules/**/*",
  ],
  mac: {
    category: "public.app-category.music",
    target: ["dmg", "zip"],
  },
  win: {
    target: ["nsis"],
  },
  publish: [
    {
      provider: "generic",
      url: "https://feverstudio.live/update",
    }
  ],
};`;
    
    fs.writeFileSync(configPath, minimalConfig);
    console.log(`Created minimal config at: ${configPath}`);
    
    try {
      const config = require(configPath);
      return config;
    } catch (err) {
      console.error(`Failed to load newly created config: ${err.message}`);
      throw new Error(`Failed to load config: ${err.message}`);
    }
  }
  
  try {
    console.log(`Loading electron-builder config from ${configPath}`);
    // Use dynamic import to avoid caching issues
    delete require.cache[require.resolve(configPath)];
    
    // Try with absolute path
    const absolutePath = path.resolve(configPath);
    console.log(`Trying to load from absolute path: ${absolutePath}`);
    
    const config = require(absolutePath);
    console.log('Config loaded successfully:', config ? 'Yes' : 'No');
    return config;
  } catch (error) {
    console.error('Failed to load electron-builder config:', error);
    throw error;
  }
}

module.exports = { loadElectronConfig };
