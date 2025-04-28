
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
                        (fs.existsSync(path.join(cwd, 'vite.config.ts')) || 
                         fs.existsSync(path.join(cwd, 'vite.config.js')));
  
  if (!isProjectRoot) {
    console.warn(`Warning: Current directory doesn't appear to be a valid project root`);
    console.warn(`Missing package.json: ${!fs.existsSync(path.join(cwd, 'package.json'))}`);
    console.warn(`Missing vite.config files: ${!fs.existsSync(path.join(cwd, 'vite.config.ts')) && 
                                             !fs.existsSync(path.join(cwd, 'vite.config.js'))}`);
  }
  
  // Try to find parent directories with package.json if current directory isn't root
  if (!isProjectRoot) {
    console.log("Searching for project root in parent directories...");
    let testDir = cwd;
    const maxDepth = 3; // Don't go too far up
    
    for (let i = 0; i < maxDepth; i++) {
      testDir = path.dirname(testDir);
      console.log(`Checking ${testDir} for project files...`);
      
      if (fs.existsSync(path.join(testDir, 'package.json')) && 
          (fs.existsSync(path.join(testDir, 'vite.config.ts')) || 
           fs.existsSync(path.join(testDir, 'vite.config.js')))) {
        console.log(`Found project root at: ${testDir}`);
        return testDir;
      }
    }
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
  
  const fullPath = path.resolve(rootDir, filePath);
  console.log(`Checking for file at: ${fullPath}`);
  
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  
  // Try adding .js and .cjs extensions
  const extensions = ['', '.js', '.cjs', '.mjs'];
  for (const ext of extensions) {
    const pathWithExt = `${fullPath}${ext}`;
    if (fs.existsSync(pathWithExt)) {
      console.log(`Found file with extension: ${pathWithExt}`);
      return pathWithExt;
    }
  }
  
  // Log a more detailed error message
  console.error(`File not found: ${fullPath}`);
  console.log(`Directory exists: ${fs.existsSync(path.dirname(fullPath))}`);
  
  try {
    // List directory contents to help debugging
    const parentDir = path.dirname(fullPath);
    if (fs.existsSync(parentDir)) {
      const dirContents = fs.readdirSync(parentDir);
      console.log(`Files in directory ${parentDir}: ${dirContents.join(', ')}`);
    } else {
      console.log(`Parent directory ${parentDir} doesn't exist`);
    }
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
  }
  
  return null;
}

/**
 * Safely requires a module with better error handling
 * @param {string} modulePath - The path to the module
 * @returns {any} The required module or null if not found
 */
function safeRequire(modulePath) {
  try {
    // First, ensure we have an absolute path
    const absolutePath = path.isAbsolute(modulePath) ? 
      modulePath : path.resolve(process.cwd(), modulePath);
    
    console.log(`Attempting to require: ${absolutePath}`);
    
    // Check different file extensions
    const possiblePaths = [
      absolutePath,
      `${absolutePath}.js`,
      `${absolutePath}.cjs`,
      path.join(absolutePath, 'index.js'),
      path.join(absolutePath, 'index.cjs')
    ];
    
    let validPath = null;
    
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        console.log(`Found valid module path: ${testPath}`);
        validPath = testPath;
        break;
      }
    }
    
    if (!validPath) {
      console.error(`Module file does not exist at any of these paths:`);
      possiblePaths.forEach(p => console.log(`- ${p}`));
      
      // Try to find the file with different extensions
      const dir = path.dirname(absolutePath);
      const basename = path.basename(absolutePath, path.extname(absolutePath));
      
      if (fs.existsSync(dir)) {
        console.log(`Searching for ${basename} in ${dir}...`);
        const files = fs.readdirSync(dir);
        const possibleMatches = files.filter(f => f.startsWith(basename));
        
        if (possibleMatches.length > 0) {
          console.log(`Possible matches: ${possibleMatches.join(', ')}`);
        } else {
          console.log(`No files matching ${basename} found in ${dir}`);
        }
      }
      
      return null;
    }
    
    // Clear require cache to ensure fresh load
    const resolvedPath = require.resolve(validPath);
    if (require.cache[resolvedPath]) {
      delete require.cache[resolvedPath];
      console.log(`Cleared require cache for: ${validPath}`);
    }
    
    const requiredModule = require(validPath);
    console.log(`Successfully required module: ${validPath}`);
    return requiredModule;
  } catch (err) {
    console.error(`Failed to require module: ${modulePath}`);
    console.error(`Error: ${err.message}`);
    console.error(`Stack trace: ${err.stack}`);
    
    // Print directory listing to help diagnose the issue
    try {
      const dir = path.dirname(path.isAbsolute(modulePath) ? 
        modulePath : path.resolve(process.cwd(), modulePath));
      
      if (fs.existsSync(dir)) {
        console.log(`Files in ${dir}: ${fs.readdirSync(dir).join(', ')}`);
      } else {
        console.log(`Directory doesn't exist: ${dir}`);
      }
    } catch (listErr) {
      console.error(`Couldn't list directory contents: ${listErr.message}`);
    }
    
    return null;
  }
}

module.exports = { resolveProjectRoot, resolveFilePath, safeRequire };
