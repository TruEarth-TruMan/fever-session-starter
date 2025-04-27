
const fs = require('fs');
const path = require('path');
const { resolveFilePath } = require('./utils/pathResolver');

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
  
  // Try multiple file extensions and names
  const possibleConfigFiles = [
    'electron-builder.js',
    'electron-builder.cjs',
    'electron-builder.config.js',
    'electron-builder.config.cjs',
    'electronBuilder.js',
    'electronBuilder.cjs'
  ];
  
  let configPath = null;
  
  for (const filename of possibleConfigFiles) {
    const fullPath = path.join(rootDir, filename);
    const resolvedPath = resolveFilePath(rootDir, filename);
    
    console.log(`Checking for config at: ${fullPath}`);
    console.log(`Resolved path: ${resolvedPath}`);
    
    if (fs.existsSync(fullPath)) {
      configPath = fullPath;
      break;
    }
    
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      configPath = resolvedPath;
      break;
    }
  }
  
  if (!configPath) {
    console.error('No electron-builder configuration file found.');
    
    // Create a default configuration file
    configPath = path.join(rootDir, 'electron-builder.js');
    const defaultConfig = `
module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  directories: { 
    output: "release", 
    buildResources: "build" 
  },
  files: [
    "dist/**/*", 
    "electron/**/*", 
    "!node_modules/**/*"
  ],
  mac: { 
    category: "public.app-category.music", 
    target: ["dmg", "zip"] 
  },
  win: { 
    target: ["nsis"] 
  },
  publish: [{ 
    provider: "generic", 
    url: "https://feverstudio.live/update" 
  }]
};`;
    
    try {
      fs.writeFileSync(configPath, defaultConfig);
      console.log(`Created default electron-builder config at: ${configPath}`);
    } catch (err) {
      console.error(`Failed to create default config: ${err.message}`);
    }
  }
  
  try {
    console.log(`Loading config from: ${configPath}`);
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    return config;
  } catch (error) {
    console.error('Failed to load electron-builder config:', error);
    throw error;
  }
}

module.exports = { loadElectronConfig };
