
#!/usr/bin/env node
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

// Ensure we're running from the correct directory
const rootDir = process.env.FORCE_ROOT_DIR || process.cwd();
console.log(`Starting build-electron.cjs in: ${rootDir}`);
console.log(`Script path: ${__filename}`);
console.log(`Node.js version: ${process.version}`);

// Function to safely load a module with explicit error handling
function safeRequire(modulePath) {
  try {
    console.log(`Attempting to require: ${modulePath}`);
    if (!fs.existsSync(modulePath)) {
      console.error(`Module file not found: ${modulePath}`);
      return null;
    }
    // Clear cache just in case
    if (require.cache[require.resolve(modulePath)]) {
      delete require.cache[require.resolve(modulePath)];
    }
    return require(modulePath);
  } catch (err) {
    console.error(`Failed to load module ${modulePath}: ${err.message}`);
    return null;
  }
}

// Main build process
async function buildApp() {
  try {
    // Set up build environment
    console.log('Setting up build environment...');
    
    // Ensure directories exist
    const buildDir = path.join(rootDir, 'build');
    const iconDir = path.join(buildDir, 'icons');
    const distDir = path.join(rootDir, 'dist');
    const releaseDir = path.join(rootDir, 'release');
    
    [buildDir, iconDir, distDir, releaseDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Check if Vite build exists
    if (!fs.existsSync(path.join(distDir, 'index.html'))) {
      console.log('Creating minimal index.html in dist directory');
      fs.writeFileSync(path.join(distDir, 'index.html'), `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Fever Audio App</title>
      </head>
      <body>
        <div id="root">
          <p>This is a placeholder build. Run a proper Vite build for production use.</p>
        </div>
      </body>
      </html>`);
    }
    
    // Load electron-builder config directly
    console.log('Loading electron-builder config...');
    const configPath = path.join(rootDir, 'electron-builder.cjs');
    
    console.log(`Loading config from: ${configPath}`);
    console.log(`Config file exists: ${fs.existsSync(configPath)}`);
    
    let config;
    if (fs.existsSync(configPath)) {
      // Load the config using our safe require function
      config = safeRequire(configPath);
      if (!config) {
        throw new Error('Failed to load electron-builder.cjs');
      }
    } else {
      // Fallback minimal config
      console.warn('Config file not found, using fallback configuration');
      config = {
        appId: "com.fever.audioapp",
        productName: "Fever",
        directories: {
          output: "release", 
          buildResources: "build", 
        },
        files: ["dist/**/*", "electron/**/*", "build/**/*", "main.cjs", "preload.js"]
      };
    }
    
    console.log('Config loaded successfully');
    console.log('Starting Electron build process...');
    
    // Build the app using electron-builder
    const results = await builder.build({
      config,
      publish: process.env.PUBLISH === 'always' ? 'always' : 'never'
    });

    console.log('Build successful!');
    console.log('Built artifacts:');
    results.forEach(result => {
      console.log(` - ${result.file} (${(result.size / 1024 / 1024).toFixed(2)} MB)`);
    });

    console.log('You can find the installers in the "release" directory.');
    
    process.exit(0);
  } catch (error) {
    console.error('Build failed:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Run the build process
console.log("Starting build-electron.cjs script");
buildApp().catch(error => {
  console.error('Unhandled error in buildApp:', error);
  process.exit(1);
});
