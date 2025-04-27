
const fs = require('fs');
const path = require('path');

/**
 * Generates the update manifest for auto-updates
 * @param {string} rootDir - The root directory of the project
 */
function generateUpdateExample(rootDir) {
  console.log(`Generating update example in ${rootDir}`);
  
  // Get package.json version or use default
  let currentVersion = '1.0.1';
  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    console.log(`Reading package.json from: ${packageJsonPath}`);
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      currentVersion = packageJson.version || currentVersion;
      console.log(`Found version in package.json: ${currentVersion}`);
    } else {
      console.warn(`package.json not found at ${packageJsonPath}, using default version: ${currentVersion}`);
    }
  } catch (error) {
    console.warn(`Could not read version from package.json, using default: ${currentVersion}`);
    console.error(error);
  }

  // Create update manifest
  const updateJsonPath = path.join(rootDir, 'fever-update.json');
  const updateJsonContent = {
    version: currentVersion,
    notes: "New version with bug fixes and performance improvements",
    releaseDate: new Date().toISOString(),
    platforms: {
      "darwin-x64": {
        url: `https://feverstudio.live/download/mac/Fever-${currentVersion}-x64.dmg`,
        signature: "", // Optional: Add code signing signature here
      },
      "darwin-arm64": {
        url: `https://feverstudio.live/download/mac/Fever-${currentVersion}-arm64.dmg`,
        signature: "", // Optional: Add code signing signature here
      },
      "win32-x64": {
        url: `https://feverstudio.live/download/win/Fever-${currentVersion}-setup.exe`,
        signature: "", // Optional: Add code signing signature here
      }
    }
  };

  console.log(`Writing update manifest to: ${updateJsonPath}`);
  fs.writeFileSync(
    updateJsonPath, 
    JSON.stringify(updateJsonContent, null, 2),
    'utf-8'
  );
  
  console.log(`Generated update manifest at ${updateJsonPath}`);
  
  // Also copy to public directory for serving during development
  const publicUpdatePath = path.join(rootDir, 'public', 'fever-update.json');
  try {
    // Ensure public directory exists
    const publicDir = path.join(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      console.log(`Creating public directory: ${publicDir}`);
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    console.log(`Copying update manifest to: ${publicUpdatePath}`);
    fs.writeFileSync(
      publicUpdatePath, 
      JSON.stringify(updateJsonContent, null, 2),
      'utf-8'
    );
    console.log(`Copied update manifest to ${publicUpdatePath} for development`);
  } catch (error) {
    console.warn(`Could not copy update manifest to public directory: ${error.message}`);
  }
}

module.exports = { generateUpdateExample };
