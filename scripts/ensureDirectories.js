const fs = require('fs');
const path = require('path');

/**
 * Ensures all required directories and placeholder files exist for the build process
 */
function ensureDirectories(rootDir) {
  console.log('🔧 Ensuring required directories exist...');

  const requiredDirs = [
    path.join(rootDir, 'build'),
    path.join(rootDir, 'build', 'icons'),
    path.join(rootDir, 'dist'),
    path.join(rootDir, 'release'),
    path.join(rootDir, 'distribution'),
    path.join(rootDir, 'electron', 'dist'),
    path.join(rootDir, 'dist-electron')
  ];

  requiredDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    } else {
      console.log(`✅ Directory already exists: ${dir}`);
    }
  });

  const iconFiles = [
    { path: path.join(rootDir, 'build', 'icons', 'icon.ico'), type: 'Windows' },
    { path: path.join(rootDir, 'build', 'icons', 'icon.icns'), type: 'macOS' },
    { path: path.join(rootDir, 'build', 'icons', 'icon.png'), type: 'PNG' }
  ];

  iconFiles.forEach(({ path: iconPath, type }) => {
    if (!fs.existsSync(iconPath)) {
      fs.writeFileSync(iconPath, '');
      console.log(`🖼️ Created placeholder ${type} icon at: ${iconPath}`);
    }
  });

  return true;
}

module.exports = { ensureDirectories };
