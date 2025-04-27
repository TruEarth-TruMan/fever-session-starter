
const { checkNodeVersion } = require('./checks/nodeVersionCheck');
const { checkElectronBuilderVersion } = require('./checks/packageVersionCheck');

function checkNodeCompatibility(rootDir) {
  console.log(`\n3. Checking Node.js compatibility`);
  
  const { isCompatible, requiresElectronBuilderUpdate } = checkNodeVersion();
  
  if (requiresElectronBuilderUpdate) {
    return checkElectronBuilderVersion(rootDir);
  }
  
  return isCompatible;
}

module.exports = { checkNodeCompatibility };
