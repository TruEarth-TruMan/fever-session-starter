
const fs = require('fs');
const path = require('path');
const { log } = require('./logger');

/**
 * Safely loads a module or creates a default version if it doesn't exist
 * @param {string} modulePath - Path to the module
 * @param {string} defaultContent - Default content if the module needs to be created
 * @param {string} rootDir - The root directory of the project
 * @returns {any} The loaded module
 */
function loadOrCreateModule(modulePath, defaultContent, rootDir) {
  const fullPath = path.resolve(rootDir, modulePath);
  log(`Loading module from: ${fullPath}`);
  
  // Create the module if it doesn't exist
  if (!fs.existsSync(fullPath)) {
    log(`Creating missing module: ${modulePath}`, false);
    
    const moduleDir = path.dirname(fullPath);
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, defaultContent);
    log(`Created ${modulePath} successfully`, false);
  }
  
  // Try to load the module
  try {
    // Clear require cache to ensure we get a fresh copy
    if (require.cache[require.resolve(fullPath)]) {
      delete require.cache[require.resolve(fullPath)];
      log(`Cleared require cache for module: ${modulePath}`, false);
    }
    
    const loadedModule = require(fullPath);
    log(`Successfully loaded module: ${modulePath}`, false);
    return loadedModule;
  } catch (err) {
    log(`Failed to load module ${modulePath}: ${err.message}`, true);
    throw err;
  }
}

/**
 * Safely requires a module without crashing if it doesn't exist
 * @param {string} modulePath - Path to the module to require
 * @returns {any|null} - The required module or null if it failed
 */
function safeRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    log(`Failed to require module: ${modulePath}`, true);
    log(`Error: ${error.message}`, true);
    return null;
  }
}

module.exports = { loadOrCreateModule, safeRequire };
