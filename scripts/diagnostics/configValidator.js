
const fs = require('fs');
const path = require('path');

function validateElectronBuilderConfig(rootDir) {
  console.log(`\n5. Checking electron-builder.js configuration`);
  try {
    const configPath = path.join(rootDir, 'electron-builder.js');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    const checks = {
      appId: configContent.includes('appId:'),
      productName: configContent.includes('productName:'),
      directories: configContent.includes('directories:'),
      files: configContent.includes('files:'),
      mac: configContent.includes('mac:'),
      win: configContent.includes('win:'),
      publish: configContent.includes('publish:')
    };
    
    Object.entries(checks).forEach(([key, exists]) => {
      console.log(`- ${key}: ${exists ? '✅' : '❌'}`);
    });
    
    if (!configContent.includes('module.exports =')) {
      console.log(`❌ WARNING: electron-builder.js may not be using CommonJS format!`);
      return false;
    }
    
    return Object.values(checks).every(Boolean);
  } catch (err) {
    console.log(`❌ Error analyzing electron-builder.js: ${err.message}`);
    return false;
  }
}

module.exports = { validateElectronBuilderConfig };
