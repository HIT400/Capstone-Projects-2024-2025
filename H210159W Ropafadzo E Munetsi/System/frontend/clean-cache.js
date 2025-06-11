const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to clean
const pathsToClean = [
  '.next',
  'node_modules/.cache'
];

console.log('Cleaning Next.js cache...');

// Delete directories
pathsToClean.forEach(dirPath => {
  const fullPath = path.join(__dirname, dirPath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`Removing ${dirPath}...`);
    
    try {
      if (process.platform === 'win32') {
        // On Windows, use rmdir /s /q
        execSync(`rmdir /s /q "${fullPath}"`, { stdio: 'inherit' });
      } else {
        // On Unix-like systems, use rm -rf
        execSync(`rm -rf "${fullPath}"`, { stdio: 'inherit' });
      }
      console.log(`Successfully removed ${dirPath}`);
    } catch (error) {
      console.error(`Error removing ${dirPath}:`, error.message);
    }
  } else {
    console.log(`${dirPath} does not exist, skipping...`);
  }
});

console.log('Cache cleaning completed!');
