
const fs = require('fs');
const path = require('path');
const { checkBasicConfig } = require('./checks/config/basicConfigChecks');
const { checkModuleFormat } = require('./checks/config/moduleFormatCheck');

function validateElectronBuilderConfig(rootDir) {
  console.log(`\n5. Checking electron-builder.js configuration`);
  try {
    const configPath = path.join(rootDir, 'electron-builder.js');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    // Check basic configuration requirements
    const checks = checkBasicConfig(configContent);
    
    // Check module format
    const hasValidModuleFormat = checkModuleFormat(configContent);
    
    return Object.values(checks).every(Boolean) && hasValidModuleFormat;
  } catch (err) {
    console.log(`❌ Error analyzing electron-builder.js: ${err.message}`);
    return false;
  }
}

module.exports = { validateElectronBuilderConfig };
