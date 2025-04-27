
const fs = require('fs');
const path = require('path');

/**
 * Loads the electron-builder configuration
 * @param {string} rootDir - The root directory of the project
 * @returns {Object} The electron-builder configuration
 */
function loadElectronConfig(rootDir) {
  const configPath = path.join(rootDir, 'electron-builder.js');
  console.log(`Loading config from: ${configPath}`);
  
  if (!fs.existsSync(configPath)) {
    console.error(`Config not found: ${configPath}`);
    console.error(`Current directory: ${process.cwd()}`);
    console.error(`Root directory: ${rootDir}`);
    console.error(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);
    
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
      process.exit(1);
    }
  }
  
  try {
    console.log(`Loading electron-builder config from ${configPath}`);
    // Use dynamic import to avoid caching issues
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    return config;
  } catch (error) {
    console.error('Failed to load electron-builder config:', error);
    process.exit(1);
  }
}

module.exports = { loadElectronConfig };
