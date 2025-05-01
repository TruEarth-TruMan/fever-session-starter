const fs = require('fs');
const path = require('path');

function ensureDirectories(rootDir) {
  const releaseDir = path.join(rootDir, 'release');
  const distributionDir = path.join(rootDir, 'distribution');

  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir);
    console.log(`Created ${releaseDir}`);
  }
  if (!fs.existsSync(distributionDir)) {
    fs.mkdirSync(distributionDir);
    console.log(`Created ${distributionDir}`);
  }
}

module.exports = { ensureDirectories };
