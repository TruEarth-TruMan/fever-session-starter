#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const releaseDir = path.join(__dirname, '../release');
const distDir = path.join(__dirname, '../distribution');

const platforms = ['win', 'mac-x64', 'mac-arm64'];

// Ensure distribution directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy files to platform-specific subdirectories
platforms.forEach(platform => {
  const platformDir = path.join(distDir, platform);
  if (!fs.existsSync(platformDir)) {
    fs.mkdirSync(platformDir);
  }

  const files = fs.readdirSync(releaseDir).filter(file =>
    file.includes(platform.includes('win') ? 'setup.exe' : platform.includes('x64') ? 'x64' : 'arm64')
  );

  files.forEach(file => {
    const src = path.join(releaseDir, file);
    const dest = path.join(platformDir, file);
    fs.copyFileSync(src, dest);
  });
});

console.log('✅ Distribution directory prepared.');

// Optional: create release notes or manifest placeholder
const notesPath = path.join(distDir, 'release-notes.md');
if (!fs.existsSync(notesPath)) {
  fs.writeFileSync(notesPath, '# Release Notes\n\n- Initial build.\n');
}

const manifestPath = path.join(distDir, 'update-manifest.json');
if (!fs.existsSync(manifestPath)) {
  fs.writeFileSync(manifestPath, JSON.stringify({
    version: "0.0.0",
    releaseDate: new Date().toISOString(),
    files: platforms.map(p => ({ platform: p, file: `Fever-0.0.0-${p.includes('win') ? 'setup.exe' : 'dmg'}` }))
  }, null, 2));
}

console.log('📜 Release notes and update manifest generated.');
