
/**
 * Project structure validator
 */
const fs = require('fs');
const path = require('path');

function validateProjectRoot(rootDir) {
  console.log(`\n1. Validating project root: ${rootDir}`);
  
  // Check for essential files
  const essentialFiles = ['package.json', 'vite.config.ts'];
  let allFound = true;
  
  console.log('Checking for essential project files:');
  essentialFiles.forEach(file => {
    const exists = fs.existsSync(path.join(rootDir, file));
    console.log(`- ${file}: ${exists ? '✅' : '❌'}`);
    if (!exists) allFound = false;
  });
  
  if (!allFound) {
    console.log('❌ Not all essential files were found');
    return false;
  }
  
  console.log('✅ Project root validation successful');
  return true;
}

module.exports = { validateProjectRoot };
