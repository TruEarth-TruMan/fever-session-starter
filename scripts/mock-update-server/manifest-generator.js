
/**
 * Generates update manifests for different channels
 */
const fs = require('fs');
const path = require('path');
const { config } = require('./config');

/**
 * Create a simple update manifest for a version and channel
 * @param {string} version Version number
 * @param {string} channel Release channel (latest, beta, dev)
 * @param {string|null} betaId Optional beta tester ID for personalization
 * @returns {object} Generated update manifest
 */
function generateUpdateManifest(version, channel = 'latest', betaId = null) {
  // Base URL for downloads (in real deployment, this would be your server URL)
  const baseUrl = `http://localhost:${config.PORT}/download`;
  
  // Prepare notes based on channel
  let notes = `Test release ${version}`;
  if (channel === 'beta') {
    notes = `Beta release ${version}\n- New experimental features\n- May contain bugs`;
  } else if (channel === 'dev') {
    notes = `Development build ${version}\n- Unstable features\n- For testing only`;
  }
  
  // If beta ID provided and valid, personalize the notes
  if (betaId && global.betaTesters[betaId]) {
    notes = `${notes}\n\nHello ${global.betaTesters[betaId].name}! Thanks for testing.`;
  }
  
  return {
    version,
    notes,
    pub_date: new Date().toISOString(),
    platforms: {
      win32: {
        signature: "",
        url: `${baseUrl}/fever-${version}-setup.exe`
      },
      darwin: {
        signature: "",
        url: `${baseUrl}/fever-${version}-mac.zip`
      },
      "darwin-arm64": {
        signature: "",
        url: `${baseUrl}/fever-${version}-arm64-mac.zip`
      }
    }
  };
}

/**
 * Creates update manifests for all channels
 */
function createUpdateManifests() {
  // Create update manifests for different channels
  config.channels.forEach(channel => {
    const updateManifest = generateUpdateManifest(config.currentVersion, channel);
    const updateManifestPath = path.join(config.UPDATE_DIR, `fever-update-${channel}.json`);
    fs.writeFileSync(updateManifestPath, JSON.stringify(updateManifest, null, 2));
    console.log(`Created ${channel} update manifest at: ${updateManifestPath}`);
  });

  // Default update manifest (for backward compatibility)
  const defaultManifest = generateUpdateManifest(config.currentVersion);
  const defaultManifestPath = path.join(config.UPDATE_DIR, 'fever-update.json');
  fs.writeFileSync(defaultManifestPath, JSON.stringify(defaultManifest, null, 2));
  console.log(`Created default update manifest at: ${defaultManifestPath}`);
}

module.exports = {
  generateUpdateManifest,
  createUpdateManifests
};
