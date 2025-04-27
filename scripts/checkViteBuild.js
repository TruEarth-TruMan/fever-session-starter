
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Checks if Vite build exists and runs build if needed
 * @param {string} rootDir - The root directory of the project
 */
function checkViteBuild(rootDir) {
  console.log(`checkViteBuild called with rootDir: ${rootDir}`);
  if (!rootDir || typeof rootDir !== 'string') {
    console.error('Error: Invalid rootDir provided to checkViteBuild');
    rootDir = process.cwd();
    console.log(`Falling back to current directory: ${rootDir}`);
  }
  
  const distPath = path.join(rootDir, 'dist', 'index.html');
  console.log(`Checking for Vite build at: ${distPath}`);
  
  try {
    if (!fs.existsSync(distPath)) {
      console.log('Vite build not found. Running build process...');
      
      // Check if package.json has a build script
      const packageJsonPath = path.join(rootDir, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        console.error(`ERROR: package.json not found at ${packageJsonPath}`);
        console.error('Cannot run the build process without package.json');
        console.error(`Files in directory: ${fs.readdirSync(rootDir).join(', ')}`);
        throw new Error('package.json not found');
      }
      
      try {
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
        console.log(`Reading package.json from: ${packageJsonPath}`);
        const packageJson = JSON.parse(packageJsonContent);
        
        if (!packageJson.scripts || !packageJson.scripts.build) {
          console.error('ERROR: No build script found in package.json');
          console.error('Please add a "build" script to your package.json');
          throw new Error('No build script in package.json');
        }
        
        // Create dist directory if it doesn't exist
        const distDir = path.join(rootDir, 'dist');
        if (!fs.existsSync(distDir)) {
          console.log(`Creating dist directory: ${distDir}`);
          fs.mkdirSync(distDir, { recursive: true });
        }
        
        console.log(`Executing npm run build in directory: ${rootDir}`);
        execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
        
        // Verify build was successful
        if (!fs.existsSync(distPath)) {
          console.error('ERROR: Vite build failed to create dist/index.html');
          console.error('Check for errors in the build process');
          throw new Error('Vite build failed to create dist/index.html');
        }
        
      } catch (error) {
        console.error('Vite build failed:', error.message);
        console.error('Full error details:', error);
        throw error;
      }
    } else {
      console.log('Vite build found. Proceeding with Electron build...');
    }
  } catch (error) {
    console.error('Error in checkViteBuild:', error);
    throw error;
  }
}

module.exports = { checkViteBuild };
