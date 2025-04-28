
/**
 * Simple TypeScript-to-JavaScript transpilation utilities
 */
const fs = require('fs');
const path = require('path');

/**
 * Manually transpiles TypeScript files to JavaScript as a fallback
 * @param {string} rootDir - The root directory of the project
 */
function manuallyTranspileFiles(rootDir) {
  console.log('Manually transpiling TypeScript files...');
  
  const electronDir = path.join(rootDir, 'electron');
  const electronDistDir = path.join(electronDir, 'dist');
  
  // Get all TypeScript files
  const tsFiles = fs.readdirSync(electronDir).filter(file => 
    file.endsWith('.ts') || file.endsWith('.js')
  );
  
  tsFiles.forEach(file => {
    const sourcePath = path.join(electronDir, file);
    // Replace .ts with .js for the destination
    const destFile = file.replace('.ts', '.js');
    const destPath = path.join(electronDistDir, destFile);
    
    console.log(`Processing ${sourcePath} to ${destPath}`);
    
    // For TypeScript files, do basic transpilation
    if (file.endsWith('.ts')) {
      try {
        console.log(`Manually transpiling ${file} to JavaScript...`);
        const tsContent = fs.readFileSync(sourcePath, 'utf-8');
        
        // Basic TypeScript to JavaScript conversion
        let jsContent = tsContent
          .replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g, 'const { $1 } = require("$2")')
          .replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require("$2")')
          .replace(/export\s+const\s+(\w+)/g, 'const $1')
          .replace(/export\s+default\s+(\w+)/g, 'module.exports = $1')
          .replace(/export\s+{\s*([^}]+)\s*}/g, 'module.exports = { $1 }')
          .replace(/export\s+interface\s+(\w+)/g, '// interface $1')
          .replace(/export\s+type\s+(\w+)/g, '// type $1')
          .replace(/:\s*\w+(\[\])?(\s*=|\s*\)|\s*;|\s*,|\s*\{)/g, '$2')
          .replace(/<[^>]+>/g, '');
        
        fs.writeFileSync(destPath, jsContent);
        console.log(`Transpiled ${file} to ${destFile}`);
      } catch (error) {
        console.error(`Error transpiling ${file}:`, error.message);
        console.log('Falling back to simple file copy');
        fs.copyFileSync(sourcePath, destPath);
      }
    } else {
      // For JS files, just copy them
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to ${destFile}`);
    }
  });
  
  console.log('Manual transpilation completed');
}

module.exports = { manuallyTranspileFiles };
