
/**
 * Check package versions for compatibility
 */
const fs = require('fs');
const path = require('path');

function checkElectronBuilderVersion(rootDir) {
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const electronBuilderVersion = packageJson.devDependencies?.['electron-builder'] || 
                                     packageJson.dependencies?.['electron-builder'];
      
      if (electronBuilderVersion) {
        console.log(`Found electron-builder version: ${electronBuilderVersion}`);
        
        // Extract version number (remove ^ or ~ if present)
        const versionNumber = electronBuilderVersion.replace(/[\^~]/, '').split('.')[0];
        if (parseInt(versionNumber) >= 26) {
          console.log('✅ electron-builder v26+ detected, compatible with Node.js v22');
          return true;
        } else {
          console.log('❌ electron-builder version is below v26, not fully compatible with Node.js v22');
          return false;
        }
      }
    } catch (err) {
      console.log(`Error parsing package.json: ${err.message}`);
    }
  } else {
    console.log(`❌ package.json not found at: ${packageJsonPath}`);
  }
  
  return false;
}

module.exports = { checkElectronBuilderVersion };
