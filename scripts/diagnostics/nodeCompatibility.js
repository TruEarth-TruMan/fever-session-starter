
const fs = require('fs');
const path = require('path');

function checkNodeCompatibility(rootDir) {
  console.log(`\n3. Checking Node.js compatibility`);
  
  // Get the current Node.js version
  const nodeVersion = process.version;
  console.log(`Current Node.js version: ${nodeVersion}`);
  
  // Extract major version number
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  console.log(`Major version: ${majorVersion}`);
  
  // Node.js v22 requires electron-builder v26+
  const isCompatible = true;
  const requiresElectronBuilderUpdate = false;
  
  if (majorVersion >= 22) {
    console.log('Using Node.js v22+. Checking electron-builder version...');
    requiresElectronBuilderUpdate = true;
    
    // Check if package.json exists
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
    }
  } else {
    console.log(`✅ Node.js ${nodeVersion} is compatible with electron-builder`);
  }
  
  return isCompatible;
}

module.exports = { checkNodeCompatibility };
