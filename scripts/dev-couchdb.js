#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to test-couch directory and script
const testCouchDir = path.resolve(__dirname, '..', 'test-couch');
const scriptPath = path.join(testCouchDir, 'test-couch.sh');

// Check if the test-couch directory and script exist
if (!fs.existsSync(testCouchDir) || !fs.existsSync(scriptPath)) {
  console.error('Error: test-couch submodule is missing or incomplete.');
  console.log('\nPlease initialize the test-couch submodule with:');
  console.log('\n  git submodule update --init --recursive');
  console.log('\nOr if you need to clone it:');
  console.log('\n  git clone https://github.com/NiloCK/skuilder-test-db.git test-couch');
  console.log('\nAfter initializing the submodule, try running this command again.\n');
  process.exit(1);
}

// Make sure the script is executable
try {
  execSync(`chmod +x ${scriptPath}`);
} catch (error) {
  console.error('Failed to make script executable:', error);
  process.exit(1);
}

// Get the command from args or default to 'status'
const command = process.argv[2] || 'status';
const validCommands = ['start', 'stop', 'status', 'remove'];

if (!validCommands.includes(command)) {
  console.error(`Invalid command: ${command}`);
  console.log(`Valid commands are: ${validCommands.join(', ')}`);
  process.exit(1);
}

// Check if CouchDB is already running if command is 'start'
if (command === 'start') {
  try {
    const status = execSync(`${scriptPath} status`, { stdio: 'pipe' }).toString();
    if (status.includes('Up') || status.includes('running')) {
      console.log('CouchDB is already running');
      process.exit(0);
    }
  } catch (error) {
    // If the status check fails, continue with the start command
  }
}

// Execute the command
console.log(`Managing CouchDB: ${command}`);
const child = spawn(scriptPath, [command], {
  cwd: testCouchDir,
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(`Failed to execute command: ${error}`);
  process.exit(1);
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`Command exited with code ${code}`);
    process.exit(code);
  }

  // For 'start' command, wait for CouchDB to be fully operational
  if (command === 'start') {
    console.log('Waiting for CouchDB to be ready...');

    // Simple polling to check CouchDB availability
    let attempts = 0;
    const maxAttempts = 30;

    const checkInterval = setInterval(() => {
      attempts++;
      try {
        execSync('curl -s http://localhost:5984/', { stdio: 'pipe' });
        clearInterval(checkInterval);
        console.log('CouchDB is now ready!');
      } catch (error) {
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error('CouchDB failed to start properly');
          process.exit(1);
        }
      }
    }, 1000);
  }
});
