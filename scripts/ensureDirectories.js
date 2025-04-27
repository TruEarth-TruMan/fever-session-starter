
const fs = require('fs');
const path = require('path');

/**
 * Ensures necessary directories exist for app distribution
 * @param {string} rootDir - The root directory of the project
 */
function ensureDirectories(rootDir) {
  console.log(`Ensuring directories exist starting from ${rootDir}`);
  
  if (!rootDir || typeof rootDir !== 'string') {
    console.error('Invalid rootDir provided to ensureDirectories');
    return;
  }
  
  // Define public directories for auto-updates
  const publicDir = path.join(rootDir, 'public');
  const downloadDir = path.join(publicDir, 'download');
  const winDir = path.join(downloadDir, 'win');
  const macDir = path.join(downloadDir, 'mac');
  
  // Create directories if they don't exist
  [publicDir, downloadDir, winDir, macDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  });
  
  console.log('Directory structure ensured');
}

module.exports = { ensureDirectories };
