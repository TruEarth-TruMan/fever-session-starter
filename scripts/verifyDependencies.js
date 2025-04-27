
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Verifies that all required dependencies are installed correctly
 * @param {string} rootDir - The root directory of the project
 * @returns {boolean} true if all dependencies are verified, false otherwise
 */
function verifyDependencies(rootDir) {
  console.log(`Verifying dependencies in ${rootDir}...`);
  
  if (!rootDir || typeof rootDir !== 'string') {
    console.error('Invalid rootDir provided to verifyDependencies');
    return false;
  }
  
  // Critical dependencies for Electron builds
  const requiredDeps = [
    'electron',
    'electron-builder',
    'vite',
    '@vitejs/plugin-react-swc'
  ];
  
  // Check if all critical dependencies are installed
  let allDepsInstalled = true;
  const missingDeps = [];
  
  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error(`package.json not found at ${packageJsonPath}`);
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    };
    
    console.log('Checking for required dependencies:');
    requiredDeps.forEach(dep => {
      if (!allDependencies[dep]) {
        console.error(`Missing required dependency: ${dep}`);
        missingDeps.push(dep);
        allDepsInstalled = false;
      } else {
        console.log(`✓ Found ${dep} (${allDependencies[dep]})`);
        
        // Verify the dependency is actually installed in node_modules
        const depPath = path.join(rootDir, 'node_modules', dep);
        if (!fs.existsSync(depPath)) {
          console.error(`Dependency ${dep} is in package.json but not installed in node_modules`);
          missingDeps.push(dep);
          allDepsInstalled = false;
        }
      }
    });
    
    // Check Node.js version compatibility
    const nodeVersion = process.version;
    console.log(`Current Node.js version: ${nodeVersion}`);
    
    // Node.js v22 is very recent, check if electron-builder is compatible
    if (nodeVersion.startsWith('v22.')) {
      console.log('Warning: Node.js v22 is very recent. Some dependencies may not be fully compatible.');
      console.log('Checking electron-builder version compatibility...');
      
      // For Node.js v22, electron-builder should be v26+
      if (allDependencies['electron-builder'] && !allDependencies['electron-builder'].startsWith('^26')) {
        console.warn('Warning: For Node.js v22, electron-builder v26+ is recommended.');
      }
    }
    
    // If any dependencies are missing, suggest installing them
    if (missingDeps.length > 0) {
      console.error(`Please install missing dependencies: npm install --save-dev ${missingDeps.join(' ')}`);
      return false;
    }
    
    // Verify ESM/CJS compatibility
    console.log('Checking module format compatibility...');
    const packageType = packageJson.type || 'commonjs';
    console.log(`Package type: ${packageType}`);
    
    // For electron-builder, commonjs is preferred
    if (packageType === 'module') {
      console.warn('Warning: Package type is "module" (ESM) which may cause issues with Electron builds.');
      console.warn('Consider setting "type": "commonjs" in package.json or ensuring all build scripts use .cjs extension.');
    }
    
    return allDepsInstalled;
  } catch (error) {
    console.error(`Error verifying dependencies: ${error.message}`);
    console.error(error);
    return false;
  }
}

module.exports = { verifyDependencies };
