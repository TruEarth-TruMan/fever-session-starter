
const builder = require('electron-builder');
const path = require('path');
const { setupBuildDirectories } = require('./scripts/setupBuildDirs');
const { generateMacOSEntitlements } = require('./scripts/generateEntitlements');
const { generateUpdateExample } = require('./scripts/generateUpdateExample');
const config = require('./electron-builder.js');

// Set up build environment
const rootDir = __dirname;
const { buildDir } = setupBuildDirectories(rootDir);

// Generate required files
generateMacOSEntitlements(buildDir);
generateUpdateExample(rootDir);

// Build the app using electron-builder
console.log('Starting build process...');

builder.build({
  config,
  publish: process.env.PUBLISH === 'always' ? 'always' : 'never'
})
  .then(() => {
    console.log('Build successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
  });

