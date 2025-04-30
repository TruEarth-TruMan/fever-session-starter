
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
  
  // Use ASAR for better packaging (recommended)
  asar: true,
  
  // Files to include in the build
  files: [
    "dist/**/*", // Built Vite app
    "electron/**/*", // Electron main process files
    "build/**/*", // Build resources
    "dist-electron/**/*", // Compiled Electron files
    "preload.js", // Explicit include preload
    "main.cjs", // Explicit include main
    "!node_modules/**/*", // Exclude node_modules
  ],
  
  // Explicitly define entry points
  extraMetadata: {
    main: "dist-electron/main.js"
  },
  
  // macOS specific configuration
  mac: {
    category: "public.app-category.music",
    target: [
      { target: "dmg", arch: ["x64", "arm64"] },
      { target: "zip", arch: ["x64", "arm64"] }
    ],
    artifactName: "Fever-${version}-${arch}.${ext}",
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
    artifactName: "Fever-${version}-setup.${ext}",
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
    uninstallDisplayName: "Fever ${version}",
  },
  
  // App update configuration for auto-updates with multiple channels
  publish: [
    {
      provider: "generic",
      url: "https://feverstudio.live/update/latest",
      channel: "latest",
    },
    {
      provider: "generic",
      url: "https://feverstudio.live/update/beta",
      channel: "beta",
    },
    {
      provider: "generic",
      url: "https://feverstudio.live/update/dev",
      channel: "dev",
    }
  ],
  
  // Generate update info files for all channels
  generateUpdatesFilesForAllChannels: true,
  
  // For better debugging during build process
  buildDependenciesFromSource: true,
};
