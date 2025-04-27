
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
    console.error(`Files in directory: ${fs.readdirSync(rootDir).join(', ')}`);
    process.exit(1);
  }
  
  try {
    const config = require(configPath);
    return config;
  } catch (error) {
    console.error('Failed to load electron-builder config:', error);
    process.exit(1);
  }
}

module.exports = { loadElectronConfig };
