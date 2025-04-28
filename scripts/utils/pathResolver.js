
/**
 * Path resolution utilities for the build system
 */
const fs = require('fs');
const path = require('path');

/**
 * Resolves the project root directory using various strategies
 * @param {string} forceRootDir - Optional forced root directory path
 * @returns {string|null} - The resolved project root directory or null if not found
 */
function resolveProjectRoot(forceRootDir = null) {
  // If a root directory is forced, use it
  if (forceRootDir && fs.existsSync(forceRootDir)) {
    console.log(`Using forced root directory: ${forceRootDir}`);
    return forceRootDir;
  }

  // First try the current directory
  let currentDir = process.cwd();
  
  // Check if current directory is the project root
  if (fs.existsSync(path.join(currentDir, 'package.json'))) {
    return currentDir;
  }

  // Try parent directory
  const parentDir = path.dirname(currentDir);
  if (fs.existsSync(path.join(parentDir, 'package.json'))) {
    return parentDir;
  }

  // Try common project directories
  const possibleDirs = [
    path.join(currentDir, 'fever-session-starter'),
    path.join(parentDir, 'fever-session-starter')
  ];

  for (const dir of possibleDirs) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
  }

  return null;
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
    console.error(`Failed to require module: ${modulePath}`);
    console.error(`Error: ${error.message}`);
    return null;
  }
}

module.exports = { resolveProjectRoot, safeRequire };
