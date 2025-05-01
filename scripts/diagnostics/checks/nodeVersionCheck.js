const semver = require('semver');

function checkNodeVersion(requiredVersion = '16.0.0') {
  const currentVersion = process.version.replace('v', '');
  console.log(`Current Node.js version: ${currentVersion}`);

  if (!semver.gte(currentVersion, requiredVersion)) {
    console.error(`❌ Node.js version ${currentVersion} is too old. Requires ${requiredVersion} or higher.`);
    return {
      isCompatible: false,
      requiresElectronBuilderUpdate: false
    };
  }

  const isNodeV22Plus = semver.gte(currentVersion, '22.0.0');
  if (isNodeV22Plus) {
    console.log('✅ Node.js v22+ detected. Electron-builder v26+ is required.');
    return {
      isCompatible: true,
      requiresElectronBuilderUpdate: true
    };
  }

  console.log('✅ Node.js version is compatible with electron-builder.');
  return {
    isCompatible: true,
    requiresElectronBuilderUpdate: false
  };
}

module.exports = { checkNodeVersion };

// Optional: exit immediately if run directly as a CLI check
if (require.main === module) {
  const result = checkNodeVersion('16.0.0');
  if (!result.isCompatible) {
    process.exit(1);
  }
}
