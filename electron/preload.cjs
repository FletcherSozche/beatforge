const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('beatforge', {
  platform: process.platform,
  version: process.versions.electron,
  isDesktop: true,
  saveProject: (data) => ipcRenderer.invoke('dialog:saveProject', data),
  saveAudio: (payload) => ipcRenderer.invoke('dialog:saveAudio', payload),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  getFileMeta: (filePath) => ipcRenderer.invoke('fs:getFileMeta', filePath),
  watchFile: (filePath) => ipcRenderer.invoke('fs:watchFile', filePath),
  unwatchFile: (filePath) => ipcRenderer.invoke('fs:unwatchFile', filePath),
  onFileChanged: (handler) => {
    const wrapped = (_, payload) => handler(payload);
    ipcRenderer.on('fs:fileChanged', wrapped);
    return () => ipcRenderer.removeListener('fs:fileChanged', wrapped);
  },
  onMenu: (channel, handler) => {
    const validChannels = [
      'app:new-project',
      'app:open-project',
      'app:save-project',
      'app:export-wav'
    ];
    if (validChannels.includes(channel)) {
      const wrapped = (_, ...args) => handler(...args);
      ipcRenderer.on(channel, wrapped);
      return () => ipcRenderer.removeListener(channel, wrapped);
    }
  }
});
