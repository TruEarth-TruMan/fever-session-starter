
const fs = require('fs');
const path = require('path');

console.log('=== Fever Environment Diagnostic Tool ===');
console.log(`Current Node.js version: ${process.version}`);
console.log(`Current working directory: ${process.cwd()}`);

// Check if we're in the project root
const isProjectRoot = fs.existsSync(path.join(process.cwd(), 'package.json')) && 
                      fs.existsSync(path.join(process.cwd(), 'vite.config.ts'));

console.log(`Is current directory project root? ${isProjectRoot ? 'YES' : 'NO'}`);

// List key project files
console.log('\nChecking for key project files:');
['package.json', 'vite.config.ts', 'electron-builder.js', 'build.js', 'build-electron.cjs'].forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`- ${file}: ${exists ? '✅ Found' : '❌ Missing'}`);
});

// Try to find project root if not already there
if (!isProjectRoot) {
  console.log('\nAttempting to locate project root directory...');
  
  // Check common locations
  const possibleRoots = [
    path.join(process.cwd(), '..'),
    path.join(process.cwd(), '..', 'fever-session-starter'),
    'C:\\Users\\robbi\\fever-session-starter',
    'C:\\Users\\robbi\\Desktop\\fever-session-starter'
  ];
  
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

// Check for Electron files
console.log('\nChecking Electron files:');
const electronDir = path.join(process.cwd(), 'electron');
if (fs.existsSync(electronDir)) {
  console.log(`✅ Electron directory exists`);
  const electronFiles = fs.readdirSync(electronDir).filter(file => file.endsWith('.ts'));
  console.log(`Electron source files: ${electronFiles.join(', ')}`);
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
} else {
  console.log(`❌ Scripts directory missing at ${scriptsDir}`);
}

console.log('\n=== Diagnostic Complete ===');
console.log('Run this diagnostic from your project root directory to verify your environment.');
