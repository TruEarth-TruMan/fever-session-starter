
/**
 * Route handlers for the mock update server
 */
const fs = require('fs');
const path = require('path');
const { config, betaTesters } = require('./config');
const { generateUpdateManifest } = require('./manifest-generator');

/**
 * Handle update route requests
 */
function handleUpdateRoute(res, channel = 'latest', betaId = null) {
  // For beta/dev channels, validate beta ID if provided
  if ((channel === 'beta' || channel === 'dev') && betaId) {
    // Check if beta tester is allowed to access this channel
    const tester = betaTesters[betaId];
    if (!tester || !tester.allowedChannels.includes(channel)) {
      res.statusCode = 403;
      res.end(JSON.stringify({
        error: 'Access denied',
        message: 'Your beta tester ID does not have access to this update channel'
      }));
      return;
    }
  }
  
  // Serve the appropriate channel manifest
  const validChannels = ['latest', 'beta', 'dev'];
  const useChannel = validChannels.includes(channel) ? channel : 'latest';
  
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(generateUpdateManifest(config.currentVersion, useChannel, betaId)));
}

/**
 * Handle download route requests
 */
function handleDownloadRoute(req, res, filename) {
  const filePath = path.join(config.RELEASE_DIR, filename);
  
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      // Handle range requests (for resumable downloads)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, {start, end});
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'application/octet-stream'
      });
      file.pipe(res);
    } else {
      // Normal download
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } else {
    // File not found
    res.statusCode = 404;
    res.end(JSON.stringify({
      error: 'File not found', 
      path: filePath,
      availableFiles: fs.existsSync(config.RELEASE_DIR) ? fs.readdirSync(config.RELEASE_DIR) : []
    }));
  }
}

/**
 * Handle status route requests
 */
function handleStatusRoute(res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'online',
    version: config.currentVersion,
    channels: config.channels,
    betaTestersCount: Object.keys(betaTesters).length,
    updateManifests: config.channels.map(c => `http://localhost:${config.PORT}/update/${c}`),
    downloadPath: `http://localhost:${config.PORT}/download/`
  }));
}

/**
 * Handle beta verification route requests
 */
function handleVerifyBetaRoute(res, betaId) {
  if (betaId && betaTesters[betaId]) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      valid: true,
      name: betaTesters[betaId].name,
      allowedChannels: betaTesters[betaId].allowedChannels
    }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ valid: false, message: 'Invalid beta tester ID' }));
  }
}

/**
 * Handle not found route requests
 */
function handleNotFoundRoute(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    error: 'Not found',
    availableRoutes: [
      '/update',
      '/update/latest',
      '/update/beta',
      '/update/dev',
      '/download/:filename',
      '/status',
      '/verify-beta?id=BETA123'
    ]
  }));
}

module.exports = {
  handleUpdateRoute,
  handleDownloadRoute,
  handleStatusRoute,
  handleVerifyBetaRoute,
  handleNotFoundRoute
};
