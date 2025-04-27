
const fs = require('fs');

function checkBasicConfig(configContent) {
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
  
  return checks;
}

module.exports = { checkBasicConfig };
