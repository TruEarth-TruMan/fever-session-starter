
#!/usr/bin/env node
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// Get the project root directory - use __dirname for reliability
const rootDir = process.cwd();
console.log(`Running build-electron-all.cjs in ${rootDir}`);

// List all script files in the scripts directory for debugging
if (fs.existsSync(path.join(rootDir, 'scripts'))) {
  console.log('Scripts directory contents:');
  const scriptFiles = fs.readdirSync(path.join(rootDir, 'scripts'));
  scriptFiles.forEach(file => console.log(` - ${file}`));
}

try {
  // 1. Clean previous build artifacts
  console.log('Step 1: Cleaning build artifacts');
  const cleanPath = path.join(rootDir, 'scripts', 'clean.js');
  if (fs.existsSync(cleanPath)) {
    const { cleanBuildArtifacts } = require(cleanPath);
    cleanBuildArtifacts(rootDir);
  } else {
    console.warn(`Clean script not found at ${cleanPath}, skipping cleaning step`);
  }
  
  // 2. Ensure required directories exist
  console.log('Step 2: Ensuring required directories exist');
  const ensureDirsPath = path.join(rootDir, 'scripts', 'ensureDirectories.js');
  if (fs.existsSync(ensureDirsPath)) {
    const { ensureDirectories } = require(ensureDirsPath);
    ensureDirectories(rootDir);
  } else {
    console.warn(`Ensure directories script not found at ${ensureDirsPath}, skipping directory check`);
  }
  
  // 3. Run Vite build
  console.log('Step 3: Running Vite build');
  execSync('npm run build', { 
    stdio: 'inherit', 
    cwd: rootDir,
    env: { ...process.env, ELECTRON: 'true' }
  });
  
  // 4. Run Electron build - using node directly with explicit path
  console.log('Step 4: Running Electron build');
  const buildElectronPath = path.join(rootDir, 'build-electron.cjs');
  console.log(`Using build-electron script at: ${buildElectronPath}`);
  console.log(`File exists: ${fs.existsSync(buildElectronPath)}`);
  
  // Display file contents for debugging if needed
  if (fs.existsSync(buildElectronPath)) {
    const fileSize = fs.statSync(buildElectronPath).size;
    console.log(`build-electron.cjs size: ${fileSize} bytes`);
    
    if (fileSize === 0) {
      console.error('Error: build-electron.cjs exists but is empty!');
      process.exit(1);
    }
  } else {
    console.error('Error: build-electron.cjs does not exist!');
    process.exit(1);
  }
  
  // Use explicit node path and set FORCE_ROOT_DIR to ensure correct directory resolution
  execSync(`node "${buildElectronPath}" --debug`, { 
    stdio: 'inherit',
    cwd: rootDir,
    env: { ...process.env, FORCE_ROOT_DIR: rootDir }
  });
  
  console.log('Build process completed successfully!');
  console.log('You can find the installers in the "release" directory.');
  
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error.message);
  if (error.stack) console.error(error.stack);
  process.exit(1);
}
