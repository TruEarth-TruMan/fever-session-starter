
const fs = require('fs');
const path = require('path');
const { safeRequire } = require('../utils/pathResolver');

function validateElectronBuilderConfig(rootDir) {
  console.log(`\n5. Checking electron-builder configuration`);
  
  // Check for both .cjs and .js files using absolute paths
  const possiblePaths = [
    path.resolve(rootDir, 'electron-builder.cjs'),
    path.resolve(rootDir, 'electron-builder.js')
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
    
    configPath = path.resolve(rootDir, 'electron-builder.cjs');
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
    
    // Use our safe require function instead of direct require
    const config = safeRequire(configPath);
    
    if (!config) {
      console.log('❌ Failed to load config file');
      return false;
    }
    
    // Basic validation of config object
    const hasAppId = config.appId && typeof config.appId === 'string';
    const hasProductName = config.productName && typeof config.productName === 'string';
    const hasDirectories = config.directories && typeof config.directories === 'object';
    const hasFiles = config.files && Array.isArray(config.files);
    
    console.log(`- appId: ${hasAppId ? '✅' : '❌'}`);
    console.log(`- productName: ${hasProductName ? '✅' : '❌'}`);
    console.log(`- directories: ${hasDirectories ? '✅' : '❌'}`);
    console.log(`- files: ${hasFiles ? '✅' : '❌'}`);
    
    return hasAppId && hasProductName && hasDirectories && hasFiles;
    
  } catch (err) {
    console.log(`❌ Error analyzing electron-builder config: ${err.message}`);
    console.log(`Stack: ${err.stack || 'No stack trace available'}`);
    return false;
  }
}

module.exports = { validateElectronBuilderConfig };
