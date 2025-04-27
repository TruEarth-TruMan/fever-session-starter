
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Checks if Vite build exists and runs build if needed
 * @param {string} rootDir - The root directory of the project
 */
function checkViteBuild(rootDir) {
  const distPath = path.join(rootDir, 'dist', 'index.html');
  console.log(`Checking for Vite build at: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    console.log('Vite build not found. Running build process...');
    try {
      console.log(`Executing npm run build in directory: ${rootDir}`);
      execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
    } catch (error) {
      console.error('Vite build failed:', error.message);
      console.error('Full error details:', error);
      process.exit(1);
    }
  } else {
    console.log('Vite build found. Proceeding with Electron build...');
  }
}

module.exports = { checkViteBuild };
