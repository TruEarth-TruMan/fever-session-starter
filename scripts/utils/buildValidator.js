
const fs = require('fs');
const path = require('path');
const { log } = require('./logger');

function validateBuildConfig(rootDir) {
  if (!rootDir) {
    throw new Error('Invalid root directory provided');
  }

  const requiredFiles = [
    'package.json',
    'electron-builder.js',
    'vite.config.ts',
    'build-electron.cjs'
  ];

  const missingFiles = requiredFiles.filter(file => 
    !fs.existsSync(path.join(rootDir, file))
  );

  if (missingFiles.length > 0) {
    throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
  }

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
    );
    
    if (!packageJson.scripts?.build) {
      throw new Error('No build script found in package.json');
    }
  } catch (error) {
    throw new Error(`Error validating package.json: ${error.message}`);
  }

  return true;
}

module.exports = { validateBuildConfig };

