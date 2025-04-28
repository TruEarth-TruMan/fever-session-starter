
/**
 * Ensures required directories exist for the build process
 */
const fs = require('fs');
const path = require('path');

function ensureDirectories(rootDir) {
  console.log('Ensuring required directories exist...');
  
  const requiredDirs = [
    path.join(rootDir, 'build'),
    path.join(rootDir, 'build', 'icons'),
    path.join(rootDir, 'dist'),
    path.join(rootDir, 'release'),
    path.join(rootDir, 'electron')
  ];
  
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  });
  
  // Add placeholder icons if they don't exist
  const iconFiles = [
    { path: path.join(rootDir, 'build', 'icons', 'icon.ico'), type: 'Windows' },
    { path: path.join(rootDir, 'build', 'icons', 'icon.icns'), type: 'macOS' },
    { path: path.join(rootDir, 'build', 'icons', 'icon.png'), type: 'PNG' }
  ];
  
  iconFiles.forEach(({ path: iconPath, type }) => {
    if (!fs.existsSync(iconPath)) {
      console.log(`Creating placeholder ${type} icon at: ${iconPath}`);
      // Just create an empty file
      fs.writeFileSync(iconPath, '');
    }
  });
  
  return true;
}

module.exports = { ensureDirectories };
