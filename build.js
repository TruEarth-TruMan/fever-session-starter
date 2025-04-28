
#!/usr/bin/env node
const { log } = require('./scripts/utils/logger');
const { initializeBuild } = require('./scripts/utils/buildInitializer');

async function main() {
  try {
    await initializeBuild();
  } catch (error) {
    log(error.message, true);
    if (process.argv.includes('--debug') && error.stack) {
      log(error.stack || 'No stack trace available', true);
    }
    process.exit(1);
  }
}

main();
