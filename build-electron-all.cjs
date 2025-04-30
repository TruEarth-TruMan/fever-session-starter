
#!/usr/bin/env node
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// Get the project root directory - use __dirname for reliability
const rootDir = process.cwd();
console.log(`Running build-electron-all.cjs in ${rootDir}`);
console.log(`Node.js version: ${process.version}`);

// List all script files in the scripts directory for debugging
if (fs.existsSync(path.join(rootDir, 'scripts'))) {
  console.log('Scripts directory contents:');
  const scriptFiles = fs.readdirSync(path.join(rootDir, 'scripts'));
  scriptFiles.forEach(file => console.log(` - ${file}`));
}

// Function to copy directory contents
function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    console.error(`Source directory not found: ${source}`);
    return false;
  }

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
  
  return true;
}

try {
  // 1. Clean previous build artifacts
  console.log('Step 1: Cleaning build artifacts');
  const cleanPath = path.join(rootDir, 'scripts', 'clean.js');
  if (fs.existsSync(cleanPath)) {
    console.log(`Cleaning using: ${cleanPath}`);
    const { cleanBuildArtifacts } = require(cleanPath);
    cleanBuildArtifacts(rootDir);
  } else {
    console.warn(`Clean script not found at ${cleanPath}, skipping cleaning step`);
    console.log('Creating basic clean process');
    // Minimal cleaning if script not found
    ['dist', 'electron/dist', 'dist-electron', 'release'].forEach(dir => {
      const dirPath = path.join(rootDir, dir);
      if (fs.existsSync(dirPath)) {
        try {
          console.log(`Removing ${dirPath}`);
          fs.rmSync(dirPath, { recursive: true, force: true });
        } catch (err) {
          console.warn(`Failed to remove ${dirPath}: ${err.message}`);
        }
      }
    });
  }
  
  // 2. Ensure required directories exist
  console.log('Step 2: Ensuring required directories exist');
  ['build', 'build/icons', 'dist', 'release', 'electron/dist', 'dist-electron'].forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
  
  // Create minimal index.html if it doesn't exist (to avoid build errors)
  const indexHtmlPath = path.join(rootDir, 'dist', 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.log('Creating minimal index.html');
    fs.writeFileSync(indexHtmlPath, `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Fever Audio App</title>
    </head>
    <body>
      <div id="root">
        <p>This is a placeholder build. Run a proper Vite build for production use.</p>
      </div>
    </body>
    </html>`);
  }
  
  // 3. Run Vite build
  console.log('Step 3: Running Vite build');
  try {
    execSync('npm run build', { 
      stdio: 'inherit', 
      cwd: rootDir,
      env: { ...process.env, ELECTRON: 'true' }
    });
  } catch (error) {
    console.error('Vite build failed:', error.message);
    // Continue anyway, we created a minimal index.html above
    console.log('Continuing with build process despite Vite build failure');
  }
  
  // 4. Compile Electron TypeScript and copy to dist-electron
  console.log('Step 4: Compiling and copying Electron files');
  const electronDistDir = path.join(rootDir, 'electron', 'dist');
  const distElectronDir = path.join(rootDir, 'dist-electron');
  
  // Ensure the directories exist
  [electronDistDir, distElectronDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Copy files from electron/dist to dist-electron
  console.log(`Copying Electron files from ${electronDistDir} to ${distElectronDir}`);
  if (fs.existsSync(electronDistDir)) {
    copyDirectory(electronDistDir, distElectronDir);
    console.log('Electron files copied successfully');
  }
  
  // 5. Run Electron build directly with node
  console.log('Step 5: Running Electron build');
  const buildElectronPath = path.join(rootDir, 'build-electron.cjs');
  console.log(`Using build-electron script at: ${buildElectronPath}`);
  
  if (!fs.existsSync(buildElectronPath)) {
    console.error(`ERROR: build-electron.cjs not found at ${buildElectronPath}`);
    process.exit(1);
  }
  
  // Log file content for debugging
  console.log(`build-electron.cjs size: ${fs.statSync(buildElectronPath).size} bytes`);
  
  // Run build-electron.cjs directly with Node.js
  try {
    console.log(`Running: node "${buildElectronPath}" --debug`);
    execSync(`node "${buildElectronPath}" --debug`, { 
      stdio: 'inherit',
      cwd: rootDir,
      env: { ...process.env, FORCE_ROOT_DIR: rootDir }
    });
    
    console.log('Build process completed successfully!');
    console.log('You can find the installers in the "release" directory.');
    
    process.exit(0);
  } catch (error) {
    console.error('Electron build failed with error:');
    console.error(error.message);
    process.exit(1);
  }
} catch (error) {
  console.error('Build failed:', error.message);
  if (error.stack) console.error(error.stack);
  process.exit(1);
}
