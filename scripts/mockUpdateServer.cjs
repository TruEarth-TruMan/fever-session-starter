#!/usr/bin/env node

const express = require('express');
const fs = require('fs');
const path = require('path');

const RELEASE_DIR = path.join(__dirname, '..', 'release');
const PORT = 3000;
const app = express();

// Middleware to serve static files
app.use(express.static(RELEASE_DIR));

// Helper to generate basic update manifest
function generateManifest(version, platform, ext) {
  const filename = `Fever-${version}-setup.${ext}`;
  const filePath = path.join(RELEASE_DIR, filename);
  const fileExists = fs.existsSync(filePath);

  if (!fileExists) {
    console.warn(`⚠️  File not found: ${filename}`);
    return null;
  }

  const stats = fs.statSync(filePath);

  return {
    version,
    path: `http://localhost:${PORT}/${filename}`,
    sha512: "mock-sha512-placeholder", // In real update, this would be generated
    releaseDate: stats.mtime.toISOString()
  };
}

// Routes
app.get('/latest.yml', (req, res) => {
  const manifest = generateManifest('0.1.0', 'win', 'exe');
  if (manifest) {
    const yml = `
version: ${manifest.version}
files:
  - url: ${manifest.path}
    sha512: ${manifest.sha512}
    size: 12345678
path: ${manifest.path}
releaseDate: ${manifest.releaseDate}
`;
    res.type('text/yaml').send(yml);
  } else {
    res.status(404).send('Manifest not found');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Mock Update Server running at http://localhost:${PORT}`);
  console.log(`📦 Serving updates from /release`);
});
