
const fs = require('fs');
const path = require('path');

const checkElectronBuilderVersion = (rootDir) => {
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
};

module.exports = { checkElectronBuilderVersion };
