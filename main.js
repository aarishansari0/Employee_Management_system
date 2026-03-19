const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let currentUser = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  mainWindow.loadFile('index.html');
}

app.disableHardwareAcceleration();


app.whenReady().then(createWindow);

ipcMain.on('login-success', (event) => {
  mainWindow.loadFile('home.html');
});

ipcMain.on('open-add-task', (event) => {
  mainWindow.loadFile('add_task.html');
});

ipcMain.on('load_next_page', (event, page) => {
  mainWindow.loadFile(`${page}.html`);
});


