
const fs = require('fs');
const path = require('path');

/**
 * Sets up the necessary build directories for the Electron app
 * @param {string} rootDir - The root directory of the project
 * @returns {Object} Object containing paths to created directories
 */
function setupBuildDirectories(rootDir) {
  console.log(`Setting up build directories in ${rootDir}`);
  
  const buildDir = path.join(rootDir, 'build');
  const iconsDir = path.join(buildDir, 'icons');

  if (!fs.existsSync(buildDir)) {
    console.log(`Creating build directory: ${buildDir}`);
    fs.mkdirSync(buildDir, { recursive: true });
  }

  if (!fs.existsSync(iconsDir)) {
    console.log(`Creating icons directory: ${iconsDir}`);
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  return { buildDir, iconsDir };
}

// Export the function using CommonJS syntax
module.exports = { setupBuildDirectories };
