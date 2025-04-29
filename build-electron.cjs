
#!/usr/bin/env node
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

// Import utility functions - use absolute paths to avoid resolution issues
const rootDir = process.env.FORCE_ROOT_DIR || process.cwd();
console.log(`Starting build-electron.cjs in: ${rootDir}`);
console.log(`Script path: ${__filename}`);

// We'll try to load scripts in a more resilient way
try {
  // Construct absolute paths to script files
  const scriptsDir = path.join(rootDir, 'scripts');
  
  // Check if the scripts directory exists
  if (!fs.existsSync(scriptsDir)) {
    console.error(`Scripts directory not found at ${scriptsDir}`);
    process.exit(1);
  }
  
  // Function to require a module safely
  const requireSafely = (modulePath, fallbackFn = null) => {
    try {
      console.log(`Attempting to require: ${modulePath}`);
      if (!fs.existsSync(modulePath)) {
        console.error(`Module file not found: ${modulePath}`);
        if (fallbackFn) return { [fallbackFn]: () => console.warn(`Using fallback for ${fallbackFn}`) };
        return null;
      }
      // Clear cache just in case
      if (require.cache[require.resolve(modulePath)]) {
        delete require.cache[require.resolve(modulePath)];
      }
      return require(modulePath);
    } catch (err) {
      console.error(`Failed to load module ${modulePath}: ${err.message}`);
      if (fallbackFn) return { [fallbackFn]: () => console.warn(`Using fallback for ${fallbackFn}`) };
      return null;
    }
  };
  
  // Load modules with error handling and fallbacks
  const checkViteBuildModule = requireSafely(path.join(scriptsDir, 'checkViteBuild.js'), 'checkViteBuild');
  const loadElectronConfigModule = requireSafely(path.join(scriptsDir, 'loadElectronConfig.js'), 'loadElectronConfig');
  const setupBuildDirsModule = requireSafely(path.join(scriptsDir, 'setupBuildDirs.js'), 'setupBuildDirectories');
  const generateEntitlementsModule = requireSafely(path.join(scriptsDir, 'generateEntitlements.js'), 'generateMacOSEntitlements');
  const generateUpdateExampleModule = requireSafely(path.join(scriptsDir, 'generateUpdateExample.js'), 'generateUpdateExample');
  const ensureDirectoriesModule = requireSafely(path.join(scriptsDir, 'ensureDirectories.js'), 'ensureDirectories');
  
  // Extract functions from modules
  const { checkViteBuild } = checkViteBuildModule || { checkViteBuild: () => true };
  const { loadElectronConfig } = loadElectronConfigModule || { loadElectronConfig: () => ({}) };
  const { setupBuildDirectories } = setupBuildDirsModule || { setupBuildDirectories: () => ({ buildDir: path.join(rootDir, 'build') }) };
  const { generateMacOSEntitlements } = generateEntitlementsModule || { generateMacOSEntitlements: () => true };
  const { generateUpdateExample } = generateUpdateExampleModule || { generateUpdateExample: () => true };
  const { ensureDirectories } = ensureDirectoriesModule || { ensureDirectories: () => true };
  
  // Parse command line args
  const args = process.argv.slice(2);
  let debugMode = args.includes('--debug');
  
  // Change to the root directory
  console.log(`Changing to root directory: ${rootDir}`);
  process.chdir(rootDir);
  console.log(`Current working directory: ${process.cwd()}`);
  
  // Main build process
  async function buildApp() {
    try {
      // Set up build environment
      console.log('Setting up build environment...');
      
      // Setup build directories using utility function
      const { buildDir } = setupBuildDirectories(rootDir);
      console.log(`Build directory: ${buildDir}`);
  
      // Generate required files using utility functions
      console.log('Generating entitlements and update manifest...');
      generateMacOSEntitlements(buildDir);
      generateUpdateExample(rootDir);
      
      // Ensure download directories exist
      ensureDirectories(rootDir);
  
      // Check Vite build using utility function - this is critical
      console.log('Checking Vite build...');
      checkViteBuild(rootDir);
  
      // Load electron-builder config directly
      console.log('Loading electron-builder config...');
      const configPath = path.join(rootDir, 'electron-builder.cjs');
      
      console.log(`Loading config directly from: ${configPath}`);
      console.log(`Config file exists: ${fs.existsSync(configPath)}`);
      
      let config;
      if (fs.existsSync(configPath)) {
        // Read the file directly
        const configContent = fs.readFileSync(configPath, 'utf8');
        if (!configContent || configContent.trim() === '') {
          throw new Error(`electron-builder.cjs exists but is empty`);
        }
        
        // Clear require cache first
        if (require.cache[require.resolve(configPath)]) {
          delete require.cache[require.resolve(configPath)];
        }
        
        // Load the config
        config = require(configPath);
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
      
      if (debugMode) {
        console.log('Config:', JSON.stringify(config, null, 2));
      }
  
      // Build the app using electron-builder
      console.log('Starting Electron build process...');
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
      
      if (debugMode && error.stack) {
        console.error('Error stack:', error.stack);
      }
      
      process.exit(1);
    }
  }
  
  // Run the build process
  console.log("Starting build-electron.cjs script");
  buildApp();
  
} catch (error) {
  console.error('Fatal error in build-electron.cjs:', error);
  process.exit(1);
}
