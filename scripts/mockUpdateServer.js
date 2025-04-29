
/**
 * Mock Update Server for testing Electron auto-updates locally
 * 
 * This script creates a simple HTTP server that serves update files
 * and provides the expected endpoints for the Electron updater.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Get project version
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
const currentVersion = packageJson.version;

// Configuration
const PORT = process.env.PORT || 3000;
const RELEASE_DIR = path.join(process.cwd(), 'release');
const UPDATE_DIR = path.join(process.cwd(), 'update');

// Ensure update directory exists
if (!fs.existsSync(UPDATE_DIR)) {
  fs.mkdirSync(UPDATE_DIR, { recursive: true });
}

// Beta testers mapping (in a real scenario, this would be in a database)
const betaTesters = {
  // Example beta tester IDs - in production this would be stored securely
  'BETA123': { name: 'Test User 1', allowedChannels: ['beta', 'latest'] },
  'BETA456': { name: 'Test User 2', allowedChannels: ['beta', 'dev', 'latest'] },
  'BETADEV': { name: 'Developer', allowedChannels: ['dev', 'beta', 'latest'] }
};

// Create a simple update manifest
function generateUpdateManifest(version, channel = 'latest', betaId = null) {
  // Base URL for downloads (in real deployment, this would be your server URL)
  const baseUrl = `http://localhost:${PORT}/download`;
  
  // Prepare notes based on channel
  let notes = `Test release ${version}`;
  if (channel === 'beta') {
    notes = `Beta release ${version}\n- New experimental features\n- May contain bugs`;
  } else if (channel === 'dev') {
    notes = `Development build ${version}\n- Unstable features\n- For testing only`;
  }
  
  // If beta ID provided, personalize the notes
  if (betaId && betaTesters[betaId]) {
    notes = `${notes}\n\nHello ${betaTesters[betaId].name}! Thanks for testing.`;
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

// Create update manifests for different channels
const channels = ['latest', 'beta', 'dev'];
channels.forEach(channel => {
  const updateManifest = generateUpdateManifest(currentVersion, channel);
  const updateManifestPath = path.join(UPDATE_DIR, `fever-update-${channel}.json`);
  fs.writeFileSync(updateManifestPath, JSON.stringify(updateManifest, null, 2));
  console.log(`Created ${channel} update manifest at: ${updateManifestPath}`);
});

// Default update manifest (for backward compatibility)
const defaultManifest = generateUpdateManifest(currentVersion);
const defaultManifestPath = path.join(UPDATE_DIR, 'fever-update.json');
fs.writeFileSync(defaultManifestPath, JSON.stringify(defaultManifest, null, 2));
console.log(`Created default update manifest at: ${defaultManifestPath}`);

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
  
  // Routes
  if (pathname === '/update' || pathname === '/fever-update.json') {
    // Check for beta ID in query params
    const betaId = query.betaId;
    
    // Serve the update manifest
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(generateUpdateManifest(currentVersion, 'latest', betaId)));
  }
  else if (pathname.startsWith('/update/')) {
    // Get channel from URL
    const channel = pathname.replace('/update/', '');
    const validChannels = ['latest', 'beta', 'dev'];
    
    // Check for beta ID in query params
    const betaId = query.betaId;
    
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
    const useChannel = validChannels.includes(channel) ? channel : 'latest';
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(generateUpdateManifest(currentVersion, useChannel, betaId)));
  }
  else if (pathname.startsWith('/download/')) {
    // Extract the filename from the path
    const filename = pathname.replace('/download/', '');
    const filePath = path.join(RELEASE_DIR, filename);
    
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
        availableFiles: fs.existsSync(RELEASE_DIR) ? fs.readdirSync(RELEASE_DIR) : []
      }));
    }
  } 
  else if (pathname === '/status') {
    // Status endpoint to check if server is running
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'online',
      version: currentVersion,
      channels: channels,
      betaTestersCount: Object.keys(betaTesters).length,
      updateManifests: channels.map(c => `http://localhost:${PORT}/update/${c}`),
      downloadPath: `http://localhost:${PORT}/download/`
    }));
  }
  else if (pathname === '/verify-beta') {
    // Endpoint to verify beta tester ID
    const betaId = query.id;
    
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
  else {
    // Not found - show available routes
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
});

// Start the server
server.listen(PORT, () => {
  console.log(`
┌─────────────────────────────────────────────────┐
│                                                 │
│   Fever Mock Update Server                      │
│                                                 │
│   Running at: http://localhost:${PORT}            │
│   Current version: ${currentVersion}                   │
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
