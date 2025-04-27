const fs = require('fs');
const path = require('path');

/**
 * Resolves the project root directory
 * @param {string} forcedPath - A path that is forced to be used as the root directory
 * @returns {string} The resolved project root directory
 */
function resolveProjectRoot(forcedPath) {
  // Use the forced path if provided and it exists
  if (forcedPath && fs.existsSync(forcedPath)) {
    console.log(`Using forced root directory: ${forcedPath}`);
    return forcedPath;
  }

  // Otherwise use the current working directory
  const cwd = process.cwd();
  console.log(`Using current directory as root: ${cwd}`);
  
  // Check if the current directory has package.json and vite.config.ts
  const isProjectRoot = fs.existsSync(path.join(cwd, 'package.json')) && 
                        fs.existsSync(path.join(cwd, 'vite.config.ts'));
  
  if (!isProjectRoot) {
    console.warn(`Warning: Current directory doesn't appear to be a valid project root`);
    console.warn(`Missing package.json: ${!fs.existsSync(path.join(cwd, 'package.json'))}`);
    console.warn(`Missing vite.config.ts: ${!fs.existsSync(path.join(cwd, 'vite.config.ts'))}`);
  }
  
  return cwd;
}

/**
 * Resolves a file path within the project
 * @param {string} rootDir - The root directory of the project
 * @param {string} filePath - The relative file path to resolve
 * @returns {string|null} The resolved file path or null if not found
 */
function resolveFilePath(rootDir, filePath) {
  if (!rootDir || typeof rootDir !== 'string') {
    console.error('Error: Invalid rootDir provided to resolveFilePath');
    return null;
  }
  
  const fullPath = path.join(rootDir, filePath);
  console.log(`Checking for file at: ${fullPath}`);
  
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  
  // Log a more detailed error message
  console.error(`File not found: ${fullPath}`);
  console.log(`Directory exists: ${fs.existsSync(path.dirname(fullPath))}`);
  
  try {
    // List directory contents to help debugging
    const dirContents = fs.readdirSync(path.dirname(fullPath));
    console.log(`Files in directory: ${dirContents.join(', ')}`);
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
  }
  
  return null;
}

module.exports = { resolveProjectRoot, resolveFilePath };
