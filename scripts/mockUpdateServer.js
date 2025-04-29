
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

// Create a simple update manifest
function generateUpdateManifest(version) {
  // Base URL for downloads (in real deployment, this would be your server URL)
  const baseUrl = `http://localhost:${PORT}/download`;
  
  return {
    version,
    notes: `Test release ${version}`,
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

// Create basic update manifest
const updateManifest = generateUpdateManifest(currentVersion);
const updateManifestPath = path.join(UPDATE_DIR, 'fever-update.json');
fs.writeFileSync(updateManifestPath, JSON.stringify(updateManifest, null, 2));
console.log(`Created update manifest at: ${updateManifestPath}`);

// Create an HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`${req.method} ${pathname}`);
  
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
    // Serve the update manifest
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(generateUpdateManifest(currentVersion)));
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
      res.end(JSON.stringify({error: 'File not found'}));
    }
  } 
  else if (pathname === '/status') {
    // Status endpoint to check if server is running
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'online',
      version: currentVersion,
      updateManifest: updateManifest
    }));
  }
  else {
    // Not found
    res.statusCode = 404;
    res.end(JSON.stringify({error: 'Not found'}));
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Update server running at http://localhost:${PORT}`);
  console.log(`Current version: ${currentVersion}`);
  console.log(`Serving update manifest at: http://localhost:${PORT}/update`);
  console.log(`Serving downloads from: ${RELEASE_DIR}`);
});
