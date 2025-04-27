
const fs = require('fs');
const path = require('path');

function setupBuildDirectories(rootDir) {
  const buildDir = path.join(rootDir, 'build');
  const iconsDir = path.join(buildDir, 'icons');

  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
  }

  return { buildDir, iconsDir };
}

module.exports = { setupBuildDirectories };
