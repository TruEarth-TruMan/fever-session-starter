
const fs = require('fs');
const path = require('path');

function validateDirectoryStructure(rootDir) {
  console.log(`\n4. Checking directory structure`);
  
  const dirs = {
    scripts: path.join(rootDir, 'scripts'),
    electron: path.join(rootDir, 'electron'),
    dist: path.join(rootDir, 'dist'),
    build: path.join(rootDir, 'build')
  };

  const results = {};

  for (const [name, dir] of Object.entries(dirs)) {
    if (!fs.existsSync(dir)) {
      console.log(`❌ ${name} directory not found!`);
      if (name === 'scripts') {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created ${name} directory`);
      }
      results[name] = false;
    } else {
      console.log(`✅ ${name} directory exists`);
      results[name] = true;
    }
  }

  return results;
}

module.exports = { validateDirectoryStructure };
