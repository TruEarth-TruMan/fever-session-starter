
/**
 * Copy installer files from release directory to public/downloads
 * This ensures the installer files are included in the Netlify deployment
 */
const fs = require('fs');
const path = require('path');

function copyInstallers() {
  console.log('Copying installer files to public/downloads...');
  
  const releaseDir = path.join(process.cwd(), 'release');
  const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
  
  // Ensure downloads directory exists
  if (!fs.existsSync(downloadsDir)) {
    console.log(`Creating directory: ${downloadsDir}`);
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  
  // If release directory doesn't exist yet, create placeholder files
  if (!fs.existsSync(releaseDir)) {
    console.log(`Warning: Release directory not found: ${releaseDir}`);
    console.log('Creating placeholder installer files for testing');
    
    // Create placeholder files (0 bytes) for testing
    fs.writeFileSync(path.join(downloadsDir, 'Fever-0.1.0-setup.exe'), '');
    fs.writeFileSync(path.join(downloadsDir, 'Fever-0.1.0-arm64.zip'), '');
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
    
    // Copy each installer file
    installerFiles.forEach(file => {
      const sourcePath = path.join(releaseDir, file);
      const targetPath = path.join(downloadsDir, file);
      
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${file}`);
      count++;
    });
    
    console.log(`Successfully copied ${count} installer files to public/downloads`);
  } catch (error) {
    console.error('Error copying installer files:', error.message);
  }
}

// Execute if this script is run directly
if (require.main === module) {
  copyInstallers();
} else {
  module.exports = { copyInstallers };
}
