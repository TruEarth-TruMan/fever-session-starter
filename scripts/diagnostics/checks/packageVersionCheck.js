
/**
 * Package version compatibility checker
 */
const fs = require('fs');
const path = require('path');
const semver = require('semver');

function checkElectronBuilderVersion(rootDir) {
  console.log('Checking electron-builder version compatibility...');
  
  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('❌ package.json not found');
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const electronBuilderVersion = packageJson.devDependencies?.['electron-builder'] || 
                                 packageJson.dependencies?.['electron-builder'];
    
    if (!electronBuilderVersion) {
      console.log('❌ electron-builder not found in dependencies');
      return false;
    }
    
    console.log(`Found electron-builder version: ${electronBuilderVersion}`);
    
    // Check if version is at least 26.0.0 (required for Node.js v22)
    const isV26Plus = semver.gte(
      semver.minVersion(electronBuilderVersion.replace(/^\^|~/, '')).version, 
      '26.0.0'
    );
    
    if (!isV26Plus) {
      console.log('❌ electron-builder should be v26+ for Node.js v22 compatibility');
      console.log('   Consider updating with: npm install --save-dev electron-builder@latest');
      return false;
    }
    
    console.log('✅ electron-builder version is compatible with Node.js v22');
    return true;
    
  } catch (err) {
    console.log(`❌ Error checking electron-builder version: ${err.message}`);
    return false;
  }
}

module.exports = { checkElectronBuilderVersion };
