
/**
 * Generates entitlements files required for macOS builds
 */
const fs = require('fs');
const path = require('path');

function generateMacOSEntitlements(buildDir) {
  console.log('Generating macOS entitlements file...');
  
  try {
    const entitlementsPath = path.join(buildDir, 'entitlements.mac.plist');
    
    const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.device.audio-input</key>
    <true/>
  </dict>
</plist>`;
    
    fs.writeFileSync(entitlementsPath, entitlementsContent);
    console.log(`Created macOS entitlements file at: ${entitlementsPath}`);
    return true;
  } catch (error) {
    console.error(`Failed to create macOS entitlements: ${error.message}`);
    return false;
  }
}

module.exports = { generateMacOSEntitlements };
