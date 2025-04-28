
/**
 * Check Node.js version compatibility
 */

function checkNodeVersion() {
  const nodeVersion = process.version;
  console.log(`Current Node.js version: ${nodeVersion}`);
  
  // Extract major version number
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  console.log(`Major version: ${majorVersion}`);
  
  let isCompatible = true;
  let requiresElectronBuilderUpdate = false;
  
  // Node.js v22 requires electron-builder v26+
  if (majorVersion >= 22) {
    console.log('Using Node.js v22+. electron-builder v26+ is recommended.');
    requiresElectronBuilderUpdate = true;
  }
  
  return { isCompatible, requiresElectronBuilderUpdate };
}

module.exports = { checkNodeVersion };
