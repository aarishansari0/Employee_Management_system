const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loginSuccess: () => ipcRenderer.send('login-success'),
  open_add_task: () => ipcRenderer.send('open-add-task'),
  load_next_page:(page) => ipcRenderer.send('load_next_page', page)
});
