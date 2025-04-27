
const fs = require('fs');
const path = require('path');

function checkDependencies(rootDir) {
  console.log(`\n2. Analyzing package.json`);
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
    
    console.log(`- Package type: ${packageJson.type || 'commonjs (default)'}`);
    
    const allDeps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
    const criticalDeps = [
      'electron',
      'electron-builder',
      'vite',
      '@vitejs/plugin-react-swc',
      'react',
      'react-dom'
    ];
    
    console.log(`\nChecking critical dependencies:`);
    const missingDeps = [];
    
    for (const dep of criticalDeps) {
      if (allDeps[dep]) {
        console.log(`- ${dep}: ✅ (${allDeps[dep]})`);
        
        const depPath = path.join(rootDir, 'node_modules', dep);
        if (!fs.existsSync(depPath)) {
          console.log(`  ❌ WARNING: Listed in package.json but not found in node_modules!`);
          missingDeps.push(dep);
        }
      } else {
        console.log(`- ${dep}: ❌ MISSING`);
        missingDeps.push(dep);
      }
    }
    
    return { missingDeps, scripts: packageJson.scripts || {} };
  } catch (err) {
    console.log(`❌ Error parsing package.json: ${err.message}`);
    return { missingDeps: [], scripts: {} };
  }
}

module.exports = { checkDependencies };
