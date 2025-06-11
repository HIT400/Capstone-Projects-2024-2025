// This is a simple wrapper script to run the checkDocuments.js script
// with the correct Node.js options for ES modules

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.join(__dirname, 'checkDocuments.js');

// Run the script with Node.js
const child = spawn('node', [scriptPath], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code);
});
