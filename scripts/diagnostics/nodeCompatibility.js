
const fs = require('fs');
const path = require('path');

function checkNodeCompatibility(rootDir) {
  console.log(`\n3. Checking Node.js compatibility`);
  const nodeVersionMajor = parseInt(process.version.split('.')[0].slice(1));

  if (nodeVersionMajor >= 20) {
    console.log(`- Running Node.js ${process.version} - checking for potential compatibility issues`);
    
    if (nodeVersionMajor >= 22) {
      console.log(`- Node.js v22+ detected: Some packages may not be fully compatible`);
      console.log(`- Checking electron-builder version...`);
      
      try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
        const allDeps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
        
        if (allDeps['electron-builder'] && !allDeps['electron-builder'].startsWith('^26')) {
          console.log(`❌ Warning: For Node.js v22, electron-builder v26+ is recommended`);
          console.log(`  Current version: ${allDeps['electron-builder']}`);
          return false;
        }
        return true;
      } catch (err) {
        console.log(`❌ Could not check electron-builder version: ${err.message}`);
        return false;
      }
    }
  }
  return true;
}

module.exports = { checkNodeCompatibility };
