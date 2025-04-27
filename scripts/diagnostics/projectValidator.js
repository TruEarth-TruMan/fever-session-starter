
const fs = require('fs');
const path = require('path');

function validateProjectRoot(rootDir) {
  console.log(`\n1. Checking project root: ${rootDir}`);
  
  const files = {
    packageJson: fs.existsSync(path.join(rootDir, 'package.json')),
    viteConfig: fs.existsSync(path.join(rootDir, 'vite.config.ts')),
    electronBuilder: fs.existsSync(path.join(rootDir, 'electron-builder.js')),
    buildJs: fs.existsSync(path.join(rootDir, 'build.js')),
    buildElectron: fs.existsSync(path.join(rootDir, 'build-electron.cjs'))
  };

  Object.entries(files).forEach(([file, exists]) => {
    console.log(`- ${file}: ${exists ? '✅' : '❌'}`);
  });

  return files.packageJson && files.viteConfig;
}

module.exports = { validateProjectRoot };
