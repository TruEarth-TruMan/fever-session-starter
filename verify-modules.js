
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('=== Module Verification Tool ===');
console.log(`Current directory: ${process.cwd()}`);

// Define the modules we want to test
const modulesToTest = [
  './scripts/diagnostics/checks/nodeVersionCheck',
  './scripts/diagnostics/checks/packageVersionCheck',
  './scripts/utils/pathResolver',
  './scripts/utils/logger',
  './scripts/diagnostics/nodeCompatibility'
];

// Create a helper function to test requiring a module
function testRequire(modulePath) {
  console.log(`\nTesting require for: ${modulePath}`);
  
  // Check if the file exists (with various extensions)
  const extensions = ['', '.js', '.cjs'];
  let fileExists = false;
  let foundPath = null;
  
  for (const ext of extensions) {
    const fullPath = path.resolve(process.cwd(), `${modulePath}${ext}`);
    if (fs.existsSync(fullPath)) {
      fileExists = true;
      foundPath = fullPath;
      console.log(`✅ File exists at: ${fullPath}`);
      break;
    }
  }
  
  if (!fileExists) {
    // Check if the directory exists
    const dirPath = path.resolve(process.cwd(), modulePath);
    const dirExists = fs.existsSync(dirPath);
    
    if (dirExists) {
      // Check for index.js or index.cjs
      for (const indexFile of ['index.js', 'index.cjs']) {
        const indexPath = path.join(dirPath, indexFile);
        if (fs.existsSync(indexPath)) {
          fileExists = true;
          foundPath = indexPath;
          console.log(`✅ File exists as index file: ${indexPath}`);
          break;
        }
      }
    }
    
    if (!fileExists) {
      console.log(`❌ File not found at: ${path.resolve(process.cwd(), modulePath)}`);
      console.log(`Directory exists: ${dirExists}`);
      
      // If directory exists, list its contents
      if (dirExists) {
        try {
          const files = fs.readdirSync(dirPath);
          console.log(`Files in directory: ${files.join(', ')}`);
        } catch (err) {
          console.log(`Error reading directory: ${err.message}`);
        }
      }
      
      // Check parent directory
      const parentDir = path.dirname(path.resolve(process.cwd(), modulePath));
      if (fs.existsSync(parentDir)) {
        try {
          const files = fs.readdirSync(parentDir);
          console.log(`Files in parent directory: ${files.join(', ')}`);
        } catch (err) {
          console.log(`Error reading parent directory: ${err.message}`);
        }
      }
      
      return false;
    }
  }
  
  // Try requiring the module
  try {
    // Clear module cache if it exists
    if (foundPath && require.cache[require.resolve(foundPath)]) {
      delete require.cache[require.resolve(foundPath)];
      console.log(`Cleared require cache for: ${foundPath}`);
    }
    
    // Require the module
    const module = require(modulePath);
    console.log(`✅ Module required successfully: ${modulePath}`);
    console.log(`Module exports: ${Object.keys(module).join(', ')}`);
    return true;
  } catch (err) {
    console.log(`❌ Error requiring module: ${err.message}`);
    console.log(`Stack trace: ${err.stack}`);
    return false;
  }
}

// Test each module
console.log('\nTesting module imports:');
let allSuccessful = true;

modulesToTest.forEach(modulePath => {
  const success = testRequire(modulePath);
  if (!success) allSuccessful = false;
});

// Final report
console.log('\n=== Module Verification Summary ===');
if (allSuccessful) {
  console.log('✅ All modules loaded successfully');
} else {
  console.log('❌ Some modules failed to load');
  console.log('\nPossible solutions:');
  console.log('1. Make sure all required files exist');
  console.log('2. Set the NODE_PATH environment variable:');
  console.log(`   export NODE_PATH=${path.resolve(process.cwd(), 'node_modules')}`);
  console.log('3. Try running the check-environment.js script:');
  console.log('   node check-environment.js');
}
