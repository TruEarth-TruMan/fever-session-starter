
/**
 * Post-build script for Netlify deployment
 * Runs necessary tasks after the main build completes
 */
import { copyInstallers } from './copy-installers.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureHeadersFile() {
  // Ensure the _headers file is present and properly configured in the build output
  const headersSource = path.join(process.cwd(), 'public', '_headers');
  const headersDestination = path.join(process.cwd(), 'dist', '_headers');
  
  if (fs.existsSync(headersSource)) {
    fs.copyFileSync(headersSource, headersDestination);
    console.log('Copied _headers file to build output');
  } else {
    console.warn('Warning: _headers file not found in public directory');
    
    // Create the headers file directly in the build output
    const headersContent = `# Headers for Fever installer files
/downloads/*
  Content-Disposition: attachment
  Content-Type: application/octet-stream
`;
    fs.writeFileSync(headersDestination, headersContent);
    console.log('Created _headers file in build output');
  }
}

function run() {
  console.log('Running post-build tasks...');
  
  // Copy installer files
  copyInstallers();
  
  // Ensure headers file
  ensureHeadersFile();
  
  console.log('Post-build tasks completed');
}

// Run the script
run();
