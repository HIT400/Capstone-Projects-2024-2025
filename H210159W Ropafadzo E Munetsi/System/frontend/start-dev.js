const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Next.js development server...');

// Run next dev
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (error) => {
  console.error('Failed to start Next.js server:', error);
});

nextProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Next.js server process exited with code ${code}`);
  }
});
