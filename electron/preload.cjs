const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVideoInfo: (url) => ipcRenderer.invoke('get-video-info', url),
  startDownload: (options) => ipcRenderer.invoke('start-download', options),
  pauseDownload: (downloadId) => ipcRenderer.invoke('pause-download', downloadId),
  resumeDownload: (options) => ipcRenderer.invoke('resume-download', options),
  cancelDownload: (downloadId) => ipcRenderer.invoke('cancel-download', downloadId),
  openDownloadsFolder: () => ipcRenderer.invoke('open-downloads-folder'),
  showInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),
  getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getMediaUrl: (filePath) => ipcRenderer.invoke('get-media-url', filePath),
  resolveMediaFile: (options) => ipcRenderer.invoke('resolve-media-file', options),
  openMediaFileDialog: () => ipcRenderer.invoke('open-media-file-dialog'),
  getFileUrl: (filePath) => {
    if (!filePath) return null;
    const normalized = filePath.replace(/\\/g, '/');
    return normalized.startsWith('/') ? `file://${normalized}` : `file:///${normalized}`;
  },

  onDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('download-progress', handler);
    return () => ipcRenderer.removeListener('download-progress', handler);
  },
  onDownloadComplete: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('download-complete', handler);
    return () => ipcRenderer.removeListener('download-complete', handler);
  },
  onDownloadError: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('download-error', handler);
    return () => ipcRenderer.removeListener('download-error', handler);
  },
});
