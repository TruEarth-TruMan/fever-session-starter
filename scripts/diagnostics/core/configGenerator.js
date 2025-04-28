
const fs = require('fs');
const path = require('path');
const { log } = require('../../utils/logger');

function createDefaultConfig(rootDir, configName) {
  const configPath = path.join(rootDir, configName);
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
    log(`Created default config at ${configPath}`, false);
    return true;
  } catch (err) {
    log(`Failed to create default config: ${err.message}`, true);
    return false;
  }
}

module.exports = { createDefaultConfig };
