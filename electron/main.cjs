const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !!process.env.ELECTRON_DEV;
const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

let mainWindow = null;
const fileWatchers = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 360,
    minHeight: 600,
    backgroundColor: '#0a0e1a',
    show: false,
    title: 'BeatForge',
    icon: isWin
      ? path.join(__dirname, '..', 'resources', 'icon.ico')
      : path.join(__dirname, '..', 'resources', 'icons', '512x512.png'),
    autoHideMenuBar: !isMac,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      backgroundThrottling: false,
      spellcheck: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function buildMenu() {
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Dosya',
      submenu: [
        {
          label: 'Yeni Proje',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('app:new-project')
        },
        {
          label: 'Proje Ac...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [{ name: 'BeatForge Project', extensions: ['bfp', 'json'] }]
            });
            if (!result.canceled && result.filePaths[0]) {
              const data = fs.readFileSync(result.filePaths[0], 'utf-8');
              mainWindow.webContents.send('app:open-project', data);
            }
          }
        },
        {
          label: 'Projeyi Kaydet',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('app:save-project')
        },
        { type: 'separator' },
        {
          label: 'WAV Olarak Disa Aktar',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow?.webContents.send('app:export-wav')
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Duzen',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Gorunum',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Yardim',
      submenu: [
        {
          label: 'BeatForge Hakkinda',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'BeatForge Hakkinda',
              message: 'BeatForge',
              detail: `Surum: ${app.getVersion()}\nDrum n Bass, Dubstep ve daha fazlasi icin tasarlanmis sezgisel beat maker.\n\n© 2026 BeatForge Studio`,
              buttons: ['Tamam']
            });
          }
        },
        {
          label: 'Web Sitesi',
          click: () => shell.openExternal('https://beatforge.app')
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle('dialog:saveProject', async (_, data) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Projeyi Kaydet',
    defaultPath: 'beatforge-project.bfp',
    filters: [{ name: 'BeatForge Project', extensions: ['bfp'] }]
  });
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, data, 'utf-8');
    return { ok: true, path: result.filePath };
  }
  return { ok: false };
});

ipcMain.handle('dialog:saveAudio', async (_, { buffer, defaultName }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Sesi Disa Aktar',
    defaultPath: defaultName || 'beatforge-export.wav',
    filters: [{ name: 'WAV Audio', extensions: ['wav'] }]
  });
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, Buffer.from(buffer));
    return { ok: true, path: result.filePath };
  }
  return { ok: false };
});

ipcMain.handle('fs:readFile', async (_, filePath) => {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error('readFile error:', err.message);
    return null;
  }
});

ipcMain.handle('fs:getFileMeta', async (_, filePath) => {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    return { mtime: stat.mtimeMs, size: stat.size };
  } catch (err) {
    return null;
  }
});

ipcMain.handle('fs:watchFile', async (_, filePath) => {
  if (fileWatchers.has(filePath)) {
    fileWatchers.get(filePath).close();
  }
  if (!fs.existsSync(filePath)) return null;
  const watcher = fs.watch(filePath, (eventType) => {
    if (eventType === 'change') {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        mainWindow?.webContents.send('fs:fileChanged', { filePath, content });
      } catch {}
    }
  });
  fileWatchers.set(filePath, watcher);
  return true;
});

ipcMain.handle('fs:unwatchFile', async (_, filePath) => {
  if (fileWatchers.has(filePath)) {
    fileWatchers.get(filePath).close();
    fileWatchers.delete(filePath);
  }
  return true;
});

app.whenReady().then(() => {
  createWindow();
  buildMenu();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:5173' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
    }
  });
});
