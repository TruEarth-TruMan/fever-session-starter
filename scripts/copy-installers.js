
/**
 * Copy installer files from release directory to public/downloads
 * This ensures the installer files are included in the Netlify deployment
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyInstallers() {
  console.log('Copying installer files to public/downloads...');
  
  const releaseDir = path.join(process.cwd(), 'release');
  const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
  const distDownloadsDir = path.join(process.cwd(), 'dist', 'downloads');
  
  // Ensure downloads directory exists in public
  if (!fs.existsSync(downloadsDir)) {
    console.log(`Creating directory: ${downloadsDir}`);
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  // Ensure downloads directory exists in dist (build output)
  if (!fs.existsSync(distDownloadsDir)) {
    console.log(`Creating directory: ${distDownloadsDir}`);
    fs.mkdirSync(distDownloadsDir, { recursive: true });
  }
  
  // If release directory doesn't exist yet, create placeholder files
  if (!fs.existsSync(releaseDir)) {
    console.log(`Warning: Release directory not found: ${releaseDir}`);
    console.log('Creating placeholder installer files for testing');
    
    // Create placeholder files (0 bytes) for testing
    fs.writeFileSync(path.join(downloadsDir, 'Fever-0.1.0-setup.exe'), '');
    fs.writeFileSync(path.join(downloadsDir, 'Fever-0.1.0-arm64.zip'), '');
    
    // Also copy to dist/downloads for the current build
    fs.writeFileSync(path.join(distDownloadsDir, 'Fever-0.1.0-setup.exe'), '');
    fs.writeFileSync(path.join(distDownloadsDir, 'Fever-0.1.0-arm64.zip'), '');
    
    console.log('Created placeholder installer files');
    return;
  }
  
  // Copy installer files
  try {
    const files = fs.readdirSync(releaseDir);
    let count = 0;
    
    // Filter for installer files (.exe, .dmg, .zip)
    const installerFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.exe' || ext === '.dmg' || ext === '.zip';
    });
    
    if (installerFiles.length === 0) {
      console.log('No installer files found in release directory');
      return;
    }
    
    // Copy each installer file to both public/downloads and dist/downloads
    installerFiles.forEach(file => {
      const sourcePath = path.join(releaseDir, file);
      const publicTargetPath = path.join(downloadsDir, file);
      const distTargetPath = path.join(distDownloadsDir, file);
      
      fs.copyFileSync(sourcePath, publicTargetPath);
      fs.copyFileSync(sourcePath, distTargetPath);
      console.log(`Copied: ${file} to public/downloads and dist/downloads`);
      count++;
    });
    
    console.log(`Successfully copied ${count} installer files`);
  } catch (error) {
    console.error('Error copying installer files:', error.message);
  }
}

// Export for importing in other files
export { copyInstallers };

// Execute if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  copyInstallers();
}
