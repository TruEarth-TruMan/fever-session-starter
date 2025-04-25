
const fs = require('fs');
const path = require('path');

function generateUpdateExample(rootDir) {
  const updateJsonPath = path.join(rootDir, 'fever-update.json');
  const currentVersion = '1.0.1'; // This should match your electron-builder version

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
}

module.exports = { generateUpdateExample };
