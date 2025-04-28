
/**
 * Templates for build system modules
 */

/**
 * Default content for build validator module
 */
function getDefaultBuildValidatorContent() {
  return `
const fs = require('fs');
const path = require('path');
const { log } = require('./logger');

function validateBuildConfig(rootDir) {
  log("Validating build configuration", false);
  
  // Check for electron-builder config
  const configPath = path.join(rootDir, 'electron-builder.cjs');
  if (!fs.existsSync(configPath)) {
    log("Creating default electron-builder.cjs", false);
    const defaultConfig = \`/**
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
};\`;
    
    fs.writeFileSync(configPath, defaultConfig);
    log("Created default electron-builder.cjs", false);
  }
  
  // Additional validation logic
  return true;
}

module.exports = { validateBuildConfig };`;
}

/**
 * Default content for dependency verifier module
 */
function getDefaultDependencyVerifierContent() {
  return `
const fs = require('fs');
const path = require('path');

async function verifyDependencies(rootDir) {
  console.log('Verifying dependencies...');
  
  // Check if package.json exists
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found');
    return false;
  }
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check required dependencies
  const requiredDeps = ['electron', 'electron-builder', 'vite'];
  const missingDeps = [];
  
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
      console.warn(\`Missing dependency: \${dep}\`);
      missingDeps.push(dep);
    }
  });
  
  return missingDeps.length === 0;
}

module.exports = { verifyDependencies };`;
}

module.exports = {
  getDefaultBuildValidatorContent,
  getDefaultDependencyVerifierContent
};
