
const fs = require('fs');
const path = require('path');

/**
 * Resolves and validates the project root directory
 */
function resolveProjectRoot(forceRootDir) {
  const possibleRootDirs = [
    forceRootDir,
    process.cwd(),
    path.dirname(__dirname),
    path.join(process.cwd(), '..'),
    path.resolve(process.cwd(), '..')
  ].filter(Boolean);

  for (const dir of possibleRootDirs) {
    try {
      if (isValidProjectRoot(dir)) {
        return dir;
      }
    } catch (err) {
      console.error(`Error checking directory ${dir}: ${err.message}`);
    }
  }
  return null;
}

function isValidProjectRoot(dir) {
  if (!dir) return false;
  try {
    return fs.existsSync(path.join(dir, 'package.json')) && 
           fs.existsSync(path.join(dir, 'vite.config.ts'));
  } catch (error) {
    return false;
  }
}

module.exports = { resolveProjectRoot };

