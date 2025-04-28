
const fs = require('fs');
const path = require('path');
const { log } = require('./logger');

/**
 * Ensure scripts directory and critical files exist
 * @param {string} rootDir - The root directory of the project
 */
function setupScriptsDirectory(rootDir) {
  const scriptsDir = path.join(rootDir, 'scripts');
  const utilsDir = path.join(scriptsDir, 'utils');
  
  if (!fs.existsSync(scriptsDir)) {
    log(`Creating scripts directory at ${scriptsDir}`, false);
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  
  if (!fs.existsSync(utilsDir)) {
    log(`Creating utils directory at ${utilsDir}`, false);
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  // Check if critical files exist
  createCriticalFiles(rootDir);
}

/**
 * Create critical files needed for the build process
 * @param {string} rootDir - The root directory of the project
 */
function createCriticalFiles(rootDir) {
  const criticalFiles = {
    'scripts/utils/logger.js': `
      function log(message, isError = false) {
        const timestamp = new Date().toISOString();
        const prefix = isError ? '[ERROR]' : '[INFO]';
        if (isError) { console.error(\`\${prefix} \${timestamp}: \${message}\`); }
        else { console.log(\`\${prefix} \${timestamp}: \${message}\`); }
      }
      module.exports = { log };`,
    'scripts/utils/buildExecutor.js': `
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
          execSync(\`node build-electron.cjs --debug\`, {
            stdio: 'inherit', cwd: rootDir, env: { ...process.env, FORCE_ROOT_DIR: rootDir }
          });
          log('Build completed successfully!');
        } catch (error) {
          throw new Error(\`Build failed: \${error.message}\`);
        }
      }
      module.exports = { executeBuild };`
  };
  
  // Create any missing critical files
  Object.entries(criticalFiles).forEach(([filePath, content]) => {
    const fullPath = path.join(rootDir, filePath);
    if (!fs.existsSync(fullPath)) {
      log(`Creating missing critical file: ${filePath}`, false);
      try {
        // Create parent directory if it doesn't exist
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, content.trim());
        log(`Created ${filePath} successfully`, false);
      } catch (err) {
        log(`Failed to create ${filePath}: ${err.message}`, true);
      }
    }
  });
}

module.exports = { setupScriptsDirectory };
