
/**
 * Handles compilation of Electron TypeScript files
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { manuallyTranspileFiles } = require('./fileTranspiler.js');

/**
 * Compiles Electron TypeScript files using the TypeScript compiler
 * @param {string} rootDir - The root directory of the project
 */
function compileElectronFiles(rootDir) {
  console.log('Compiling Electron TypeScript files...');
  
  try {
    // Ensure electron/dist directory exists
    const electronDistDir = path.join(rootDir, 'electron', 'dist');
    if (!fs.existsSync(electronDistDir)) {
      console.log(`Creating electron/dist directory: ${electronDistDir}`);
      fs.mkdirSync(electronDistDir, { recursive: true });
    }
    
    // Check for TypeScript compiler
    try {
      // Try to use local TypeScript installation first
      const tsConfigPath = path.join(rootDir, 'electron', 'tsconfig.json');
      
      // If electron tsconfig doesn't exist, create it
      if (!fs.existsSync(tsConfigPath)) {
        console.log('Creating electron/tsconfig.json...');
        const tsConfig = {
          compilerOptions: {
            target: "ES2020",
            module: "CommonJS",
            moduleResolution: "node",
            esModuleInterop: true,
            sourceMap: true,
            outDir: "dist",
            baseUrl: ".",
            paths: { "*": ["node_modules/*"] },
            resolveJsonModule: true,
            allowSyntheticDefaultImports: true,
            skipLibCheck: true
          },
          include: ["*.ts"],
          exclude: ["node_modules"]
        };
        fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      }
      
      // Run TypeScript compiler in the electron directory
      console.log('Running TypeScript compiler on electron files...');
      const tscPath = path.join(rootDir, 'node_modules', '.bin', 'tsc');
      
      // Check if local tsc exists
      if (fs.existsSync(tscPath)) {
        console.log(`Using local TypeScript compiler: ${tscPath}`);
        const tscResult = spawnSync(tscPath, [
          '--project', tsConfigPath
        ], {
          cwd: path.join(rootDir, 'electron'),
          stdio: 'inherit',
          shell: process.platform === 'win32' // Use shell on Windows
        });
        
        if (tscResult.status !== 0) {
          console.error('TypeScript compilation failed. Using manual transpilation as fallback.');
          manuallyTranspileFiles(rootDir);
        } else {
          console.log('TypeScript compilation completed successfully.');
        }
      } else {
        console.log('Local TypeScript compiler not found. Using manual transpilation.');
        manuallyTranspileFiles(rootDir);
      }
    } catch (error) {
      console.error('Error compiling TypeScript:', error.message);
      console.log('Falling back to manual transpilation...');
      manuallyTranspileFiles(rootDir);
    }
    
    // Copy additional files if needed (like HTML templates)
    createErrorHtmlFile(rootDir);
    
    console.log('Electron files prepared successfully');
    return true;
  } catch (error) {
    console.error('Error preparing Electron files:', error.message);
    return false;
  }
}

/**
 * Creates or copies the error.html file for Electron app
 * @param {string} rootDir - Project root directory
 */
function createErrorHtmlFile(rootDir) {
  const electronDistDir = path.join(rootDir, 'electron', 'dist');
  const errorHtmlPath = path.join(rootDir, 'electron', 'error.html');
  const errorHtmlDest = path.join(electronDistDir, 'error.html');
  
  if (fs.existsSync(errorHtmlPath)) {
    console.log(`Copying ${errorHtmlPath} to ${errorHtmlDest}`);
    fs.copyFileSync(errorHtmlPath, errorHtmlDest);
  } else {
    console.log('Creating basic error.html file');
    const errorHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error Loading Fever</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #e53935; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Error Loading Application</h1>
    <p>The application could not load the main interface. This might be due to a packaging issue.</p>
    <p>Please try restarting the application or reinstalling it.</p>
    <h2>Technical Details</h2>
    <pre id="technical"></pre>
    <script>
      document.getElementById('technical').textContent = 
        'App Path: ' + (window.electron?.getAppPath?.() || 'Unknown') + 
        '\\nFile Path: ' + window.location.href;
    </script>
  </div>
</body>
</html>
`;
    fs.writeFileSync(errorHtmlDest, errorHtmlContent);
  }
}

module.exports = { compileElectronFiles };
