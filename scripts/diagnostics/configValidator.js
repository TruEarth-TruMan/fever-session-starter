
const fs = require('fs');
const path = require('path');
const { checkBasicConfig } = require('./checks/config/basicConfigChecks');
const { checkModuleFormat } = require('./checks/config/moduleFormatCheck');

function validateElectronBuilderConfig(rootDir) {
  console.log(`\n5. Checking electron-builder configuration`);
  
  // Check for both .cjs and .js files
  const possiblePaths = [
    path.join(rootDir, 'electron-builder.cjs'),
    path.join(rootDir, 'electron-builder.js')
  ];
  
  let configPath = null;
  
  for (const checkPath of possiblePaths) {
    console.log(`Checking for config at ${checkPath}: ${fs.existsSync(checkPath) ? 'EXISTS' : 'NOT FOUND'}`);
    if (fs.existsSync(checkPath)) {
      configPath = checkPath;
      break;
    }
  }
  
  if (!configPath) {
    console.log('❌ No electron-builder configuration file found');
    console.log('Creating a default configuration file...');
    
    configPath = path.join(rootDir, 'electron-builder.cjs');
    const defaultConfig = `/**
 * Fever Application Packaging Configuration
 */
module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  copyright: "Copyright © 2025",
  directories: { output: "release", buildResources: "build" },
  files: ["dist/**/*", "electron/**/*", "!node_modules/**/*"],
  mac: { 
    category: "public.app-category.music",
    target: [
      { target: "dmg", arch: ["x64", "arm64"] },
      { target: "zip", arch: ["x64", "arm64"] }
    ]
  },
  win: { target: [{ target: "nsis", arch: ["x64"] }] },
  publish: [{ provider: "generic", url: "https://feverstudio.live/update" }]
};`;
    
    try {
      fs.writeFileSync(configPath, defaultConfig);
      console.log(`Created default config at ${configPath}`);
    } catch (err) {
      console.log(`❌ Failed to create default config: ${err.message}`);
      return false;
    }
  }
  
  try {
    console.log(`Using config file: ${configPath}`);
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    // Check basic configuration requirements
    const checks = checkBasicConfig(configContent);
    
    // Check module format
    const hasValidModuleFormat = checkModuleFormat(configContent);
    
    return Object.values(checks).every(Boolean) && hasValidModuleFormat;
  } catch (err) {
    console.log(`❌ Error analyzing electron-builder config: ${err.message}`);
    return false;
  }
}

module.exports = { validateElectronBuilderConfig };
