
const fs = require('fs');
const path = require('path');
const { log } = require('./logger');
const { resolveFilePath } = require('./pathResolver');

function validateBuildConfig(rootDir) {
  if (!rootDir) {
    throw new Error('Invalid root directory provided');
  }

  const requiredFiles = [
    'package.json',
    'vite.config.ts'
  ];

  // Check for build-electron.cjs but don't fail if it's missing
  const buildElectronPath = path.join(rootDir, 'build-electron.cjs');
  if (!fs.existsSync(buildElectronPath)) {
    log(`Warning: build-electron.cjs not found at ${buildElectronPath}`, true);
  }

  // Check for electron-builder.cjs specifically and provide more detailed error
  let electronBuilderPath = resolveFilePath(rootDir, 'electron-builder.cjs');
  if (!electronBuilderPath) {
    electronBuilderPath = resolveFilePath(rootDir, 'electron-builder.js');
  }
  
  if (!electronBuilderPath) {
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
    
    const newConfigPath = path.join(rootDir, 'electron-builder.cjs');
    try {
      fs.writeFileSync(newConfigPath, defaultConfig);
      log(`Created default electron-builder.cjs config file at ${newConfigPath}`, false);
      electronBuilderPath = newConfigPath;
    } catch (err) {
      log(`Failed to create default config: ${err.message}`, true);
    }
  } else {
    log(`Found electron-builder config at: ${electronBuilderPath}`, false);
  }
  
  // Check other required files
  const missingFiles = requiredFiles.filter(file => 
    !fs.existsSync(path.join(rootDir, file))
  );

  if (missingFiles.length > 0) {
    throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
  }

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
    );
    
    if (!packageJson.scripts?.build) {
      throw new Error('No build script found in package.json');
    }
  } catch (error) {
    throw new Error(`Error validating package.json: ${error.message}`);
  }

  return true;
}

module.exports = { validateBuildConfig };
