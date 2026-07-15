const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumen', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  getBrowserInfo: () => ipcRenderer.invoke('browser:info'),
  updateAdblock: (enabled) => ipcRenderer.invoke('settings:update-adblock', enabled),
  updateBookmarksBar: (visible) => ipcRenderer.invoke('settings:update-bookmarks-bar', visible),
  updatePreferences: (preferences) => ipcRenderer.invoke('settings:update-preferences', preferences),
  resetPreferences: () => ipcRenderer.invoke('settings:reset-preferences'),
  addBookmark: (bookmark) => ipcRenderer.invoke('bookmarks:add', bookmark),
  removeBookmark: (idOrUrl) => ipcRenderer.invoke('bookmarks:remove', idOrUrl),
  clearBookmarks: () => ipcRenderer.invoke('bookmarks:clear'),
  clearBrowsingData: () => ipcRenderer.invoke('browser:clear-data'),
  clearCache: () => ipcRenderer.invoke('browser:clear-cache'),
  ensurePartition: (partition) => ipcRenderer.invoke('browser:ensure-partition', partition),
  importBrowserData: (source) => ipcRenderer.invoke('browser:import-data', source),
  getVpnStatus: () => ipcRenderer.invoke('vpn:status'),
  openAmneziaVpn: () => ipcRenderer.invoke('vpn:open-amnezia'),
  openAmneziaDocs: () => ipcRenderer.invoke('vpn:open-docs'),
  applyVpnProxy: () => ipcRenderer.invoke('vpn:apply-proxy'),
  getPasswords: () => ipcRenderer.invoke('passwords:list'),
  savePassword: (payload) => ipcRenderer.invoke('passwords:save', payload),
  removePassword: (id) => ipcRenderer.invoke('passwords:remove', id),
  clearPasswords: () => ipcRenderer.invoke('passwords:clear'),
  getPasswordSecret: (id) => ipcRenderer.invoke('passwords:get-secret', id),
  copyPassword: (id) => ipcRenderer.invoke('passwords:copy', id),
  importPasswordCsv: () => ipcRenderer.invoke('passwords:import-csv'),
  createWindow: () => ipcRenderer.invoke('browser:new-window'),
  createPrivateWindow: () => ipcRenderer.invoke('browser:new-private-window'),
  getWindowState: () => ipcRenderer.invoke('window:get-state'),
  controlWindow: (action) => ipcRenderer.invoke('window:control', action),
  addHistory: (entry) => ipcRenderer.invoke('history:add', entry),
  clearHistory: () => ipcRenderer.invoke('history:clear'),
  saveSession: (tabs) => ipcRenderer.invoke('session:save', tabs),
  addClosedTab: (tab) => ipcRenderer.invoke('closed-tabs:add', tab),
  popClosedTab: () => ipcRenderer.invoke('closed-tabs:pop'),
  updateNote: (payload) => ipcRenderer.invoke('notes:update', payload),
  addProfile: (name) => ipcRenderer.invoke('profiles:add', name),
  getDownloads: () => ipcRenderer.invoke('downloads:get'),
  getScreenshots: () => ipcRenderer.invoke('screenshots:get'),
  clearScreenshots: () => ipcRenderer.invoke('screenshots:clear'),
  openScreenshotsFolder: () => ipcRenderer.invoke('screenshots:open-folder'),
  openPath: (filePath) => ipcRenderer.invoke('path:open', filePath),
  revealPath: (filePath) => ipcRenderer.invoke('path:reveal', filePath),
  getAdblockStats: () => ipcRenderer.invoke('adblock:stats'),
  resetAdblockStats: () => ipcRenderer.invoke('adblock:reset'),
  onAdblockBlocked: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('adblock:blocked', handler);
    return () => ipcRenderer.removeListener('adblock:blocked', handler);
  },
  onAdblockReset: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('adblock:reset', handler);
    return () => ipcRenderer.removeListener('adblock:reset', handler);
  },
  onNewTabRequest: (callback) => {
    const handler = (_event, url) => callback(url);
    ipcRenderer.on('browser:new-tab', handler);
    return () => ipcRenderer.removeListener('browser:new-tab', handler);
  },
  onSettingsChanged: (callback) => {
    const handler = (_event, settings) => callback(settings);
    ipcRenderer.on('settings:changed', handler);
    return () => ipcRenderer.removeListener('settings:changed', handler);
  },
  onPasswordsChanged: (callback) => {
    const handler = (_event, passwords) => callback(passwords);
    ipcRenderer.on('passwords:changed', handler);
    return () => ipcRenderer.removeListener('passwords:changed', handler);
  },
  onDownloadsUpdated: (callback) => {
    const handler = (_event, downloads) => callback(downloads);
    ipcRenderer.on('downloads:updated', handler);
    return () => ipcRenderer.removeListener('downloads:updated', handler);
  },
  onScreenshotCreated: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('screenshots:created', handler);
    return () => ipcRenderer.removeListener('screenshots:created', handler);
  },
  onWindowStateChanged: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('window:state', handler);
    return () => ipcRenderer.removeListener('window:state', handler);
  },
  onMenuCommand: (callback) => {
    const handler = (_event, command) => callback(command);
    ipcRenderer.on('menu:command', handler);
    return () => ipcRenderer.removeListener('menu:command', handler);
  }
});
