
const fs = require('fs');
const path = require('path');

/**
 * Loads the electron-builder configuration
 * @param {string} rootDir - The root directory of the project
 * @returns {Object} The electron-builder configuration
 */
function loadElectronConfig(rootDir) {
  console.log(`loadElectronConfig called with rootDir: ${rootDir}`);
  if (!rootDir || typeof rootDir !== 'string') {
    console.error('Error: Invalid rootDir provided to loadElectronConfig');
    rootDir = process.cwd();
    console.log(`Falling back to current directory: ${rootDir}`);
  }
  
  console.log(`Current working directory: ${process.cwd()}`);
  console.log(`Looking for electron-builder config in: ${rootDir}`);
  
  // Strictly prioritize .cjs files first before checking .js files
  const possibleConfigFiles = [
    'electron-builder.cjs',
    'electron-builder.config.cjs',
    'electronBuilder.cjs',
    'electron-builder.js',
    'electron-builder.config.js',
    'electronBuilder.js'
  ];
  
  let configPath = null;
  
  // List all files in the root directory for debugging
  try {
    console.log(`Files in ${rootDir}:`);
    const dirFiles = fs.readdirSync(rootDir);
    dirFiles.forEach(file => {
      console.log(`- ${file}`);
    });
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
  }
  
  for (const filename of possibleConfigFiles) {
    const fullPath = path.resolve(rootDir, filename);
    console.log(`Checking for config at: ${fullPath} - Exists: ${fs.existsSync(fullPath)}`);
    
    if (fs.existsSync(fullPath)) {
      configPath = fullPath;
      console.log(`Found electron-builder config at: ${configPath}`);
      break;
    }
  }
  
  if (!configPath) {
    console.error('No electron-builder configuration file found.');
    
    // Create a default configuration file - using .cjs extension
    configPath = path.resolve(rootDir, 'electron-builder.cjs');
    console.log(`Creating default config at: ${configPath}`);
    
    const defaultConfig = `
/**
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
    
    try {
      fs.writeFileSync(configPath, defaultConfig);
      console.log(`Created default electron-builder config at: ${configPath}`);
    } catch (err) {
      console.error(`Failed to create default config: ${err.message}`);
      throw new Error(`Could not create default electron-builder config: ${err.message}`);
    }
  }
  
  try {
    console.log(`Loading config from: ${configPath}`);
    // Clear require cache to ensure we get a fresh copy
    if (require.cache[require.resolve(configPath)]) {
      delete require.cache[require.resolve(configPath)];
      console.log('Cleared require cache for config file');
    }
    
    // Use dynamic import with a try-catch as a more reliable alternative
    console.log('Attempting to load config with dynamic import...');
    try {
      const config = require(configPath);
      console.log('Config loaded successfully. Required properties:');
      console.log(`- appId: ${config.appId ? '✅' : '❌'}`);
      console.log(`- directories: ${config.directories ? '✅' : '❌'}`);
      console.log(`- files: ${config.files ? '✅' : '❌'}`);
      return config;
    } catch (err) {
      console.error('Failed with dynamic import too:', err.message);
      throw err;
    }
  } catch (error) {
    console.error('Failed to load electron-builder config:', error);
    console.error('Error details:', error.stack);
    
    // As a last resort, try to create a temporary config object
    console.log('Creating fallback config object');
    return {
      appId: "com.fever.audioapp",
      productName: "Fever",
      copyright: "Copyright © 2025",
      directories: { output: "release", buildResources: "build" },
      files: ["dist/**/*", "electron/**/*", "!node_modules/**/*"],
      mac: { category: "public.app-category.music", target: ["dmg", "zip"] },
      win: { target: ["nsis"] },
      publish: [{ provider: "generic", url: "https://feverstudio.live/update" }]
    };
  }
}

module.exports = { loadElectronConfig };
