const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    naver_cafe_write: () => ipcRenderer.invoke('naver_cafe_write'),
    // we can also expose variables, not just functions
})