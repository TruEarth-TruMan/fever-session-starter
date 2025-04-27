
const fs = require('fs');
const path = require('path');

/**
 * Creates output directories for installers if they don't exist
 * @param {string} rootDir - The root directory of the project
 */
function ensureDirectories(rootDir) {
  const publicDownloadDirs = [
    path.join(rootDir, 'public', 'download', 'win'),
    path.join(rootDir, 'public', 'download', 'mac')
  ];
  
  publicDownloadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

module.exports = { ensureDirectories };

