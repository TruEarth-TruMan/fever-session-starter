#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { build } = require('electron-builder');
const { log } = require('./scripts/utils/logger');
const { initializeBuild } = require('./scripts/utils/buildInitializer');

const debugMode = process.argv.includes('--debug');
const projectRoot = process.argv.find(arg => arg.startsWith('--root='))?.split('=')[1] || process.cwd();

function logDebug(message) {
  if (debugMode) {
    console.log(`[DEBUG] ${message}`);
  }
}

async function main() {
  try {
    logDebug(`Running initializeBuild for projectRoot: ${projectRoot}`);
    await initializeBuild();

    const configPath = path.join(projectRoot, 'electron-builder.cjs');
    logDebug(`Looking for electron-builder config at: ${configPath}`);

    if (!fs.existsSync(configPath)) {
      console.error('❌ electron-builder.cjs config file not found!');
      process.exit(1);
    }

    const config = require(configPath);

    logDebug(`Starting build with electron-builder`);
    await build({
      config,
      projectDir: projectRoot,
      publish: 'never'
    });

    console.log('✅ Build completed successfully!');
  } catch (error) {
    log(error.message, true);
    if (debugMode && error.stack) {
      log(error.stack, true);
    }
    process.exit(1);
  }
}

main();
