
/**
 * Cleans build artifacts for a clean rebuild
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function cleanBuildArtifacts(rootDir) {
  console.log('Cleaning build artifacts...');

  // Directories to clean
  const dirsToClean = [
    path.join(rootDir, 'dist'),
    path.join(rootDir, 'electron', 'dist'),
    path.join(rootDir, 'release')
  ];

  // Remove directories
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`Removing directory: ${dir}`);
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`Successfully removed ${dir}`);
      } catch (error) {
        console.error(`Failed to remove ${dir}: ${error.message}`);
      }
    } else {
      console.log(`Directory does not exist, skipping: ${dir}`);
    }
  });

  // Clear node_modules/.vite cache if it exists
  const viteCache = path.join(rootDir, 'node_modules', '.vite');
  if (fs.existsSync(viteCache)) {
    console.log(`Clearing Vite cache: ${viteCache}`);
    try {
      fs.rmSync(viteCache, { recursive: true, force: true });
      console.log('Successfully cleared Vite cache');
    } catch (error) {
      console.error(`Failed to clear Vite cache: ${error.message}`);
    }
  }

  console.log('Cleaning complete');
  return true;
}

// If this script is run directly
if (require.main === module) {
  const rootDir = process.cwd();
  cleanBuildArtifacts(rootDir);
} else {
  module.exports = { cleanBuildArtifacts };
}
