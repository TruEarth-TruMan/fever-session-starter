
/**
 * HTTP server implementation for the mock update server
 */
const http = require('http');
const url = require('url');
const { config, betaTesters } = require('./config');
const {
  handleUpdateRoute,
  handleDownloadRoute,
  handleStatusRoute,
  handleVerifyBetaRoute,
  handleNotFoundRoute
} = require('./route-handlers');

/**
 * Create and configure the HTTP server
 */
function createServer() {
  // Make betaTesters globally available for the manifest generator
  global.betaTesters = betaTesters;

  // Create an HTTP server
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    console.log(`${req.method} ${pathname}${Object.keys(query).length > 0 ? ` (query: ${JSON.stringify(query)})` : ''}`);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    
    // Route handling
    if (pathname === '/update' || pathname === '/fever-update.json') {
      // Check for beta ID in query params
      handleUpdateRoute(res, 'latest', query.betaId);
    }
    else if (pathname.startsWith('/update/')) {
      // Get channel from URL
      const channel = pathname.replace('/update/', '');
      handleUpdateRoute(res, channel, query.betaId);
    }
    else if (pathname.startsWith('/download/')) {
      // Extract the filename from the path
      const filename = pathname.replace('/download/', '');
      handleDownloadRoute(req, res, filename);
    } 
    else if (pathname === '/status') {
      handleStatusRoute(res);
    }
    else if (pathname === '/verify-beta') {
      handleVerifyBetaRoute(res, query.id);
    }
    else {
      handleNotFoundRoute(res);
    }
  });

  return server;
}

/**
 * Start the server and display welcome message
 */
function startServer(server) {
  server.listen(config.PORT, () => {
    console.log(`
┌─────────────────────────────────────────────────┐
│                                                 │
│   Fever Mock Update Server                      │
│                                                 │
│   Running at: http://localhost:${config.PORT}            │
│   Current version: ${config.currentVersion}                   │
│                                                 │
│   Available endpoints:                          │
│    • /update                  - Default update  │
│    • /update/latest           - Stable channel  │
│    • /update/beta             - Beta channel    │
│    • /update/dev              - Dev channel     │
│    • /status                  - Server status   │
│                                                 │
│   Test beta IDs:                                │
│    • BETA123, BETA456, BETADEV                  │
│                                                 │
└─────────────────────────────────────────────────┘
`);
  });
}

module.exports = {
  createServer,
  startServer
};
