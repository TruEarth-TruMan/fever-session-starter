
#!/usr/bin/env node
const path = require('path');
const { execSync } = require('child_process');
const { cleanBuildArtifacts } = require('./scripts/clean.js');

// Get the project root directory
const rootDir = process.cwd();
console.log(`Running build-electron-all.js in ${rootDir}`);

try {
  // 1. Clean previous build artifacts
  console.log('Step 1: Cleaning build artifacts');
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
  execSync('node build-electron.cjs --debug', { 
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
