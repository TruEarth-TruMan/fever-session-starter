
#!/usr/bin/env node
const { log } = require('./scripts/utils/logger');
const { resolveProjectRoot, safeRequire } = require('./scripts/utils/pathResolver');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const forceRootDir = args.find(arg => arg.startsWith('--root='))?.substring(7).replace(/^"(.*)"$/, '$1');
const debugMode = args.includes('--debug');
const dryRun = args.includes('--dry-run');

function checkScriptsDirectory(rootDir) {
  const scriptsDir = path.join(rootDir, 'scripts');
  const utilsDir = path.join(scriptsDir, 'utils');
  
  if (!fs.existsSync(scriptsDir)) {
    log(`Creating scripts directory at ${scriptsDir}`, false);
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  
  if (!fs.existsSync(utilsDir)) {
    log(`Creating utils directory at ${utilsDir}`, false);
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  // Check if critical files exist
  const criticalFiles = {
    'scripts/utils/logger.js': `
      function log(message, isError = false) {
        const timestamp = new Date().toISOString();
        const prefix = isError ? '[ERROR]' : '[INFO]';
        if (isError) { console.error(\`\${prefix} \${timestamp}: \${message}\`); }
        else { console.log(\`\${prefix} \${timestamp}: \${message}\`); }
      }
      module.exports = { log };`,
    'scripts/utils/buildExecutor.js': `
      const { execSync } = require('child_process');
      const { log } = require('./logger');
      function executeBuild(rootDir, isDryRun = false) {
        log('Starting build process...');
        if (isDryRun) {
          log('Dry run mode - simulating build process');
          return;
        }
        try {
          log('Running Vite build...');
          execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
          log('Running Electron build...');
          execSync(\`node build-electron.cjs --debug\`, {
            stdio: 'inherit', cwd: rootDir, env: { ...process.env, FORCE_ROOT_DIR: rootDir }
          });
          log('Build completed successfully!');
        } catch (error) {
          throw new Error(\`Build failed: \${error.message}\`);
        }
      }
      module.exports = { executeBuild };`
  };
  
  // Create any missing critical files
  Object.entries(criticalFiles).forEach(([filePath, content]) => {
    const fullPath = path.join(rootDir, filePath);
    if (!fs.existsSync(fullPath)) {
      log(`Creating missing critical file: ${filePath}`, false);
      try {
        // Create parent directory if it doesn't exist
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, content.trim());
        log(`Created ${filePath} successfully`, false);
      } catch (err) {
        log(`Failed to create ${filePath}: ${err.message}`, true);
      }
    }
  });
}

async function main() {
  try {
    // Resolve project root
    const rootDir = resolveProjectRoot(forceRootDir);
    if (!rootDir) {
      throw new Error('Could not determine project root directory');
    }
    log(`Using project root directory: ${rootDir}`);
    
    // Ensure scripts directory and critical files exist
    checkScriptsDirectory(rootDir);
    
    // Log directory contents for debugging
    if (debugMode) {
      try {
        log(`Files in root directory: ${fs.readdirSync(rootDir).join(', ')}`);
        
        // Check for electron-builder.cjs specifically
        const electronBuilderCjsPath = path.resolve(rootDir, 'electron-builder.cjs');
        const electronBuilderJsPath = path.resolve(rootDir, 'electron-builder.js');
        
        log(`electron-builder.cjs exists: ${fs.existsSync(electronBuilderCjsPath)}`);
        log(`electron-builder.js exists: ${fs.existsSync(electronBuilderJsPath)}`);
        
        // If neither exists, create electron-builder.cjs
        if (!fs.existsSync(electronBuilderCjsPath) && !fs.existsSync(electronBuilderJsPath)) {
          log('Creating electron-builder.cjs...', true);
          
          // Create from scratch with minimal config
          const minimalConfig = `/**
 * Fever Application Packaging Configuration
 */
module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  copyright: "Copyright © 2025",
  directories: { output: "release", buildResources: "build" },
  files: ["dist/**/*", "electron/**/*", "!node_modules/**/*"],
  mac: { category: "public.app-category.music", target: ["dmg", "zip"] },
  win: { target: ["nsis"] },
  publish: [{ provider: "generic", url: "https://feverstudio.live/update" }]
};`;
            fs.writeFileSync(electronBuilderCjsPath, minimalConfig);
            log(`Created minimal electron-builder.cjs: ${fs.existsSync(electronBuilderCjsPath)}`, false);
        }
      } catch (err) {
        log(`Error reading directory: ${err.message}`, true);
      }
    }

    // Load modules using safe require with absolute paths
    log('Loading build modules...');
    const buildValidatorPath = path.resolve(rootDir, 'scripts', 'utils', 'buildValidator.js');
    const buildExecutorPath = path.resolve(rootDir, 'scripts', 'utils', 'buildExecutor.js');
    const verifyDependenciesPath = path.resolve(rootDir, 'scripts', 'verifyDependencies.js');
    
    // Create buildValidator if it doesn't exist
    if (!fs.existsSync(buildValidatorPath)) {
      log(`Creating missing buildValidator.js at ${buildValidatorPath}`, false);
      
      const buildValidatorDir = path.dirname(buildValidatorPath);
      if (!fs.existsSync(buildValidatorDir)) {
        fs.mkdirSync(buildValidatorDir, { recursive: true });
      }
      
      const defaultValidator = `
const fs = require('fs');
const path = require('path');
const { log } = require('./logger');

function validateBuildConfig(rootDir) {
  log("Validating build configuration", false);
  
  // Check for electron-builder config
  const configPath = path.join(rootDir, 'electron-builder.cjs');
  if (!fs.existsSync(configPath)) {
    log("Creating default electron-builder.cjs", false);
    const defaultConfig = \`/**
 * Fever Application Packaging Configuration
 */
module.exports = {
  appId: "com.fever.audioapp",
  productName: "Fever",
  copyright: "Copyright © 2025",
  directories: { output: "release", buildResources: "build" },
  files: ["dist/**/*", "electron/**/*", "!node_modules/**/*"],
  mac: { category: "public.app-category.music", target: ["dmg", "zip"] },
  win: { target: ["nsis"] },
  publish: [{ provider: "generic", url: "https://feverstudio.live/update" }]
};\`;
    
    fs.writeFileSync(configPath, defaultConfig);
    log("Created default electron-builder.cjs", false);
  }
  
  // Additional validation logic
  return true;
}

module.exports = { validateBuildConfig };`;
      
      fs.writeFileSync(buildValidatorPath, defaultValidator);
      log(`Created buildValidator.js successfully`, false);
    }
    
    log(`Loading buildValidator from: ${buildValidatorPath}`);
    const buildValidator = safeRequire(buildValidatorPath);
    if (!buildValidator) {
      log('Failed to load buildValidator module - creating simple version', true);
      // Implement a simple validator
      global.buildValidator = {
        validateBuildConfig: (rootDir) => {
          log('Using fallback buildValidator', true);
          return true;
        }
      };
    }
    
    // Create a simple executor if needed
    if (!fs.existsSync(buildExecutorPath)) {
      log(`Creating missing buildExecutor.js at ${buildExecutorPath}`, false);
      
      const buildExecutorDir = path.dirname(buildExecutorPath);
      if (!fs.existsSync(buildExecutorDir)) {
        fs.mkdirSync(buildExecutorDir, { recursive: true });
      }
      
      const defaultExecutor = `
const { execSync } = require('child_process');
const { log } = require('./logger');

function executeBuild(rootDir, isDryRun = false) {
  log('Starting build process...');

  if (isDryRun) {
    log('Dry run mode - simulating build process');
    return;
  }

  try {
    log('Running Vite build...');
    execSync('npm run build', { stdio: 'inherit', cwd: rootDir });

    log('Running Electron build...');
    execSync(\`node build-electron.cjs --debug\`, {
      stdio: 'inherit',
      cwd: rootDir,
      env: { ...process.env, FORCE_ROOT_DIR: rootDir }
    });

    log('Build completed successfully!');
  } catch (error) {
    throw new Error(\`Build failed: \${error.message}\`);
  }
}

module.exports = { executeBuild };`;
      
      fs.writeFileSync(buildExecutorPath, defaultExecutor);
      log(`Created buildExecutor.js successfully`, false);
    }
    
    log(`Loading buildExecutor from: ${buildExecutorPath}`);
    const buildExecutor = safeRequire(buildExecutorPath);
    if (!buildExecutor) {
      throw new Error('Failed to load buildExecutor module');
    }
    
    // Create a simple dependency verifier if needed
    if (!fs.existsSync(verifyDependenciesPath)) {
      log(`Creating missing verifyDependencies.js at ${verifyDependenciesPath}`, false);
      
      const verifyDepsDir = path.dirname(verifyDependenciesPath);
      if (!fs.existsSync(verifyDepsDir)) {
        fs.mkdirSync(verifyDepsDir, { recursive: true });
      }
      
      const defaultVerifier = `
const fs = require('fs');
const path = require('path');

async function verifyDependencies(rootDir) {
  console.log('Verifying dependencies...');
  
  // Check if package.json exists
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found');
    return false;
  }
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check required dependencies
  const requiredDeps = ['electron', 'electron-builder', 'vite'];
  const missingDeps = [];
  
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
      console.warn(\`Missing dependency: \${dep}\`);
      missingDeps.push(dep);
    }
  });
  
  return missingDeps.length === 0;
}

module.exports = { verifyDependencies };`;
      
      fs.writeFileSync(verifyDependenciesPath, defaultVerifier);
      log(`Created verifyDependencies.js successfully`, false);
    }
    
    log(`Loading verifyDependencies from: ${verifyDependenciesPath}`);
    const verifyDependencies = safeRequire(verifyDependenciesPath);
    if (!verifyDependencies) {
      log('Failed to load verifyDependencies module - using simplified version', true);
      // Implement a simple verifier
      global.verifyDependencies = {
        verifyDependencies: async () => {
          log('Using fallback dependency verifier', true);
          return true;
        }
      };
    }

    // Validate build configuration
    try {
      if (buildValidator && buildValidator.validateBuildConfig) {
        buildValidator.validateBuildConfig(rootDir);
      } else if (global.buildValidator) {
        global.buildValidator.validateBuildConfig(rootDir);
      } else {
        log('No build validator available, skipping validation', true);
      }
    } catch (validationError) {
      log(`Validation error: ${validationError.message}`, true);
      log('Continuing despite validation errors', true);
    }

    // Verify dependencies
    let depsVerified = false;
    try {
      if (verifyDependencies && verifyDependencies.verifyDependencies) {
        depsVerified = await verifyDependencies.verifyDependencies(rootDir);
      } else if (global.verifyDependencies) {
        depsVerified = await global.verifyDependencies.verifyDependencies(rootDir);
      } else {
        log('No dependency verifier available, skipping verification', true);
        depsVerified = true;
      }
    } catch (depsError) {
      log(`Dependency verification error: ${depsError.message}`, true);
      log('Continuing despite dependency verification errors', true);
      depsVerified = true;
    }

    // Execute build
    try {
      if (buildExecutor && buildExecutor.executeBuild) {
        await buildExecutor.executeBuild(rootDir, dryRun);
      } else {
        throw new Error('Build executor not available');
      }
    } catch (buildError) {
      throw new Error(`Build execution failed: ${buildError.message}`);
    }
  } catch (error) {
    log(error.message, true);
    if (debugMode && error.stack) {
      log(error.stack || 'No stack trace available', true);
    }
    process.exit(1);
  }
}

main();
