
#!/usr/bin/env node
const { log } = require('./scripts/utils/logger');
const { resolveProjectRoot } = require('./scripts/utils/pathResolver');
const { validateBuildConfig } = require('./scripts/utils/buildValidator');
const { executeBuild } = require('./scripts/utils/buildExecutor');
const { verifyDependencies } = require('./scripts/verifyDependencies');

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

    // Validate build configuration
    validateBuildConfig(rootDir);

    // Verify dependencies
    const depsVerified = await verifyDependencies(rootDir);
    if (!depsVerified) {
      throw new Error('Dependency verification failed');
    }

    // Execute build
    await executeBuild(rootDir, dryRun);
  } catch (error) {
    log(error.message, true);
    if (debugMode) {
      log(error.stack || 'No stack trace available', true);
    }
    process.exit(1);
  }
}

main();

