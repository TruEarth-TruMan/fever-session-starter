
#!/usr/bin/env node
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// Get the project root directory
const rootDir = process.cwd();
console.log(`Running build-electron-all.cjs in ${rootDir}`);

try {
  // 1. Clean previous build artifacts
  console.log('Step 1: Cleaning build artifacts');
  const { cleanBuildArtifacts } = require('./scripts/clean.js');
  cleanBuildArtifacts(rootDir);
  
  // 2. Ensure required directories exist
  console.log('Step 2: Ensuring required directories exist');
  const { ensureDirectories } = require('./scripts/ensureDirectories.js');
  ensureDirectories(rootDir);
  
  // 3. Run Vite build
  console.log('Step 3: Running Vite build');
  execSync('npm run build', { 
    stdio: 'inherit', 
    cwd: rootDir,
    env: { ...process.env, ELECTRON: 'true' }
  });
  
  // 4. Run Electron build
  console.log('Step 4: Running Electron build');
  
  // Use direct require path to avoid path resolution issues
  const buildElectronPath = path.join(rootDir, 'build-electron.cjs');
  console.log(`Using build-electron script at: ${buildElectronPath}`);
  console.log(`File exists: ${fs.existsSync(buildElectronPath)}`);
  
  // Use node directly with the full path
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
