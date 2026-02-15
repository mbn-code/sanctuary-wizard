const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Borderless
    icon: path.join(__dirname, '../public/favicon.svg'), // Use our heart icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#FFF5E1', // Match our cream background
  });

  // Load the Vercel URL
  win.loadURL('https://valentine-flax-alpha.vercel.app');

  // win.webContents.openDevTools(); // For debugging
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle close request from renderer
ipcMain.on('close-app', () => {
  app.quit();
});
