const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('beatforge', {
  platform: process.platform,
  version: process.versions.electron,
  isDesktop: true,
  saveProject: (data) => ipcRenderer.invoke('dialog:saveProject', data),
  saveAudio: (payload) => ipcRenderer.invoke('dialog:saveAudio', payload),
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
