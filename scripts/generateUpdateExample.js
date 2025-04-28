
/**
 * Generates example update manifest for auto-updater testing
 */
const fs = require('fs');
const path = require('path');

function generateUpdateExample(rootDir) {
  console.log('Generating example update manifest...');
  
  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const appVersion = packageJson.version || '1.0.0';
    
    const updateManifest = {
      version: appVersion,
      notes: "What's new in this version:\n- Improved performance\n- Bug fixes\n- New features",
      pub_date: new Date().toISOString(),
      platforms: {
        win32: {
          signature: "",
          url: "https://feverstudio.live/download/fever-${version}-setup.exe"
        },
        darwin: {
          signature: "",
          url: "https://feverstudio.live/download/fever-${version}-mac.zip"
        },
        "darwin-arm64": {
          signature: "",
          url: "https://feverstudio.live/download/fever-${version}-arm64-mac.zip"
        }
      }
    };
    
    const updateExamplePath = path.join(rootDir, 'update-example.json');
    fs.writeFileSync(updateExamplePath, JSON.stringify(updateManifest, null, 2));
    
    console.log(`Created update example at: ${updateExamplePath}`);
    return true;
  } catch (error) {
    console.error(`Failed to create update example: ${error.message}`);
    return false;
  }
}

module.exports = { generateUpdateExample };
