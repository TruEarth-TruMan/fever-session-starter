
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('=== Fever Environment Diagnostic Tool v2.1 ===');
console.log(`Current Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform} (${os.release()})`);
console.log(`Architecture: ${process.arch}`);
console.log(`Current working directory: ${process.cwd()}`);
console.log(`Script path: ${__filename}`);

// Try to get more system info
try {
  console.log(`Total memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Free memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
} catch (err) {
  console.log(`Could not get memory info: ${err.message}`);
}

// Check if we're in the project root
const isProjectRoot = fs.existsSync(path.join(process.cwd(), 'package.json')) && 
                      fs.existsSync(path.join(process.cwd(), 'vite.config.ts'));

console.log(`Is current directory project root? ${isProjectRoot ? 'YES' : 'NO'}`);

// List key project files
console.log('\nChecking for key project files:');
['package.json', 'vite.config.ts', 'electron-builder.cjs', 'electron-builder.js', 'build.js', 'build-electron.cjs'].forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`- ${file}: ${exists ? '✅ Found' : '❌ Missing'}`);
  
  if (exists) {
    try {
      const stats = fs.statSync(path.join(process.cwd(), file));
      console.log(`  - Size: ${stats.size} bytes, Modified: ${stats.mtime}`);
      
      // For JS files, try to require them and see if there's an error
      if (file.endsWith('.js') || file.endsWith('.cjs')) {
        console.log(`  - Attempting to require ${file}...`);
        try {
          require(path.join(process.cwd(), file));
          console.log(`  - ✅ Successfully required ${file}`);
        } catch (err) {
          console.log(`  - ❌ Error requiring ${file}: ${err.message}`);
          console.log(`  - Error stack: ${err.stack}`);
        }
      }
    } catch (err) {
      console.log(`  - Error getting file stats: ${err.message}`);
    }
  }
});

// Try to find project root if not already there
if (!isProjectRoot) {
  console.log('\nAttempting to locate project root directory...');
  
  // Check common locations
  const possibleRoots = [
    path.join(process.cwd(), '..'),
    path.join(process.cwd(), '..', 'fever-session-starter'),
    'C:\\Users\\robbi\\fever-session-starter',
    'C:\\Users\\robbi\\Desktop\\fever-session-starter',
    process.env.HOME ? path.join(process.env.HOME, 'fever-session-starter') : null
  ].filter(Boolean);
  
  for (const dir of possibleRoots) {
    if (fs.existsSync(dir)) {
      const hasPackageJson = fs.existsSync(path.join(dir, 'package.json'));
      const hasViteConfig = fs.existsSync(path.join(dir, 'vite.config.ts'));
      
      console.log(`Checking ${dir}: ${hasPackageJson ? '✅ package.json found' : '❌ No package.json'}, ${hasViteConfig ? '✅ vite.config.ts found' : '❌ No vite.config.ts'}`);
      
      if (hasPackageJson && hasViteConfig) {
        console.log(`\n✅ Found project root at: ${dir}`);
        console.log('Try running the build script from this directory.');
        
        // Check for electron-builder config files
        console.log('\nChecking for electron-builder config files:');
        ['electron-builder.cjs', 'electron-builder.js'].forEach(configFile => {
          const configPath = path.join(dir, configFile);
          console.log(`- ${configFile}: ${fs.existsSync(configPath) ? '✅ Found' : '❌ Missing'}`);
          
          if (fs.existsSync(configPath)) {
            try {
              require(configPath);
              console.log(`  - ✅ Successfully loaded ${configFile}`);
            } catch (err) {
              console.log(`  - ❌ Error loading ${configFile}: ${err.message}`);
            }
          }
        });
        
        // List scripts in package.json
        try {
          const packageJson = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
          console.log('\nAvailable scripts in package.json:');
          if (packageJson.scripts) {
            Object.keys(packageJson.scripts).forEach(script => {
              console.log(`- npm run ${script}`);
            });
          } else {
            console.log('No scripts defined in package.json');
          }
          
          // Check if the package.json has proper dependencies for building
          console.log('\nChecking for key dependencies:');
          const deps = {...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {})};
          ['electron', 'electron-builder', 'vite'].forEach(dep => {
            console.log(`- ${dep}: ${deps[dep] ? `✅ Found (${deps[dep]})` : '❌ Missing'}`);
          });
        } catch (err) {
          console.log('Error reading package.json:', err.message);
        }
        
        break;
      }
    } else {
      console.log(`Directory does not exist: ${dir}`);
    }
  }
}

// Try to create or verify electron-builder.cjs
console.log('\nChecking/creating electron-builder.cjs:');
const configPath = path.join(process.cwd(), 'electron-builder.cjs');
if (!fs.existsSync(configPath)) {
  console.log(`Creating electron-builder.cjs at ${configPath}`);
  const defaultConfig = `/**
 * Fever Application Packaging Configuration
 */
module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  copyright: "Copyright © 2025",
  directories: { output: "release", buildResources: "build" },
  files: ["dist/**/*", "electron/**/*", "!node_modules/**/*"],
  mac: { category: "public.app-category.music", target: ["dmg", "zip"] },
  win: { target: ["nsis"] },
  publish: [{ provider: "generic", url: "https://feverstudio.live/update" }]
};`;

  try {
    fs.writeFileSync(configPath, defaultConfig);
    console.log(`✅ Created electron-builder.cjs successfully`);
    try {
      const config = require(configPath);
      console.log(`✅ Loaded config successfully: ${config ? 'Valid object' : 'Invalid'}`);
    } catch (err) {
      console.log(`❌ Error loading created config: ${err.message}`);
    }
  } catch (err) {
    console.log(`❌ Error creating config: ${err.message}`);
  }
} else {
  console.log(`electron-builder.cjs exists at ${configPath}`);
  try {
    const config = require(configPath);
    console.log(`✅ Loaded config successfully: ${config ? 'Valid object' : 'Invalid'}`);
  } catch (err) {
    console.log(`❌ Error loading existing config: ${err.message}`);
  }
}

console.log('\nTesting file write access:');
const testFile = path.join(process.cwd(), 'test-write-access.txt');
try {
  fs.writeFileSync(testFile, 'Test write access');
  console.log(`✅ Successfully wrote to test file`);
  fs.unlinkSync(testFile);
  console.log(`✅ Successfully deleted test file`);
} catch (err) {
  console.log(`❌ Error with file write/delete: ${err.message}`);
}

// Test require function with a built-in module
console.log('\nTesting require function with built-in modules:');
try {
  const fs = require('fs');
  console.log('✅ Successfully required fs module');
} catch (err) {
  console.log(`❌ Error requiring fs: ${err.message}`);
}

console.log('\n=== Diagnostic Complete ===');
console.log('If you need to run build.js with the correct path, try:');
console.log('node build.js --debug --root="YOUR_PROJECT_PATH"');
