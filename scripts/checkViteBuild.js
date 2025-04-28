
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
        
        // Set ELECTRON environment variable for Vite build
        console.log(`Executing npm run build in directory: ${rootDir}`);
        execSync('npm run build', { 
          stdio: 'inherit', 
          cwd: rootDir,
          env: { ...process.env, ELECTRON: 'true' }
        });
        
        // Verify build was successful
        if (!fs.existsSync(distPath)) {
          console.error('ERROR: Vite build failed to create dist/index.html');
          console.error('Check for errors in the build process');
          throw new Error('Vite build failed to create dist/index.html');
        }
        
        console.log('Vite build completed successfully');
        
        // Copy electron files to their expected locations
        copyElectronFiles(rootDir);
        
      } catch (error) {
        console.error('Vite build failed:', error.message);
        console.error('Full error details:', error);
        throw error;
      }
    } else {
      console.log('Vite build found. Ensuring Electron files are in place...');
      // Copy electron files to their expected locations
      copyElectronFiles(rootDir);
    }
    
    return true;
  } catch (error) {
    console.error('Error in checkViteBuild:', error);
    throw error;
  }
}

/**
 * Copies Electron files to their expected locations
 * @param {string} rootDir - The root directory of the project
 */
function copyElectronFiles(rootDir) {
  console.log('Copying Electron files to their expected locations...');
  
  try {
    // Ensure electron/dist directory exists
    const electronDistDir = path.join(rootDir, 'electron', 'dist');
    if (!fs.existsSync(electronDistDir)) {
      console.log(`Creating electron/dist directory: ${electronDistDir}`);
      fs.mkdirSync(electronDistDir, { recursive: true });
    }
    
    // Copy all TypeScript files from electron/ to electron/dist/
    const electronDir = path.join(rootDir, 'electron');
    const electronFiles = fs.readdirSync(electronDir).filter(file => 
      file.endsWith('.ts') || file.endsWith('.js')
    );
    
    electronFiles.forEach(file => {
      const sourcePath = path.join(electronDir, file);
      // Replace .ts with .js for the destination
      const destFile = file.replace('.ts', '.js');
      const destPath = path.join(electronDistDir, destFile);
      
      console.log(`Copying ${sourcePath} to ${destPath}`);
      // For TypeScript files, we should compile them
      if (file.endsWith('.ts')) {
        try {
          // Simple TypeScript compilation for Electron files
          console.log(`Compiling ${file} to JavaScript...`);
          const tsContent = fs.readFileSync(sourcePath, 'utf-8');
          
          // Very basic TypeScript to JavaScript conversion (for simple files only)
          // In a real-world scenario, you should use the TypeScript compiler (tsc)
          let jsContent = tsContent
            .replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g, 'const { $1 } = require("$2")')
            .replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require("$2")')
            .replace(/export\s+const\s+(\w+)/g, 'const $1')
            .replace(/export\s+default\s+(\w+)/g, 'module.exports = $1')
            .replace(/export\s+{\s*([^}]+)\s*}/g, 'module.exports = { $1 }')
            .replace(/export\s+interface\s+(\w+)/g, '// interface $1')
            .replace(/export\s+type\s+(\w+)/g, '// type $1')
            .replace(/:\s*\w+(\[\])?(\s*=|\s*\)|\s*;|\s*,|\s*\{)/g, '$2')
            .replace(/<[^>]+>/g, '');
          
          fs.writeFileSync(destPath, jsContent);
          console.log(`Compiled ${file} to ${destFile}`);
        } catch (error) {
          console.error(`Error compiling ${file}:`, error.message);
          console.log('Falling back to simple file copy');
          fs.copyFileSync(sourcePath, destPath);
        }
      } else {
        // For JS files, just copy them
        fs.copyFileSync(sourcePath, destPath);
      }
    });
    
    console.log('Electron files prepared successfully');
    return true;
  } catch (error) {
    console.error('Error copying Electron files:', error.message);
    return false;
  }
}

module.exports = { checkViteBuild };
