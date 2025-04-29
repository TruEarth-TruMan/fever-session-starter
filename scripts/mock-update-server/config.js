
/**
 * Configuration for the mock update server
 */
const path = require('path');
const fs = require('fs');

// Get project version from package.json
const getPackageVersion = () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  return packageJson.version;
};

// Configuration
const config = {
  PORT: process.env.PORT || 3000,
  RELEASE_DIR: path.join(process.cwd(), 'release'),
  UPDATE_DIR: path.join(process.cwd(), 'update'),
  currentVersion: getPackageVersion(),
  channels: ['latest', 'beta', 'dev']
};

// Beta testers mapping (in a real scenario, this would be in a database)
const betaTesters = {
  // Example beta tester IDs - in production this would be stored securely
  'BETA123': { name: 'Test User 1', allowedChannels: ['beta', 'latest'] },
  'BETA456': { name: 'Test User 2', allowedChannels: ['beta', 'dev', 'latest'] },
  'BETADEV': { name: 'Developer', allowedChannels: ['dev', 'beta', 'latest'] }
};

module.exports = {
  config,
  betaTesters,
  ensureUpdateDirectory: () => {
    if (!fs.existsSync(config.UPDATE_DIR)) {
      fs.mkdirSync(config.UPDATE_DIR, { recursive: true });
    }
  }
};
