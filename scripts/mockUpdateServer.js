
/**
 * Mock Update Server for testing Electron auto-updates locally
 * 
 * This script creates a simple HTTP server that serves update files
 * and provides the expected endpoints for the Electron updater.
 */

const { ensureUpdateDirectory } = require('./mock-update-server/config');
const { createUpdateManifests } = require('./mock-update-server/manifest-generator');
const { createServer, startServer } = require('./mock-update-server/server');

// Initialize the mock update server
function initializeMockUpdateServer() {
  // Ensure update directory exists
  ensureUpdateDirectory();
  
  // Create update manifests
  createUpdateManifests();
  
  // Create and start server
  const server = createServer();
  startServer(server);
}

// Start the server
initializeMockUpdateServer();
