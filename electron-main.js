const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn, execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const os = require('os');

let mainWindow;
let backendProcess;
const BACKEND_URL = 'http://localhost:8000';
const BACKEND_PORT = 8000;
const isDevelopment = isDev || process.env.DEBUG_PROD === 'true';

// Function to find Python executable
function findPython() {
  const candidates = [
    process.env.PYTHON_PATH,
    process.env.PYTHON,
    'python3',
    'python',
    'python.exe',
    'python3.exe',
  ].filter(Boolean);

  console.log('Searching for Python in:', candidates);

  for (const candidate of candidates) {
    try {
      execSync(`${candidate} --version`, { stdio: 'ignore', timeout: 5000 });
      console.log(`✓ Found Python: ${candidate}`);
      return candidate;
    } catch (err) {
      console.log(`✗ ${candidate} not found or not executable`);
    }
  }

  // Try to use Windows Python finder
  if (process.platform === 'win32') {
    try {
      const result = execSync('where python', { encoding: 'utf-8', stdio: 'pipe' });
      const pythonPath = result.trim().split('\n')[0];
      if (pythonPath) {
        console.log(`✓ Found Python via where: ${pythonPath}`);
        return pythonPath;
      }
    } catch (err) {
      console.log('Python not found via where command');
    }
  }

  return null;
}

// Function to check if port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Function to wait for backend to be ready
function waitForBackend(timeout = 30000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      axios
        .get(`${BACKEND_URL}/api/health`)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - startTime > timeout) {
            reject(new Error('Backend startup timeout'));
          } else {
            setTimeout(check, 500);
          }
        });
    };
    check();
  });
}

// Function to start backend server
function startBackend() {
  return new Promise(async (resolve, reject) => {
    const portInUse = await isPortInUse(BACKEND_PORT);
    
    if (portInUse) {
      console.log('Backend port already in use, connecting to existing server');
      waitForBackend()
        .then(resolve)
        .catch(reject);
      return;
    }

    try {
      const pythonPath = findPython();
      if (!pythonPath) {
        const errorMsg = 'Python not found in your system PATH.\n\n' +
          'Please install Python 3.10+ from python.org and ensure ' +
          '"Add Python to PATH" is checked during installation.';
        throw new Error(errorMsg);
      }

      const backendDir = path.join(__dirname, 'backend');
      
      if (!fs.existsSync(backendDir)) {
        throw new Error(`Backend directory not found: ${backendDir}`);
      }

      console.log('\n' + '='.repeat(60));
      console.log('Starting Backend Server');
      console.log('='.repeat(60));
      console.log(`Backend Directory: ${backendDir}`);
      console.log(`Python: ${pythonPath}`);
      console.log('='.repeat(60) + '\n');
      
      // First, run setup script to check/install dependencies
      console.log('Running dependency setup...');
      let setupOutput = '';
      let setupError = '';
      
      try {
        setupOutput = execSync(`${pythonPath} setup.py`, {
          cwd: backendDir,
          encoding: 'utf-8',
          timeout: 120000,
          stdio: 'pipe',
        });
        console.log(setupOutput);
      } catch (setupErr) {
        setupError = setupErr.stderr ? setupErr.stderr.toString() : setupErr.toString();
        console.warn('Setup warning:', setupError.substring(0, 200));
        // Don't fail here - backend might still start
      }

      // Set environment variables for the backend
      const env = Object.assign({}, process.env, {
        ELECTRON_APP: '1',
        PYTHONUNBUFFERED: '1',
        PYTHONDONTWRITEBYTECODE: '1',
      });

      console.log('Spawning uvicorn server...\n');

      backendProcess = spawn(pythonPath, [
        '-m', 'uvicorn', 
        'app.main:app', 
        '--host', '0.0.0.0', 
        '--port', BACKEND_PORT.toString(),
        '--log-level', 'info'
      ], {
        cwd: backendDir,
        env: env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let backendStderr = '';
      let backendStdout = '';

      backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        backendStdout += output;
        console.log(`[Backend] ${output}`);
      });

      backendProcess.stderr.on('data', (data) => {
        const output = data.toString();
        backendStderr += output;
        console.error(`[Backend Error] ${output}`);
      });

      backendProcess.on('error', (err) => {
        console.error('Failed to spawn backend process:', err);
        reject(new Error(`Failed to start Python: ${err.message}`));
      });

      backendProcess.on('exit', (code, signal) => {
        console.log(`\nBackend process exited with code ${code} (signal: ${signal})`);
        
        if (code !== 0 && code !== null) {
          let errorDetail = 'Unknown error';
          
          if (backendStderr) {
            errorDetail = backendStderr.substring(0, 300);
          } else if (backendStdout) {
            errorDetail = backendStdout.substring(0, 300);
          }
          
          const fullError = `Backend exited with code ${code}\n\n${errorDetail}`;
          reject(new Error(fullError));
        }
      });

      // Wait for backend to be ready
      console.log('Waiting for backend to respond...');
      waitForBackend(60000)
        .then(() => {
          console.log('✓ Backend is ready!\n');
          resolve();
        })
        .catch((err) => {
          console.error('Backend startup timeout or connection error:', err.message);
          reject(err);
        });

    } catch (err) {
      reject(err);
    }
  });
}

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  if (isDevelopment) {
    // Load from Vite dev server in development
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Load built app in production
    mainWindow.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.reload();
          },
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// App event listeners
app.on('ready', async () => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('Vuk Traders GST Invoice System - Starting');
    console.log('='.repeat(60) + '\n');
    
    let backendError = null;
    let backendStarted = false;
    
    try {
      await startBackend();
      backendStarted = true;
      console.log('✓ Backend started successfully\n');
    } catch (err) {
      backendError = err;
      console.error('✗ Backend startup failed:', err.message);
      console.error('\nDetails:', err.message);
    }
    
    createWindow();
    
    if (!backendStarted) {
      // Show error dialog with detailed message
      setTimeout(() => {
        const errorMessage = backendError ? backendError.message : 'Unknown backend error';
        
        dialog.showErrorBox(
          'Backend Error - Application May Not Work',
          errorMessage + 
          '\n\n' +
          'Troubleshooting:\n' +
          '1. Install Python 3.10+ from python.org\n' +
          '2. Check "Add Python to PATH" during installation\n' +
          '3. Restart this application\n' +
          '4. First run takes 2-3 minutes to install dependencies'
        );
        
        if (mainWindow) {
          mainWindow.webContents.send('backend-error', {
            message: errorMessage,
          });
        }
      }, 500);
    }
  } catch (err) {
    console.error('Fatal application error:', err);
    dialog.showErrorBox(
      'Application Error', 
      `Failed to start application:\n\n${err.message}`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    console.log('Stopping backend server...');
    backendProcess.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers for communication with renderer
ipcMain.handle('get-app-info', () => {
  return {
    appName: 'Vuk Traders GST Invoice System',
    version: app.getVersion(),
    electron: process.versions.electron,
    node: process.versions.node,
  };
});

ipcMain.handle('get-backend-url', () => {
  return BACKEND_URL;
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
