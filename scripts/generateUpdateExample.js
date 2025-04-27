
const fs = require('fs');
const path = require('path');

/**
 * Generates an example update.json file for auto-updates
 * @param {string} rootDir - The root directory of the project
 */
function generateUpdateExample(rootDir) {
  console.log(`Generating update example in ${rootDir}`);
  
  if (!rootDir || typeof rootDir !== 'string') {
    console.error('Invalid rootDir provided to generateUpdateExample');
    return;
  }
  
  const updatePath = path.join(rootDir, 'update-example.json');
  
  // Check if file already exists
  if (fs.existsSync(updatePath)) {
    console.log('Update example file already exists, skipping generation');
    return;
  }
  
  // Get the app version from package.json if possible
  let version = '1.0.0';
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
    if (packageJson.version) {
      version = packageJson.version;
    }
  } catch (error) {
    console.error(`Error reading package.json: ${error.message}`);
  }
  
  // Create an example update.json file
  const updateContent = {
    version,
    notes: "New version released with bug fixes and performance improvements.",
    pub_date: new Date().toISOString(),
    platforms: {
      win32: {
        signature: "",
        url: "https://feverstudio.live/download/win/Fever-latest-setup.exe"
      },
      darwin: {
        signature: "",
        url: "https://feverstudio.live/download/mac/Fever-latest.dmg"
      }
    }
  };
  
  try {
    fs.writeFileSync(updatePath, JSON.stringify(updateContent, null, 2));
    console.log(`Created update example file at: ${updatePath}`);
  } catch (error) {
    console.error(`Error creating update example file: ${error.message}`);
  }
}

module.exports = { generateUpdateExample };
