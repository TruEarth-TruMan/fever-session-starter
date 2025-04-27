
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('=== Fever Environment Diagnostic Tool v2 ===');
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
['package.json', 'vite.config.ts', 'electron-builder.js', 'build.js', 'build-electron.cjs'].forEach(file => {
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

// Try to read the build.js file and explain its content
try {
  console.log('\nAnalyzing build.js file:');
  const buildFilePath = path.join(process.cwd(), 'build.js');
  if (fs.existsSync(buildFilePath)) {
    const content = fs.readFileSync(buildFilePath, 'utf8');
    const lines = content.split('\n').length;
    console.log(`- File exists, ${lines} lines`);
    console.log('- Checking key patterns:');
    console.log(`  - Contains 'execSync': ${content.includes('execSync')}`);
    console.log(`  - Contains 'child_process': ${content.includes('child_process')}`);
    console.log(`  - Contains 'rootDir': ${content.includes('rootDir')}`);
    console.log(`  - Contains 'process.exit': ${content.includes('process.exit')}`);
    
    // Try to execute a small portion to test Node execution
    console.log('\nTesting Node.js execution with a simple script:');
    try {
      execSync('node -e "console.log(\'Node.js execution test successful\')"', { stdio: 'inherit' });
    } catch (err) {
      console.log(`❌ Error executing Node.js test: ${err.message}`);
    }
  } else {
    console.log(`❌ build.js file not found at ${buildFilePath}`);
  }
} catch (err) {
  console.log(`Error analyzing build.js: ${err.message}`);
}

// Check for Electron files
console.log('\nChecking Electron files:');
const electronDir = path.join(process.cwd(), 'electron');
if (fs.existsSync(electronDir)) {
  console.log(`✅ Electron directory exists`);
  const electronFiles = fs.readdirSync(electronDir).filter(file => file.endsWith('.ts'));
  console.log(`Electron source files: ${electronFiles.join(', ')}`);
  
  // Check the content of main.ts
  const mainTsPath = path.join(electronDir, 'main.ts');
  if (fs.existsSync(mainTsPath)) {
    try {
      const content = fs.readFileSync(mainTsPath, 'utf8');
      console.log(`- main.ts: ${content.includes('createWindow') ? '✅ Has createWindow function' : '❌ No createWindow function'}`);
      console.log(`- main.ts: ${content.includes('app.whenReady') ? '✅ Has app.whenReady' : '❌ No app.whenReady'}`);
    } catch (err) {
      console.log(`- Error reading main.ts: ${err.message}`);
    }
  } else {
    console.log(`- ❌ main.ts file missing`);
  }
} else {
  console.log(`❌ Electron directory missing at ${electronDir}`);
  
  // Try to find it elsewhere
  const altElectronDir = path.join(process.cwd(), '..', 'electron');
  if (fs.existsSync(altElectronDir)) {
    console.log(`✅ Found Electron directory at ${altElectronDir}`);
  }
}

// Check scripts directory
console.log('\nChecking scripts directory:');
const scriptsDir = path.join(process.cwd(), 'scripts');
if (fs.existsSync(scriptsDir)) {
  console.log(`✅ Scripts directory exists`);
  const scriptFiles = fs.readdirSync(scriptsDir);
  console.log(`Script files: ${scriptFiles.join(', ')}`);
  
  // Check the critical scripts
  ['checkViteBuild.js', 'loadElectronConfig.js'].forEach(file => {
    const filePath = path.join(scriptsDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`- ${file}: ✅ Found`);
      
      // Try requiring the script
      try {
        console.log(`  - Attempting to require ${file}...`);
        require(filePath);
        console.log(`  - ✅ Successfully required ${file}`);
      } catch (err) {
        console.log(`  - ❌ Error requiring ${file}: ${err.message}`);
      }
    } else {
      console.log(`- ${file}: ❌ Missing`);
    }
  });
} else {
  console.log(`❌ Scripts directory missing at ${scriptsDir}`);
  console.log('Creating scripts directory...');
  try {
    fs.mkdirSync(scriptsDir, { recursive: true });
    console.log('✅ Scripts directory created');
  } catch (err) {
    console.log(`❌ Error creating scripts directory: ${err.message}`);
  }
}

// Check for permission issues (works on Unix-like systems)
if (process.platform !== 'win32') {
  console.log('\nChecking file permissions:');
  try {
    const execPermission = execSync(`ls -la ${process.cwd()}/build.js`, { encoding: 'utf8' });
    console.log(`build.js permissions: ${execPermission.trim()}`);
  } catch (err) {
    console.log(`Error checking permissions: ${err.message}`);
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

console.log('\n=== Diagnostic Complete ===');
console.log('Run this diagnostic from your project root directory to verify your environment.');
console.log('If you need to run build.js with the correct path, try:');
console.log('node build.js --root="C:\\Users\\robbi\\fever-session-starter"');
