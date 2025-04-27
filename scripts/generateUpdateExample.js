
const fs = require('fs');
const path = require('path');

function generateUpdateExample(rootDir) {
  // Get package.json version or use default
  let currentVersion = '1.0.1';
  try {
    const packageJson = require(path.join(rootDir, 'package.json'));
    currentVersion = packageJson.version || currentVersion;
  } catch (error) {
    console.warn('Could not read version from package.json, using default:', currentVersion);
  }

  // Create update manifest
  const updateJsonPath = path.join(rootDir, 'fever-update.json');
  const updateJsonContent = {
    version: currentVersion,
    notes: "New version with bug fixes and performance improvements",
    releaseDate: new Date().toISOString(),
    platforms: {
      "darwin-x64": {
        url: `https://feverstudio.live/download/mac/Fever-${currentVersion}-x64.dmg`,
        signature: "", // Optional: Add code signing signature here
      },
      "darwin-arm64": {
        url: `https://feverstudio.live/download/mac/Fever-${currentVersion}-arm64.dmg`,
        signature: "", // Optional: Add code signing signature here
      },
      "win32-x64": {
        url: `https://feverstudio.live/download/win/Fever-${currentVersion}-setup.exe`,
        signature: "", // Optional: Add code signing signature here
      }
    }
  };

  fs.writeFileSync(
    updateJsonPath, 
    JSON.stringify(updateJsonContent, null, 2),
    'utf-8'
  );
  
  console.log(`Generated update manifest at ${updateJsonPath}`);
  
  // Also copy to public directory for serving during development
  const publicUpdatePath = path.join(rootDir, 'public', 'fever-update.json');
  try {
    fs.writeFileSync(
      publicUpdatePath, 
      JSON.stringify(updateJsonContent, null, 2),
      'utf-8'
    );
    console.log(`Copied update manifest to ${publicUpdatePath} for development`);
  } catch (error) {
    console.warn(`Could not copy update manifest to public directory: ${error.message}`);
  }
}

module.exports = { generateUpdateExample };
