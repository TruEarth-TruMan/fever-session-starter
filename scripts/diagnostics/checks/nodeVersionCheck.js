
const checkNodeVersion = () => {
  const nodeVersionMajor = parseInt(process.version.split('.')[0].slice(1));
  
  if (nodeVersionMajor >= 20) {
    console.log(`- Running Node.js ${process.version} - checking for potential compatibility issues`);
    
    if (nodeVersionMajor >= 22) {
      console.log(`- Node.js v22+ detected: Some packages may not be fully compatible`);
      return { isCompatible: true, requiresElectronBuilderUpdate: true };
    }
  }
  return { isCompatible: true, requiresElectronBuilderUpdate: false };
};

module.exports = { checkNodeVersion };
