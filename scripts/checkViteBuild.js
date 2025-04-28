
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { spawnSync } = require('child_process');

/**
 * Checks if Vite build exists and runs build if needed
 * @param {string} rootDir - The root directory of the project
 */
function checkViteBuild(rootDir) {
  console.log(`checkViteBuild called with rootDir: ${rootDir}`);
  if (!rootDir || typeof rootDir !== 'string') {
    console.error('Error: Invalid rootDir provided to checkViteBuild');
    rootDir = process.cwd();
    console.log(`Falling back to current directory: ${rootDir}`);
  }
  
  const distPath = path.join(rootDir, 'dist', 'index.html');
  console.log(`Checking for Vite build at: ${distPath}`);
  
  try {
    if (!fs.existsSync(distPath)) {
      console.log('Vite build not found. Running build process...');
      
      // Check if package.json has a build script
      const packageJsonPath = path.join(rootDir, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        console.error(`ERROR: package.json not found at ${packageJsonPath}`);
        console.error('Cannot run the build process without package.json');
        console.error(`Files in directory: ${fs.readdirSync(rootDir).join(', ')}`);
        throw new Error('package.json not found');
      }
      
      try {
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
        console.log(`Reading package.json from: ${packageJsonPath}`);
        const packageJson = JSON.parse(packageJsonContent);
        
        if (!packageJson.scripts || !packageJson.scripts.build) {
          console.error('ERROR: No build script found in package.json');
          console.error('Please add a "build" script to your package.json');
          throw new Error('No build script in package.json');
        }
        
        // Create dist directory if it doesn't exist
        const distDir = path.join(rootDir, 'dist');
        if (!fs.existsSync(distDir)) {
          console.log(`Creating dist directory: ${distDir}`);
          fs.mkdirSync(distDir, { recursive: true });
        }
        
        // Set ELECTRON environment variable for Vite build
        console.log(`Executing npm run build in directory: ${rootDir}`);
        execSync('npm run build', { 
          stdio: 'inherit', 
          cwd: rootDir,
          env: { ...process.env, ELECTRON: 'true' }
        });
        
        // Verify build was successful
        if (!fs.existsSync(distPath)) {
          console.error('ERROR: Vite build failed to create dist/index.html');
          console.error('Check for errors in the build process');
          throw new Error('Vite build failed to create dist/index.html');
        }
        
        console.log('Vite build completed successfully');
        
        // Copy electron files to their expected locations
        compileElectronFiles(rootDir);
        
      } catch (error) {
        console.error('Vite build failed:', error.message);
        console.error('Full error details:', error);
        throw error;
      }
    } else {
      console.log('Vite build found. Ensuring Electron files are in place...');
      // Compile electron files to their expected locations
      compileElectronFiles(rootDir);
    }
    
    return true;
  } catch (error) {
    console.error('Error in checkViteBuild:', error);
    throw error;
  }
}

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
    
    console.log('Electron files prepared successfully');
    return true;
  } catch (error) {
    console.error('Error preparing Electron files:', error.message);
    return false;
  }
}

/**
 * Manually transpiles TypeScript files to JavaScript as a fallback
 * @param {string} rootDir - The root directory of the project
 */
function manuallyTranspileFiles(rootDir) {
  console.log('Manually transpiling TypeScript files...');
  
  const electronDir = path.join(rootDir, 'electron');
  const electronDistDir = path.join(electronDir, 'dist');
  
  // Get all TypeScript files
  const tsFiles = fs.readdirSync(electronDir).filter(file => 
    file.endsWith('.ts') || file.endsWith('.js')
  );
  
  tsFiles.forEach(file => {
    const sourcePath = path.join(electronDir, file);
    // Replace .ts with .js for the destination
    const destFile = file.replace('.ts', '.js');
    const destPath = path.join(electronDistDir, destFile);
    
    console.log(`Processing ${sourcePath} to ${destPath}`);
    
    // For TypeScript files, do basic transpilation
    if (file.endsWith('.ts')) {
      try {
        console.log(`Manually transpiling ${file} to JavaScript...`);
        const tsContent = fs.readFileSync(sourcePath, 'utf-8');
        
        // Basic TypeScript to JavaScript conversion
        let jsContent = tsContent
          .replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g, 'const { $1 } = require("$2")')
          .replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require("$2")')
          .replace(/export\s+const\s+(\w+)/g, 'const $1')
          .replace(/export\s+default\s+(\w+)/g, 'module.exports = $1')
          .replace(/export\s+{\s*([^}]+)\s*}/g, 'module.exports = { $1 }')
          .replace(/export\s+interface\s+(\w+)/g, '// interface $1')
          .replace(/export\s+type\s+(\w+)/g, '// type $1')
          .replace(/:\s*\w+(\[\])?(\s*=|\s*\)|\s*;|\s*,|\s*\{)/g, '$2')
          .replace(/<[^>]+>/g, '');
        
        fs.writeFileSync(destPath, jsContent);
        console.log(`Transpiled ${file} to ${destFile}`);
      } catch (error) {
        console.error(`Error transpiling ${file}:`, error.message);
        console.log('Falling back to simple file copy');
        fs.copyFileSync(sourcePath, destPath);
      }
    } else {
      // For JS files, just copy them
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to ${destFile}`);
    }
  });
  
  console.log('Manual transpilation completed');
}

module.exports = { checkViteBuild };
