
const fs = require('fs');
const path = require('path');

/**
 * Generates the macOS entitlements file needed for code signing
 * @param {string} buildDir - The build directory where entitlements will be saved
 */
function generateMacOSEntitlements(buildDir) {
  console.log(`Generating macOS entitlements in ${buildDir}`);
  
  const entitlementsPath = path.join(buildDir, 'entitlements.mac.plist');
  const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.device.audio-input</key>
    <true/>
  </dict>
</plist>`;

  console.log(`Writing entitlements file to: ${entitlementsPath}`);
  fs.writeFileSync(entitlementsPath, entitlementsContent);
  console.log(`Generated entitlements file at ${entitlementsPath}`);
}

module.exports = { generateMacOSEntitlements };
