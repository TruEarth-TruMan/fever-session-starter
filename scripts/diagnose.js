
#!/usr/bin/env node
const { runDiagnostics } = require('./diagnostics/core/runDiagnostics');

// Get root directory from arguments
const args = process.argv.slice(2);
let rootDir = null;

// Parse arguments
for (const arg of args) {
  if (arg.startsWith('--root=')) {
    rootDir = arg.substring(7).replace(/^"(.*)"$/, '$1');
  }
}

// Run diagnostics
runDiagnostics(rootDir);
