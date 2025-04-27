
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
    
    // Try to find the config file elsewhere
    const parentDir = path.dirname(rootDir);
    console.log(`Checking parent directory: ${parentDir}`);
    if (fs.existsSync(parentDir)) {
      console.log(`Files in parent directory: ${fs.readdirSync(parentDir).join(', ')}`);
      
      // Look for fever-session-starter directory
      const feverDir = path.join(parentDir, 'fever-session-starter');
      if (fs.existsSync(feverDir)) {
        console.log(`Found fever-session-starter directory at ${feverDir}`);
        console.log(`Files in fever-session-starter: ${fs.readdirSync(feverDir).join(', ')}`);
        
        const altConfigPath = path.join(feverDir, 'electron-builder.js');
        if (fs.existsSync(altConfigPath)) {
          console.log(`Found config at alternate location: ${altConfigPath}`);
          try {
            const config = require(altConfigPath);
            return config;
          } catch (err) {
            console.error(`Failed to load alternate config: ${err.message}`);
          }
        }
      }
    }
    
    process.exit(1);
  }
  
  try {
    console.log(`Loading electron-builder config from ${configPath}`);
    const config = require(configPath);
    return config;
  } catch (error) {
    console.error('Failed to load electron-builder config:', error);
    process.exit(1);
  }
}

module.exports = { loadElectronConfig };
