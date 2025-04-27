
const fs = require('fs');
const path = require('path');
const { resolveFilePath } = require('./utils/pathResolver');

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
  
  // Try to find the config file in various locations with more debugging info
  const possiblePaths = [
    path.join(rootDir, 'electron-builder.js'),
    path.join(rootDir, 'config', 'electron-builder.js'),
    path.join(rootDir, 'build', 'electron-builder.js'),
    path.join(process.cwd(), 'electron-builder.js')
  ];
  
  let configPath = null;
  
  // Check each possible path and use the first one found
  for (const possPath of possiblePaths) {
    console.log(`Checking for config at: ${possPath}`);
    if (fs.existsSync(possPath)) {
      configPath = possPath;
      console.log(`Found config at: ${configPath}`);
      break;
    }
  }
  
  // If not found through direct paths, try resolveFilePath
  if (!configPath) {
    configPath = resolveFilePath(rootDir, 'electron-builder.js');
    if (configPath) {
      console.log(`Found config through resolveFilePath at: ${configPath}`);
    }
  }
  
  if (!configPath) {
    console.error(`Config not found at any expected location`);
    console.error(`Current directory: ${process.cwd()}`);
    console.error(`Root directory: ${rootDir}`);
    
    // Check files in root directory for debugging
    try {
      console.error(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);
    } catch (err) {
      console.error(`Error reading directory: ${err.message}`);
    }
    
    // Create a minimal config as a fallback
    configPath = path.join(rootDir, 'electron-builder.js');
    console.log('Creating a minimal electron-builder config file...');
    const minimalConfig = `
/**
 * Fever Application Packaging Configuration
 * 
 * This configuration file works with electron-builder to package
 * the application for distribution on macOS and Windows.
 */

// Export the configuration object for electron-builder
module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  copyright: "Copyright © 2025",
  
  // Icon configuration for all platforms
  // These files should be placed in the build/icons directory
  // Uses OS-specific formats: .icns for macOS, .ico for Windows
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
    notarize: false, // Set to true when credentials are available
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
      fs.writeFileSync(configPath, minimalConfig);
      console.log(`Created minimal config at: ${configPath}`);
    } catch (err) {
      console.error(`Failed to write config: ${err.message}`);
      throw new Error(`Failed to create config: ${err.message}`);
    }
  }
  
  try {
    console.log(`Loading electron-builder config from ${configPath}`);
    // Use dynamic import to avoid caching issues
    delete require.cache[require.resolve(configPath)];
    
    // Try with absolute path
    const absolutePath = path.resolve(configPath);
    console.log(`Trying to load from absolute path: ${absolutePath}`);
    
    // Ensure the file exists before requiring it
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Config file does not exist at resolved path: ${absolutePath}`);
    }
    
    // For Node.js v22 compatibility, check the file content first
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    if (!fileContent.includes('module.exports =')) {
      console.warn('Warning: electron-builder.js may not be using CommonJS format. This could cause issues.');
    }
    
    // Load the config explicitly with require
    const config = require(absolutePath);
    
    if (!config) {
      throw new Error('Config file was loaded but returned empty or undefined');
    }
    
    console.log('Config loaded successfully:', config ? 'Yes' : 'No');
    return config;
  } catch (error) {
    console.error('Failed to load electron-builder config:', error);
    
    // Try an alternative approach for Node.js v22
    try {
      console.log('Attempting alternative loading method for Node.js v22...');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      // Use Function constructor as a last resort (not ideal but can work)
      const configFn = new Function('module', 'exports', 'require', configContent);
      const mod = { exports: {} };
      configFn(mod, mod.exports, require);
      
      if (!mod.exports || Object.keys(mod.exports).length === 0) {
        throw new Error('Alternative loading method failed to extract config');
      }
      
      console.log('Config loaded using alternative method');
      return mod.exports;
    } catch (altError) {
      console.error('Alternative loading method also failed:', altError);
      throw error; // Throw the original error
    }
  }
}

module.exports = { loadElectronConfig };
