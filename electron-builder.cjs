// electron-builder.cjs

module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  copyright: "Copyright © 2025",

  // Icon configuration for all platforms
  icon: "build/icons/icon",

  directories: {
    output: "release",
    buildResources: "build"
  },

  asar: true,

  files: [
    "dist/**/*",                 // Frontend build (Vite)
    "dist-electron/**/*",       // Compiled Electron backend
    "electron/**/*",            // Raw Electron scripts, if needed
    "preload.js",               // Preload script
    "main.cjs",                 // Explicitly include Electron main
    "package.json"              // Required for versioning and metadata
  ],

  extraMetadata: {
    main: "dist-electron/main.js"
  },

  extraFiles: [],

  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    icon: "build/icons/icon.ico",
    artifactName: "Fever-${version}-setup.${ext}"
  },

  nsis: {
    oneClick: false,
    perMachine: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    installerIcon: "build/icons/icon.ico",
    uninstallerIcon: "build/icons/icon.ico",
    installerHeaderIcon: "build/icons/icon.ico",
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Fever",
    uninstallDisplayName: "Fever ${version}"
  },

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
    notarize: false,
    icon: "build/icons/icon.icns"
  },

  publish: [
    {
      provider: "generic",
      url: "https://feverstudio.live/update/latest",
      channel: "latest"
    },
    {
      provider: "generic",
      url: "https://feverstudio.live/update/beta",
      channel: "beta"
    },
    {
      provider: "generic",
      url: "https://feverstudio.live/update/dev",
      channel: "dev"
    }
  ],

  generateUpdatesFilesForAllChannels: true,

  buildDependenciesFromSource: true
};
