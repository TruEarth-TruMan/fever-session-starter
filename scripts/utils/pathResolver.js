
const fs = require('fs');
const path = require('path');

/**
 * Resolves and validates the project root directory
 */
function resolveProjectRoot(forceRootDir) {
  // Check if a specific root directory was provided
  if (forceRootDir && isValidProjectRoot(forceRootDir)) {
    console.log(`Using provided root directory: ${forceRootDir}`);
    return forceRootDir;
  }

  // Try common locations
  const possibleRootDirs = [
    process.cwd(),
    path.dirname(path.dirname(__dirname)), // Go up two levels from scripts/utils
    path.dirname(__dirname),
    path.join(process.cwd(), '..'),
    path.resolve(process.cwd(), '..'),
    // Add specific path for this project as seen in the error
    'C:\\Users\\robbi\\fever-session-starter',
  ];

  console.log('Searching for valid project root directory...');
  for (const dir of possibleRootDirs) {
    try {
      if (isValidProjectRoot(dir)) {
        console.log(`Found valid project root at: ${dir}`);
        return dir;
      }
    } catch (err) {
      console.error(`Error checking directory ${dir}: ${err.message}`);
    }
  }
  
  return null;
}

/**
 * Validates if a directory is a valid project root
 * by checking for essential project files
 */
function isValidProjectRoot(dir) {
  if (!dir) return false;
  
  try {
    // Log the contents of the directory to help debug
    console.log(`Checking directory ${dir}`);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      console.log(`Files in ${dir}: ${files.join(', ')}`);
      
      // Check for essential project files
      const hasPackageJson = fs.existsSync(path.join(dir, 'package.json'));
      const hasViteConfig = fs.existsSync(path.join(dir, 'vite.config.ts')) || 
                          fs.existsSync(path.join(dir, 'vite.config.js'));
      
      console.log(`Package.json exists: ${hasPackageJson}`);
      console.log(`Vite config exists: ${hasViteConfig}`);
      
      // Return true as long as we have package.json and vite.config
      // Don't require electron-builder.js since we'll create it if missing
      return hasPackageJson && hasViteConfig;
    }
    return false;
  } catch (error) {
    console.error(`Error validating project root: ${error}`);
    return false;
  }
}

/**
 * Resolves a specific file path relative to project root
 */
function resolveFilePath(rootDir, filename) {
  if (!rootDir || !filename) return null;
  
  // Try the direct path first
  const filePath = path.join(rootDir, filename);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  // Try common alternative locations
  const alternatives = [
    path.join(rootDir, 'config', filename),
    path.join(rootDir, 'scripts', filename),
    path.join(rootDir, 'build', filename),
    path.join(path.dirname(rootDir), filename)
  ];
  
  // More detailed logging for debugging
  console.log(`Direct path ${filePath} not found, trying alternatives...`);
  
  for (const alt of alternatives) {
    console.log(`Checking alternative path: ${alt}`);
    if (fs.existsSync(alt)) {
      console.log(`Found ${filename} at alternative location: ${alt}`);
      return alt;
    }
  }
  
  console.log(`${filename} not found in any expected location`);
  return null;
}

module.exports = { resolveProjectRoot, resolveFilePath, isValidProjectRoot };
