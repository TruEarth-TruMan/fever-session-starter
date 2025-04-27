
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
    
    // Check if package.json has a build script
    const packageJsonPath = path.join(rootDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.error(`ERROR: package.json not found at ${packageJsonPath}`);
      console.error('Cannot run the build process without package.json');
      process.exit(1);
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      if (!packageJson.scripts || !packageJson.scripts.build) {
        console.error('ERROR: No build script found in package.json');
        console.error('Please add a "build" script to your package.json');
        process.exit(1);
      }
      
      console.log(`Executing npm run build in directory: ${rootDir}`);
      execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
      
      // Verify build was successful
      if (!fs.existsSync(distPath)) {
        console.error('ERROR: Vite build failed to create dist/index.html');
        console.error('Check for errors in the build process');
        process.exit(1);
      }
      
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
