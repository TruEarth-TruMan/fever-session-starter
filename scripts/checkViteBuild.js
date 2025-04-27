
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
    
    // Try alternate path if in a different directory structure
    const altDistPath = path.join(rootDir, '..', 'fever-session-starter', 'dist', 'index.html');
    if (fs.existsSync(altDistPath)) {
      console.log(`Found Vite build at alternate location: ${altDistPath}`);
      return;
    }
    
    try {
      console.log(`Executing npm run build in directory: ${rootDir}`);
      execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
    } catch (error) {
      console.error('Vite build failed:', error.message);
      console.error('Full error details:', error);
      
      // Try finding the correct directory
      console.log('Trying to locate correct directory structure...');
      const parentDir = path.dirname(rootDir);
      console.log(`Parent directory: ${parentDir}`);
      if (fs.existsSync(parentDir)) {
        console.log(`Files in parent directory: ${fs.readdirSync(parentDir).join(', ')}`);
        
        // Check for fever-session-starter
        const feverDir = path.join(parentDir, 'fever-session-starter');
        if (fs.existsSync(feverDir)) {
          console.log(`Found fever-session-starter directory at ${feverDir}`);
          try {
            execSync('npm run build', { stdio: 'inherit', cwd: feverDir });
            console.log('Vite build succeeded in correct directory');
            return;
          } catch (err) {
            console.error(`Build failed in alternate directory: ${err.message}`);
          }
        }
      }
      
      process.exit(1);
    }
  } else {
    console.log('Vite build found. Proceeding with Electron build...');
  }
}

module.exports = { checkViteBuild };
