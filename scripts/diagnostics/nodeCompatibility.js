
/**
 * Node.js compatibility checker with improved module imports
 */
const fs = require('fs');
const path = require('path');
const { checkNodeVersion } = require('../diagnostics/checks/nodeVersionCheck');
const { checkElectronBuilderVersion } = require('../diagnostics/checks/packageVersionCheck');

function checkNodeCompatibility(rootDir) {
  console.log(`\n3. Checking Node.js compatibility`);
  
  // Use our modular function to check Node.js version
  const { isCompatible, requiresElectronBuilderUpdate } = checkNodeVersion();
  
  // If Node.js v22+, check if electron-builder is compatible
  if (requiresElectronBuilderUpdate) {
    console.log('Using Node.js v22+. Checking electron-builder version...');
    
    // Check electron-builder version using our modular function
    const isElectronBuilderCompatible = checkElectronBuilderVersion(rootDir);
    
    return isElectronBuilderCompatible;
  }
  
  console.log(`✅ Node.js ${process.version} is compatible with electron-builder`);
  return isCompatible;
}

module.exports = { checkNodeCompatibility };
