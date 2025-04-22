
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
  },
  
  // Windows specific configuration
  win: {
    target: [
      { target: "nsis", arch: ["x64"] }
    ],
    artifactName: "Fever-${version}-setup.${ext}",
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
  
  // App update configuration
  publish: [
    {
      provider: "generic",
      url: "https://mydomain.com/update",
      channel: "latest",
    }
  ],
  
  // Common configuration for all platforms
  files: [
    "dist/**/*",
    "electron/**/*",
    "!node_modules/**/*",
  ],
  
  // Define build resources location
  directories: {
    output: "release",
    buildResources: "build",
  },
};
