const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('bridge', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    n_cafe_write: (param) => ipcRenderer.invoke('n_cafe_write', param),
    c_scraping: (param) => ipcRenderer.invoke('c_scraping', param),
})

/*
    contextBridge.exposeInMainWorld('logger', {
        send: () => ipcRenderer.invoke('logger_send', param)
    })
*/