
/**
 * Entry point for checking Vite build and compiling Electron files
 * This file has been refactored into smaller modules for better maintainability
 */
const { checkViteBuild } = require('./build/viteBuildChecker.js');

module.exports = { checkViteBuild };
