
/**
 * Node.js compatibility checker
 */
const semver = require('semver');

function checkNodeVersion() {
  console.log(`Current Node.js version: ${process.version}`);
  
  // Node.js v22+ requires electron-builder v26+
  const isNodeV22Plus = semver.gte(process.version, '22.0.0');
  
  if (isNodeV22Plus) {
    console.log('Node.js v22+ detected. Electron-builder v26+ is required.');
    return { 
      isCompatible: true,
      requiresElectronBuilderUpdate: true
    };
  }
  
  // Node.js v16+ is generally safe for electron-builder
  const isNodeV16Plus = semver.gte(process.version, '16.0.0');
  if (isNodeV16Plus) {
    console.log('Node.js version is compatible with electron-builder.');
    return { 
      isCompatible: true,
      requiresElectronBuilderUpdate: false
    };
  }
  
  console.log('WARNING: Node.js version below v16 may cause compatibility issues.');
  return { 
    isCompatible: false,
    requiresElectronBuilderUpdate: false
  };
}

module.exports = { checkNodeVersion };
