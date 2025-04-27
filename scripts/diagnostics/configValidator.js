
const fs = require('fs');
const path = require('path');
const { checkBasicConfig } = require('./checks/config/basicConfigChecks');
const { checkModuleFormat } = require('./checks/config/moduleFormatCheck');

function validateElectronBuilderConfig(rootDir) {
  console.log(`\n5. Checking electron-builder configuration`);
  
  // Check for both .cjs and .js files
  const possiblePaths = [
    path.join(rootDir, 'electron-builder.cjs'),
    path.join(rootDir, 'electron-builder.js')
  ];
  
  let configPath = null;
  
  for (const checkPath of possiblePaths) {
    console.log(`Checking for config at ${checkPath}: ${fs.existsSync(checkPath) ? 'EXISTS' : 'NOT FOUND'}`);
    if (fs.existsSync(checkPath)) {
      configPath = checkPath;
      break;
    }
  }
  
  if (!configPath) {
    console.log('❌ No electron-builder configuration file found');
    return false;
  }
  
  try {
    console.log(`Using config file: ${configPath}`);
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    // Check basic configuration requirements
    const checks = checkBasicConfig(configContent);
    
    // Check module format
    const hasValidModuleFormat = checkModuleFormat(configContent);
    
    return Object.values(checks).every(Boolean) && hasValidModuleFormat;
  } catch (err) {
    console.log(`❌ Error analyzing electron-builder config: ${err.message}`);
    return false;
  }
}

module.exports = { validateElectronBuilderConfig };
