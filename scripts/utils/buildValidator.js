
const fs = require('fs');
const path = require('path');
const { log } = require('./logger');

function validateBuildConfig(rootDir) {
  if (!rootDir) {
    throw new Error('Invalid root directory provided');
  }
  
  log(`Validating build config for root directory: ${rootDir}`, false);

  const requiredFiles = [
    'package.json',
    'vite.config.ts'
  ];

  // Check for build-electron.cjs but don't fail if it's missing
  const buildElectronPath = path.resolve(rootDir, 'build-electron.cjs');
  if (!fs.existsSync(buildElectronPath)) {
    log(`Warning: build-electron.cjs not found at ${buildElectronPath}`, true);
  }

  // Check for electron-builder.cjs specifically and provide more detailed error
  let electronBuilderPath = path.resolve(rootDir, 'electron-builder.cjs');
  if (!fs.existsSync(electronBuilderPath)) {
    log(`electron-builder.cjs not found at ${electronBuilderPath}, checking for .js variant...`, false);
    electronBuilderPath = path.resolve(rootDir, 'electron-builder.js');
  }
  
  if (!fs.existsSync(electronBuilderPath)) {
    log(`Could not find electron-builder.cjs or electron-builder.js in ${rootDir}!`, true);
    log('Creating a default electron-builder.cjs config file...', false);
    
    // Create a default electron-builder.cjs if it doesn't exist
    const defaultConfig = `/**
 * Fever Application Packaging Configuration
 */
module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  copyright: "Copyright © 2025",
  
  // Icon configuration for all platforms
  icon: "build/icons/icon",
  
  // Electron Builder configuration settings
  directories: {
    output: "release", // Where the packaged apps will be placed
    buildResources: "build", // Where to find icons and other resources
  },
  
  // Files to include in the build
  files: [
    "dist/**/*", // Built Vite app
    "electron/**/*", // Electron main process files
    "!node_modules/**/*", // Exclude node_modules
  ],
  
  // macOS specific configuration
  mac: {
    category: "public.app-category.music",
    target: [
      { target: "dmg", arch: ["x64", "arm64"] },
      { target: "zip", arch: ["x64", "arm64"] }
    ],
    artifactName: "Fever-\${version}-\${arch}.\${ext}",
    darkModeSupport: true,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist",
    notarize: false,
    icon: "build/icons/icon.icns",
  },
  
  // Windows specific configuration
  win: {
    target: [
      { target: "nsis", arch: ["x64"] }
    ],
    artifactName: "Fever-\${version}-setup.\${ext}",
    icon: "build/icons/icon.ico",
  },
  
  // NSIS installer configuration for Windows
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Fever",
    installerIcon: "build/icons/icon.ico",
    uninstallerIcon: "build/icons/icon.ico",
    installerHeaderIcon: "build/icons/icon.ico",
    uninstallDisplayName: "Fever \${version}",
  },
  
  // App update configuration
  publish: [
    {
      provider: "generic",
      url: "https://feverstudio.live/update",
      channel: "latest",
    }
  ],
};`;
    
    const newConfigPath = path.resolve(rootDir, 'electron-builder.cjs');
    try {
      fs.writeFileSync(newConfigPath, defaultConfig);
      log(`Created default electron-builder.cjs config file at ${newConfigPath}`, false);
      electronBuilderPath = newConfigPath;
    } catch (err) {
      log(`Failed to create default config: ${err.message}`, true);
    }
  } else {
    log(`Found electron-builder config at: ${electronBuilderPath}`, false);
    
    // Try loading the config to verify it
    try {
      // Clear require cache to ensure we get a fresh copy
      if (require.cache[require.resolve(electronBuilderPath)]) {
        delete require.cache[require.resolve(electronBuilderPath)];
        log('Cleared require cache for config file', false);
      }
      
      log(`Loading electron-builder config to verify it...`, false);
      const config = require(electronBuilderPath);
      
      if (!config.appId) {
        log('Warning: Missing appId in electron-builder config', true);
      }
      
      if (!config.directories) {
        log('Warning: Missing directories in electron-builder config', true);
      }
      
      if (!config.files) {
        log('Warning: Missing files in electron-builder config', true);
      }
    } catch (err) {
      log(`Error loading electron-builder config: ${err.message}`, true);
      log('Will attempt to continue with the build process anyway', false);
    }
  }
  
  // Check other required files
  const missingFiles = requiredFiles.filter(file => 
    !fs.existsSync(path.join(rootDir, file))
  );

  if (missingFiles.length > 0) {
    throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
  }

  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    log(`Reading package.json from ${packageJsonPath}`, false);
    
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    log(`Successfully read package.json content (${packageJsonContent.length} bytes)`, false);
    
    const packageJson = JSON.parse(packageJsonContent);
    
    if (!packageJson.scripts?.build) {
      throw new Error('No build script found in package.json');
    }
  } catch (error) {
    throw new Error(`Error validating package.json: ${error.message}`);
  }

  return true;
}

module.exports = { validateBuildConfig };
