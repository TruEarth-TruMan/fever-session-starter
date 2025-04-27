
#!/usr/bin/env node
/**
 * Fever Build System - Advanced Diagnostics Tool
 * 
 * This script performs comprehensive diagnostics on the Fever build environment
 * to identify issues with Node.js, dependencies, and configuration files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log(`\n=== Fever Build System Diagnostics ===`);
console.log(`Running diagnosis at: ${new Date().toISOString()}`);
console.log(`Platform: ${process.platform} (${os.release()})`);
console.log(`Architecture: ${process.arch}`);
console.log(`Node.js: ${process.version}`);

// Get root directory
const args = process.argv.slice(2);
let rootDir = null;

// Parse arguments
for (const arg of args) {
  if (arg.startsWith('--root=')) {
    rootDir = arg.substring(7).replace(/^"(.*)"$/, '$1');
  }
}

if (!rootDir) {
  rootDir = process.cwd();
}

console.log(`\n1. Checking project root: ${rootDir}`);

// Check if this is a valid project root
const isPackageJsonPresent = fs.existsSync(path.join(rootDir, 'package.json'));
const isViteConfigPresent = fs.existsSync(path.join(rootDir, 'vite.config.ts'));
const isElectronBuilderPresent = fs.existsSync(path.join(rootDir, 'electron-builder.js'));
const isBuildJsPresent = fs.existsSync(path.join(rootDir, 'build.js'));
const isBuildElectronPresent = fs.existsSync(path.join(rootDir, 'build-electron.cjs'));

console.log(`- package.json: ${isPackageJsonPresent ? '✅' : '❌'}`);
console.log(`- vite.config.ts: ${isViteConfigPresent ? '✅' : '❌'}`);
console.log(`- electron-builder.js: ${isElectronBuilderPresent ? '✅' : '❌'}`);
console.log(`- build.js: ${isBuildJsPresent ? '✅' : '❌'}`);
console.log(`- build-electron.cjs: ${isBuildElectronPresent ? '✅' : '❌'}`);

if (!isPackageJsonPresent || !isViteConfigPresent) {
  console.log(`❌ ERROR: This doesn't appear to be a valid Fever project root.`);
  console.log(`Please run this script from the project root or specify with --root="path/to/project"`);
  process.exit(1);
}

// Check package.json
console.log(`\n2. Analyzing package.json`);
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  
  // Check package type (important for ESM vs CommonJS)
  console.log(`- Package type: ${packageJson.type || 'commonjs (default)'}`);
  
  // Check key dependencies
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
  let missingDeps = [];
  
  for (const dep of criticalDeps) {
    if (allDeps[dep]) {
      console.log(`- ${dep}: ✅ (${allDeps[dep]})`);
      
      // Check if package is actually installed in node_modules
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
  
  if (missingDeps.length > 0) {
    console.log(`\n❌ Missing dependencies. Run: npm install --save-dev ${missingDeps.join(' ')}`);
  }
  
  // Check build scripts
  console.log(`\nChecking build scripts:`);
  if (packageJson.scripts) {
    if (packageJson.scripts.build) {
      console.log(`- build: ✅ (${packageJson.scripts.build})`);
    } else {
      console.log(`- build: ❌ MISSING`);
    }
    
    if (packageJson.scripts['electron:build']) {
      console.log(`- electron:build: ✅ (${packageJson.scripts['electron:build']})`);
    } else {
      console.log(`- electron:build: ❌ MISSING`);
    }
  } else {
    console.log(`❌ No scripts found in package.json!`);
  }
  
} catch (err) {
  console.log(`❌ Error parsing package.json: ${err.message}`);
}

// Check Node.js compatibility
console.log(`\n3. Checking Node.js compatibility`);
const nodeVersionMajor = parseInt(process.version.split('.')[0].slice(1));

if (nodeVersionMajor >= 20) {
  console.log(`- Running Node.js ${process.version} - checking for potential compatibility issues`);
  
  // Check for specific issues with Node v22+
  if (nodeVersionMajor >= 22) {
    console.log(`- Node.js v22+ detected: Some packages may not be fully compatible`);
    console.log(`- Checking electron-builder version...`);
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
      const allDeps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
      
      if (allDeps['electron-builder'] && !allDeps['electron-builder'].startsWith('^26')) {
        console.log(`❌ Warning: For Node.js v22, electron-builder v26+ is recommended`);
        console.log(`  Current version: ${allDeps['electron-builder']}`);
        console.log(`  Consider updating with: npm install --save-dev electron-builder@latest`);
      } else if (allDeps['electron-builder']) {
        console.log(`✅ electron-builder version looks compatible: ${allDeps['electron-builder']}`);
      }
      
    } catch (err) {
      console.log(`❌ Could not check electron-builder version: ${err.message}`);
    }
  }
}

// Check scripts directory
console.log(`\n4. Checking scripts directory`);
const scriptsDir = path.join(rootDir, 'scripts');

if (!fs.existsSync(scriptsDir)) {
  console.log(`❌ scripts directory not found! This is required for the build process.`);
  console.log(`Creating scripts directory...`);
  try {
    fs.mkdirSync(scriptsDir, { recursive: true });
    console.log(`✅ Created scripts directory`);
  } catch (err) {
    console.log(`❌ Failed to create scripts directory: ${err.message}`);
  }
} else {
  console.log(`✅ scripts directory exists`);
  
  // Check required script files
  const requiredScripts = [
    'checkViteBuild.js', 
    'loadElectronConfig.js', 
    'setupBuildDirs.js',
    'generateEntitlements.js', 
    'generateUpdateExample.js', 
    'ensureDirectories.js',
    'verifyDependencies.js'
  ];
  
  console.log(`\nChecking required script files:`);
  const missingScripts = [];
  
  for (const script of requiredScripts) {
    const scriptPath = path.join(scriptsDir, script);
    if (fs.existsSync(scriptPath)) {
      console.log(`- ${script}: ✅`);
      
      // Check script content
      try {
        const content = fs.readFileSync(scriptPath, 'utf-8');
        const hasExports = content.includes('module.exports');
        const hasRequire = content.includes('require(');
        
        if (!hasExports) {
          console.log(`  ⚠️ Warning: ${script} may not export any functions`);
        }
        
        // If one of the critical scripts
        if (['checkViteBuild.js', 'loadElectronConfig.js'].includes(script)) {
          // Try requiring it
          try {
            require(scriptPath);
            console.log(`  ✅ Successfully required ${script}`);
          } catch (err) {
            console.log(`  ❌ Error requiring ${script}: ${err.message}`);
          }
        }
        
      } catch (err) {
        console.log(`  ❌ Error reading ${script}: ${err.message}`);
      }
      
    } else {
      console.log(`- ${script}: ❌ MISSING`);
      missingScripts.push(script);
    }
  }
  
  if (missingScripts.length > 0) {
    console.log(`\n❌ Missing script files. These are required for the build process.`);
  }
}

// Check electron directory
console.log(`\n5. Checking electron directory`);
const electronDir = path.join(rootDir, 'electron');

if (!fs.existsSync(electronDir)) {
  console.log(`❌ electron directory not found! This is required for the build process.`);
} else {
  console.log(`✅ electron directory exists`);
  
  // Check key Electron files
  const electronFiles = ['main.ts', 'preload.ts', 'updater.ts'];
  for (const file of electronFiles) {
    const filePath = path.join(electronDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`- ${file}: ✅`);
    } else {
      console.log(`- ${file}: ❌ MISSING`);
    }
  }
}

// Check dist directory (Vite build output)
console.log(`\n6. Checking dist directory (Vite build output)`);
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.log(`❌ dist directory not found. Vite build has not been run yet.`);
} else {
  console.log(`✅ dist directory exists`);
  
  // Check for index.html
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log(`- index.html: ✅`);
  } else {
    console.log(`- index.html: ❌ MISSING (Vite build may be incomplete)`);
  }
}

// Check build directory (Electron resources)
console.log(`\n7. Checking build directory (Electron resources)`);
const buildDir = path.join(rootDir, 'build');

if (!fs.existsSync(buildDir)) {
  console.log(`❌ build directory not found. Required for Electron packaging.`);
} else {
  console.log(`✅ build directory exists`);
  
  // Check icons directory
  const iconsDir = path.join(buildDir, 'icons');
  if (fs.existsSync(iconsDir)) {
    console.log(`- icons directory: ✅`);
    
    // Check required icon files
    const iconFiles = ['icon.ico', 'icon.icns', 'icon.png'];
    for (const file of iconFiles) {
      const filePath = path.join(iconsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`  - ${file}: ✅`);
      } else {
        console.log(`  - ${file}: ❌ MISSING`);
      }
    }
  } else {
    console.log(`- icons directory: ❌ MISSING`);
  }
}

// Check electron-builder.js content
console.log(`\n8. Checking electron-builder.js configuration`);
try {
  const configPath = path.join(rootDir, 'electron-builder.js');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  
  // Check for key configuration sections
  const hasAppId = configContent.includes('appId:');
  const hasProductName = configContent.includes('productName:');
  const hasDirectories = configContent.includes('directories:');
  const hasFiles = configContent.includes('files:');
  const hasMac = configContent.includes('mac:');
  const hasWin = configContent.includes('win:');
  const hasPublish = configContent.includes('publish:');
  
  console.log(`- appId: ${hasAppId ? '✅' : '❌'}`);
  console.log(`- productName: ${hasProductName ? '✅' : '❌'}`);
  console.log(`- directories: ${hasDirectories ? '✅' : '❌'}`);
  console.log(`- files: ${hasFiles ? '✅' : '❌'}`);
  console.log(`- mac config: ${hasMac ? '✅' : '❌'}`);
  console.log(`- win config: ${hasWin ? '✅' : '❌'}`);
  console.log(`- publish config: ${hasPublish ? '✅' : '❌'}`);
  
  // Check if it uses CommonJS format
  if (!configContent.includes('module.exports =')) {
    console.log(`❌ WARNING: electron-builder.js may not be using CommonJS format!`);
    console.log(`This could cause issues with Node.js ${process.version}`);
  } else {
    console.log(`✅ Confirmed electron-builder.js is using CommonJS format`);
  }
  
} catch (err) {
  console.log(`❌ Error analyzing electron-builder.js: ${err.message}`);
}

// Attempt module loading tests
console.log(`\n9. Running module loading tests`);

try {
  console.log(`- Testing 'electron-builder' import...`);
  const builder = require('electron-builder');
  console.log(`  ✅ Successfully imported electron-builder`);
} catch (err) {
  console.log(`  ❌ Failed to import electron-builder: ${err.message}`);
  console.log(`  This is a critical dependency!`);
}

// Final report
console.log(`\n=== Diagnosis Summary ===`);
const isReady = isPackageJsonPresent && 
                isViteConfigPresent && 
                isElectronBuilderPresent && 
                isBuildJsPresent && 
                isBuildElectronPresent &&
                fs.existsSync(scriptsDir) &&
                fs.existsSync(electronDir);

if (isReady) {
  console.log(`✅ The project structure appears to be ready for building.`);
  console.log(`\nRecommended next steps:`);
  console.log(`1. Run Vite build: npm run build`);
  console.log(`2. Run Electron build: node build.js --debug --root="${rootDir}"`);
  console.log(`3. If build fails, check the specific module errors and install missing dependencies`);
} else {
  console.log(`❌ The project structure has issues that need to be resolved.`);
  console.log(`\nRecommended actions:`);
  console.log(`1. Fix the missing files and directories noted above`);
  console.log(`2. Run this diagnostic script again until all checks pass`);
  console.log(`3. Try the build process only after fixing all critical issues`);
}

console.log(`\n=== End of Diagnosis ===\n`);
