
#!/usr/bin/env node

const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const { cleanBuildArtifacts } = require('./scripts/clean.cjs');
const { ensureDirectories } = require('./scripts/ensureDirectories.cjs');

const rootDir = process.cwd();
console.log(`Running build-electron-all.cjs in ${rootDir}`);
console.log(`Node.js version: ${process.version}`);

try {
  // Step 1: Clean previous build artifacts
  console.log('Step 1: Cleaning build artifacts');
  cleanBuildArtifacts(rootDir);

  // Step 2: Ensure required directories exist
  console.log('Step 2: Ensuring required directories exist');
  ensureDirectories(rootDir);

  // Step 3: Run Vite build
  console.log('Step 3: Running Vite build');
  execSync('npm run build', {
    stdio: 'inherit',
    cwd: rootDir,
    env: { ...process.env, ELECTRON: 'true' }
  });

  // Step 4: Run Electron builder
  console.log('Step 4: Running Electron build');
  execSync('node build-electron.cjs', {
    stdio: 'inherit',
    cwd: rootDir,
    env: { ...process.env, FORCE_ROOT_DIR: rootDir }
  });

  console.log('✅ Build process completed successfully!');
  console.log('📦 You can find the installers in the "release" directory.');
  process.exit(0);

} catch (err) {
  console.error('❌ Full build failed:');
  console.error(err.message || err);
  console.error(err.stack || '');
  process.exit(1);
}
