
const path = require('path');
const fs = require('fs');

/**
 * Sets up build directories for the Electron build process
 * @param {string} rootDir - The root directory of the project
 * @returns {Object} An object containing paths to the build directories
 */
function setupBuildDirectories(rootDir) {
  console.log(`Setting up build directories starting from ${rootDir}`);
  
  if (!rootDir || typeof rootDir !== 'string') {
    console.error('Invalid rootDir provided to setupBuildDirectories');
    rootDir = process.cwd();
    console.log(`Falling back to current directory: ${rootDir}`);
  }
  
  // Define build directories
  const buildDir = path.join(rootDir, 'build');
  const iconDir = path.join(buildDir, 'icons');
  
  // Create directories if they don't exist
  [buildDir, iconDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  });
  
  // Create placeholder icons if they don't exist
  const iconFiles = [
    { path: path.join(iconDir, 'icon.ico'), size: '256x256' },
    { path: path.join(iconDir, 'icon.icns'), size: '1024x1024' },
    { path: path.join(iconDir, 'icon.png'), size: '512x512' }
  ];
  
  iconFiles.forEach(icon => {
    if (!fs.existsSync(icon.path)) {
      console.log(`Creating placeholder icon: ${icon.path}`);
      // Create a minimal file to prevent build errors
      fs.writeFileSync(icon.path, `Placeholder ${icon.size} icon file`);
    }
  });
  
  console.log('Build directories setup complete');
  
  return {
    buildDir,
    iconDir
  };
}

module.exports = { setupBuildDirectories: setupBuildDirectories };
