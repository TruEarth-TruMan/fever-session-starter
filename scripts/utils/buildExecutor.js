
const { execSync } = require('child_process');
const { log } = require('./logger');

function executeBuild(rootDir, isDryRun = false) {
  log('Starting build process...');

  if (isDryRun) {
    log('Dry run mode - simulating build process');
    return;
  }

  try {
    log('Running Vite build...');
    execSync('npm run build', { stdio: 'inherit', cwd: rootDir });

    log('Running Electron build...');
    execSync(`node build-electron.cjs --debug`, {
      stdio: 'inherit',
      cwd: rootDir,
      env: { ...process.env, FORCE_ROOT_DIR: rootDir }
    });

    log('Build completed successfully!');
  } catch (error) {
    throw new Error(`Build failed: ${error.message}`);
  }
}

module.exports = { executeBuild };
