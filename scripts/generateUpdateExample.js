
const fs = require('fs');
const path = require('path');

function generateUpdateExample(rootDir) {
  const updateJsonExample = path.join(rootDir, 'update-example.json');
  const updateJsonContent = {
    version: "1.0.1",
    notes: "New version with bug fixes and performance improvements",
    releaseDate: "2025-04-22T12:00:00.000Z",
    platforms: {
      "darwin-x64": {
        url: "https://mydomain.com/download/mac/Fever-1.0.1-x64.dmg"
      },
      "darwin-arm64": {
        url: "https://mydomain.com/download/mac/Fever-1.0.1-arm64.dmg"
      },
      "win32-x64": {
        url: "https://mydomain.com/download/win/Fever-1.0.1-setup.exe"
      }
    }
  };

  fs.writeFileSync(updateJsonExample, JSON.stringify(updateJsonContent, null, 2));
}

module.exports = { generateUpdateExample };

