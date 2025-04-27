
const fs = require('fs');
const path = require('path');

function validateProjectRoot(rootDir) {
  console.log(`\n1. Checking project root: ${rootDir}`);
  
  // Use absolute paths everywhere
  const files = {
    packageJson: fs.existsSync(path.resolve(rootDir, 'package.json')),
    viteConfig: fs.existsSync(path.resolve(rootDir, 'vite.config.ts')),
    electronBuilderCjs: fs.existsSync(path.resolve(rootDir, 'electron-builder.cjs')),
    electronBuilderJs: fs.existsSync(path.resolve(rootDir, 'electron-builder.js')),
    buildJs: fs.existsSync(path.resolve(rootDir, 'build.js')),
    buildElectron: fs.existsSync(path.resolve(rootDir, 'build-electron.cjs'))
  };

  Object.entries(files).forEach(([file, exists]) => {
    console.log(`- ${file}: ${exists ? '✅' : '❌'}`);
  });

  const hasElectronBuilderConfig = files.electronBuilderCjs || files.electronBuilderJs;
  console.log(`- Has electron-builder config: ${hasElectronBuilderConfig ? '✅' : '❌'}`);
  
  if (!hasElectronBuilderConfig) {
    console.log('WARNING: No electron-builder configuration file found!');
    console.log('Will attempt to create a default one during the build process.');
    
    // Create a default electron-builder.cjs config file
    const configPath = path.resolve(rootDir, 'electron-builder.cjs');
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
      console.log(`Created default electron-builder.cjs config at: ${configPath}`);
      console.log(`Verifying the file was created: ${fs.existsSync(configPath)}`);
    } catch (err) {
      console.log(`Error creating default config: ${err.message}`);
    }
  }

  return files.packageJson && files.viteConfig;
}

module.exports = { validateProjectRoot };
