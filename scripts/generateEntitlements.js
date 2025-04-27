
const fs = require('fs');
const path = require('path');

/**
 * Generates macOS entitlements file for code signing
 * @param {string} buildDir - The build directory where entitlements will be saved
 */
function generateMacOSEntitlements(buildDir) {
  console.log(`Generating macOS entitlements in ${buildDir}`);
  
  if (!buildDir || typeof buildDir !== 'string') {
    console.error('Invalid buildDir provided to generateMacOSEntitlements');
    return;
  }
  
  const entitlementsPath = path.join(buildDir, 'entitlements.mac.plist');
  
  // Basic entitlements file for macOS apps
  const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.debugger</key>
    <true/>
    <key>com.apple.security.device.audio-input</key>
    <true/>
    <key>com.apple.security.device.microphone</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
  </dict>
</plist>`;
  
  try {
    fs.writeFileSync(entitlementsPath, entitlementsContent);
    console.log(`Created macOS entitlements file at: ${entitlementsPath}`);
  } catch (error) {
    console.error(`Error creating entitlements file: ${error.message}`);
  }
}

module.exports = { generateMacOSEntitlements };
