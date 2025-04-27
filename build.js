
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

async function main() {
  try {
    // Resolve project root
    const rootDir = resolveProjectRoot(forceRootDir);
    if (!rootDir) {
      throw new Error('Could not determine project root directory');
    }
    log(`Using project root directory: ${rootDir}`);
    
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

    // Load modules using safe require
    log('Loading build modules...');
    const buildValidatorPath = path.resolve(rootDir, 'scripts', 'utils', 'buildValidator.js');
    const buildExecutorPath = path.resolve(rootDir, 'scripts', 'utils', 'buildExecutor.js');
    const verifyDependenciesPath = path.resolve(rootDir, 'scripts', 'verifyDependencies.js');
    
    log(`Loading buildValidator from: ${buildValidatorPath}`);
    const buildValidator = safeRequire(buildValidatorPath);
    if (!buildValidator) {
      throw new Error('Failed to load buildValidator module');
    }
    
    log(`Loading buildExecutor from: ${buildExecutorPath}`);
    const buildExecutor = safeRequire(buildExecutorPath);
    if (!buildExecutor) {
      throw new Error('Failed to load buildExecutor module');
    }
    
    log(`Loading verifyDependencies from: ${verifyDependenciesPath}`);
    const verifyDependencies = safeRequire(verifyDependenciesPath);
    if (!verifyDependencies) {
      throw new Error('Failed to load verifyDependencies module');
    }

    // Validate build configuration
    buildValidator.validateBuildConfig(rootDir);

    // Verify dependencies
    const depsVerified = await verifyDependencies.verifyDependencies(rootDir);
    if (!depsVerified) {
      throw new Error('Dependency verification failed');
    }

    // Execute build
    await buildExecutor.executeBuild(rootDir, dryRun);
  } catch (error) {
    log(error.message, true);
    if (debugMode) {
      log(error.stack || 'No stack trace available', true);
    }
    process.exit(1);
  }
}

main();
