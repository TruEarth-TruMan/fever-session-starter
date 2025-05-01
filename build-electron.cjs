#!/usr/bin/env node

const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

// Resolve project root
const rootDir = process.env.FORCE_ROOT_DIR || process.cwd();
console.log(`Running build-electron.cjs from ${rootDir}`);
console.log(`Node.js version: ${process.version}`);

// Safely require a file
function safeRequire(modulePath) {
  try {
    if (!fs.existsSync(modulePath)) {
      console.warn(`Module file not found: ${modulePath}`);
      return null;
    }
    delete require.cache[require.resolve(modulePath)];
    return require(modulePath);
  } catch (err) {
    console.error(`Failed to load module at ${modulePath}: ${err.message}`);
    return null;
  }
}

// Copy a folder recursively
function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    entry.isDirectory()
      ? copyDirectory(srcPath, destPath)
      : fs.copyFileSync(srcPath, destPath);
  }
}

(async () => {
  try {
    const distDir = path.join(rootDir, 'dist');
    const electronDist = path.join(rootDir, 'electron', 'dist');
    const distElectron = path.join(rootDir, 'dist-electron');

    // Ensure dist-electron exists and is populated
    if (!fs.existsSync(distElectron)) {
      fs.mkdirSync(distElectron, { recursive: true });
    }

    if (fs.existsSync(electronDist)) {
      console.log('Copying Electron compiled files...');
      copyDirectory(electronDist, distElectron);
    }

    // Fallback index.html for dist if needed
    const indexHtmlPath = path.join(distDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(indexHtmlPath, `<!DOCTYPE html><html><body><p>Placeholder</p></body></html>`);
    }

    // Load or fallback to local config
    const configPath = path.join(rootDir, 'electron-builder.cjs');
    let config = fs.existsSync(configPath)
      ? safeRequire(configPath)
      : {
          appId: 'com.fever.audio',
          productName: 'Fever',
          directories: {
            output: 'release',
            buildResources: 'build',
          },
          files: [
            'dist/**/*',
            'electron/**/*',
            'dist-electron/**/*',
            'preload.js',
            'main.cjs',
            'package.json'
          ]
        };

    console.log('Launching electron-builder...');
    const results = await builder.build({
      config,
      publish: process.env.PUBLISH === 'always' ? 'always' : 'never'
    });

    console.log('✅ Build complete! Artifacts:');
    results.forEach(file => console.log(`- ${file}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Electron build failed:');
    console.error(err?.message);
    console.error(err?.stack);
    process.exit(1);
  }
})();
