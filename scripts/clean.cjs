const fs = require('fs');
const path = require('path');

function cleanBuildArtifacts(rootDir) {
  const releaseDir = path.join(rootDir, 'release');
  const distributionDir = path.join(rootDir, 'distribution');

  if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
    console.log(`Deleted release directory: ${releaseDir}`);
  }

  if (fs.existsSync(distributionDir)) {
    fs.rmSync(distributionDir, { recursive: true, force: true });
    console.log(`Deleted distribution directory: ${distributionDir}`);
  }
}

module.exports = { cleanBuildArtifacts };
