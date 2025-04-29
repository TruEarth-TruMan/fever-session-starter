
#!/usr/bin/env node

/**
 * Prepares the release directory structure for distribution
 * This script organizes the built artifacts and generates update metadata
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const releaseDir = path.join(process.cwd(), 'release');
const distributionDir = path.join(process.cwd(), 'distribution');
const packageJson = require(path.join(process.cwd(), 'package.json'));

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Copy files with specific extensions
function copyFiles(sourceDir, targetDir, extensions) {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    return;
  }
  
  ensureDir(targetDir);
  
  const files = fs.readdirSync(sourceDir);
  let count = 0;
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (extensions.includes(ext)) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      fs.copyFileSync(sourcePath, targetPath);
      count++;
      console.log(`Copied: ${file}`);
    }
  }
  
  console.log(`Copied ${count} files to ${targetDir}`);
  return count;
}

// Generate a release notes file
function generateReleaseNotes() {
  const notesPath = path.join(distributionDir, 'RELEASE_NOTES.md');
  const buildDate = new Date().toISOString();
  const version = packageJson.version;
  
  const content = `# Fever v${version} Release Notes

Release Date: ${buildDate}

## Changes in this version
- Initial release of Fever audio application
- Support for Scarlett audio interfaces
- Basic recording and playback functionality

## Installation Instructions
1. Download the installer for your platform
2. Run the installer and follow the prompts
3. Launch Fever from your applications folder

## System Requirements
- Windows 10 or later (64-bit)
- macOS 10.15 or later
- 4GB RAM minimum
- 500MB free disk space
`;

  fs.writeFileSync(notesPath, content);
  console.log(`Generated release notes at: ${notesPath}`);
}

// Main function
async function main() {
  try {
    console.log('Preparing release directory structure...');
    
    // Ensure distribution directory exists
    ensureDir(distributionDir);
    
    // Check if release directory exists
    if (!fs.existsSync(releaseDir)) {
      console.error(`Release directory not found: ${releaseDir}`);
      console.error('Please run a build first');
      process.exit(1);
    }
    
    // Windows artifacts
    const winDir = path.join(distributionDir, 'win');
    ensureDir(winDir);
    const winFileCount = copyFiles(releaseDir, winDir, ['.exe', '.blockmap', '.yml']);
    
    // macOS artifacts
    const macDir = path.join(distributionDir, 'mac');
    ensureDir(macDir);
    const macFileCount = copyFiles(releaseDir, macDir, ['.dmg', '.zip', '.blockmap', '.yml']);
    
    // Generate release notes
    generateReleaseNotes();
    
    // Create update server manifest template
    const updateManifest = {
      name: packageJson.name,
      version: packageJson.version,
      notes: `Release notes for version ${packageJson.version}`,
      pub_date: new Date().toISOString(),
      platforms: {
        win64: {
          signature: "",
          url: `https://feverstudio.live/update/win/Fever-${packageJson.version}-setup.exe`
        },
        darwin: {
          signature: "",
          url: `https://feverstudio.live/update/mac/Fever-${packageJson.version}.dmg`
        }
      }
    };
    
    fs.writeFileSync(
      path.join(distributionDir, 'update-manifest.json'),
      JSON.stringify(updateManifest, null, 2)
    );
    
    console.log(`
Release preparation completed!

Files created:
- Windows installers: ${winFileCount} files
- macOS installers: ${macFileCount} files
- Release notes and update manifest

Next steps:
1. Test the installers on target platforms
2. Upload the distribution files to your update server
3. Deploy the update manifest to enable auto-updates
`);

  } catch (error) {
    console.error('Error preparing release:', error);
    process.exit(1);
  }
}

main();
