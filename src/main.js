const { app, BrowserWindow, Menu, clipboard, dialog, ipcMain, session, shell } = require('electron');
const { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } = require('fs');
const { execFile } = require('child_process');
const path = require('path');
const { createAdBlocker } = require('./adblocker');
const { PasswordStore } = require('./password-store');
const { SettingsStore } = require('./settings');

const BROWSER_PARTITION = 'persist:lumen-browser';
const AMNEZIA_DOWNLOAD_URL = 'https://amnezia.org/';
const AMNEZIA_DOCS_URL = 'https://docs.amnezia.org/';
const APP_ICON = path.join(__dirname, '..', 'build', 'icon.png');

let settingsStore;
let passwordStore;
const adBlockers = new Map();
const adblockStats = {
  total: 0,
  byType: {}
};
const downloads = [];
const downloadPartitions = new Set();
const browserPartitions = new Set([BROWSER_PARTITION]);
const privacyPartitions = new Set();

const windows = new Set();

function createWindow(options = {}) {
  const initialUrl = typeof options === 'string' ? options : options.initialUrl;
  const privateMode = typeof options === 'object' && options.privateMode === true;
  const privatePartition = privateMode ? `lumen-private-${Date.now()}-${Math.random().toString(16).slice(2)}` : '';
  const browserWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    title: 'Lumen Browser',
    backgroundColor: '#000000',
    frame: false,
    autoHideMenuBar: true,
    icon: APP_ICON,
    titleBarStyle: 'hidden',
    trafficLightPosition: {
      x: 14,
      y: 14
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true
    }
  });

  windows.add(browserWindow);

  browserWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = true;
    delete webPreferences.preload;

    if (!isAllowedWebviewUrl(params.src)) {
      event.preventDefault();
    }
  });

  browserWindow.webContents.once('did-finish-load', () => {
    emitWindowState(browserWindow);

    if (initialUrl && isAllowedWebviewUrl(initialUrl)) {
      browserWindow.webContents.send('browser:new-tab', initialUrl);
    }
  });

  browserWindow.on('maximize', () => emitWindowState(browserWindow));
  browserWindow.on('unmaximize', () => emitWindowState(browserWindow));
  browserWindow.on('enter-full-screen', () => emitWindowState(browserWindow));
  browserWindow.on('leave-full-screen', () => emitWindowState(browserWindow));

  browserWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'), {
    query: {
      private: privateMode ? '1' : '0',
      partition: privatePartition
    }
  });

  browserWindow.on('closed', () => {
    windows.delete(browserWindow);
  });

  return browserWindow;
}

function setupApplicationMenu() {
  const template = [
    ...(process.platform === 'darwin'
      ? [
          {
            label: app.name,
            submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => sendCommandToFocusedWindow('new-tab')
        },
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => createWindow()
        },
        {
          label: 'New Private Window',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => createWindow({ privateMode: true })
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => sendCommandToFocusedWindow('close-tab')
        },
        {
          label: 'Restore Closed Tab',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => sendCommandToFocusedWindow('restore-closed-tab')
        },
        { type: 'separator' },
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
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
      label: 'View',
      submenu: [
        {
          label: 'Back',
          accelerator: 'CmdOrCtrl+Left',
          click: () => sendCommandToFocusedWindow('back')
        },
        {
          label: 'Forward',
          accelerator: 'CmdOrCtrl+Right',
          click: () => sendCommandToFocusedWindow('forward')
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => sendCommandToFocusedWindow('reload')
        },
        {
          label: 'Focus Address Bar',
          accelerator: 'CmdOrCtrl+L',
          click: () => sendCommandToFocusedWindow('focus-omnibox')
        },
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendCommandToFocusedWindow('toggle-sidebar')
        },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Bookmarks',
      submenu: [
        {
          label: 'Bookmark Current Page',
          accelerator: 'CmdOrCtrl+D',
          click: () => sendCommandToFocusedWindow('toggle-bookmark')
        },
        {
          label: 'Show Bookmarks',
          accelerator: 'CmdOrCtrl+B',
          click: () => sendCommandToFocusedWindow('toggle-bookmarks-panel')
        },
        {
          label: 'Show/Hide Bookmarks Bar',
          click: () => sendCommandToFocusedWindow('toggle-bookmarks-bar')
        }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function setupAdBlocker() {
  ensureBrowserSession(BROWSER_PARTITION);
}

function ensureBrowserSession(partition) {
  const normalizedPartition = partition || BROWSER_PARTITION;
  const browserSession = session.fromPartition(normalizedPartition);
  browserPartitions.add(normalizedPartition);

  if (!adBlockers.has(normalizedPartition)) {
    const blocker = createAdBlocker(browserSession, settingsStore.getAdblockEnabled());
    blocker.setAllowlist(settingsStore.getPublicSettings().adblockAllowlist);
    blocker.on('blocked', (event) => {
      adblockStats.total += 1;
      adblockStats.byType[event.resourceType] = (adblockStats.byType[event.resourceType] || 0) + 1;
      broadcast('adblock:blocked', {
        ...event,
        total: adblockStats.total,
        byType: { ...adblockStats.byType }
      });
    });
    adBlockers.set(normalizedPartition, blocker);
  }

  setupDownloadTracking(normalizedPartition, browserSession);
  setupPrivacyShield(normalizedPartition, browserSession);
  applyProxyToSession(browserSession, settingsStore.getPublicSettings()).catch(() => {});
}

function setupDownloadTracking(partition, browserSession) {
  if (downloadPartitions.has(partition)) return;
  downloadPartitions.add(partition);

  browserSession.on('will-download', (_event, item) => {
    const download = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      filename: item.getFilename(),
      url: item.getURL(),
      path: item.getSavePath(),
      receivedBytes: 0,
      totalBytes: item.getTotalBytes(),
      state: 'progressing',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    downloads.unshift(download);
    broadcast('downloads:updated', getDownloads());

    item.on('updated', (_itemEvent, state) => {
      download.state = state;
      download.receivedBytes = item.getReceivedBytes();
      download.totalBytes = item.getTotalBytes();
      download.path = item.getSavePath();
      download.updatedAt = new Date().toISOString();
      broadcast('downloads:updated', getDownloads());
    });

    item.once('done', (_itemEvent, state) => {
      download.state = state;
      download.receivedBytes = item.getReceivedBytes();
      download.totalBytes = item.getTotalBytes();
      download.path = item.getSavePath();
      download.updatedAt = new Date().toISOString();
      broadcast('downloads:updated', getDownloads());
    });
  });
}

function getDownloads() {
  return downloads.slice(0, 100).map((download) => ({ ...download }));
}

function getScreenshotDirectory() {
  return path.join(app.getPath('pictures'), 'Lumen Screenshots');
}

function getBrowserInfo() {
  return {
    name: app.getName() || 'Lumen Browser',
    version: app.getVersion(),
    electron: process.versions.electron,
    chromium: process.versions.chrome,
    node: process.versions.node,
    platform: `${process.platform} ${process.arch}`,
    userDataPath: app.getPath('userData'),
    screenshotDirectory: getScreenshotDirectory()
  };
}

function setupPrivacyShield(partition, browserSession) {
  if (privacyPartitions.has(partition)) return;
  privacyPartitions.add(partition);

  browserSession.webRequest.onBeforeSendHeaders({ urls: ['http://*/*', 'https://*/*'] }, (details, callback) => {
    const settings = settingsStore.getPublicSettings();

    if (settings.privacyShieldEnabled) {
      details.requestHeaders.DNT = '1';
      details.requestHeaders['Sec-GPC'] = '1';
    }

    callback({ requestHeaders: details.requestHeaders });
  });

  browserSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    const settings = settingsStore.getPublicSettings();
    const blockedPermissions = new Set(['geolocation', 'notifications', 'midiSysex', 'pointerLock']);
    callback(!(settings.privacyShieldEnabled && blockedPermissions.has(permission)));
  });
}

function getAmneziaCandidates() {
  if (process.platform === 'darwin') {
    return [
      '/Applications/AmneziaVPN.app',
      path.join(app.getPath('home'), 'Applications', 'AmneziaVPN.app'),
      '/Applications/AmneziaVPN/AmneziaVPN.app'
    ];
  }

  if (process.platform === 'win32') {
    return [
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'AmneziaVPN', 'AmneziaVPN.exe'),
      path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'AmneziaVPN', 'AmneziaVPN.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'AmneziaVPN', 'AmneziaVPN.exe')
    ];
  }

  return ['/usr/bin/amneziavpn', '/usr/local/bin/amneziavpn', '/opt/amnezia/AmneziaVPN'];
}

function findAmneziaApp() {
  return getAmneziaCandidates().find((candidate) => candidate && existsSync(candidate)) || '';
}

function getVpnStatus() {
  const settings = settingsStore.getPublicSettings();
  const amneziaPath = findAmneziaApp();
  const proxyRules = buildProxyRules(settings);

  return {
    amneziaInstalled: Boolean(amneziaPath),
    amneziaPath,
    docsUrl: AMNEZIA_DOCS_URL,
    downloadUrl: AMNEZIA_DOWNLOAD_URL,
    proxyBypassRules: settings.vpnProxyBypass || '<local>',
    proxyEnabled: settings.vpnProxyEnabled === true,
    proxyReady: Boolean(proxyRules),
    proxyRules
  };
}

async function openAmneziaVpn() {
  const amneziaPath = findAmneziaApp();

  if (!amneziaPath) {
    await shell.openExternal(AMNEZIA_DOWNLOAD_URL);
    return { installed: false, opened: false, downloadUrl: AMNEZIA_DOWNLOAD_URL };
  }

  if (process.platform === 'darwin') {
    await execFileAsync('open', [amneziaPath]);
  } else {
    await shell.openPath(amneziaPath);
  }

  return { installed: true, opened: true, path: amneziaPath };
}

function execFileAsync(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function buildProxyRules(settings) {
  const host = String(settings.vpnProxyHost || '').trim();
  const port = String(settings.vpnProxyPort || '').trim();
  const scheme = String(settings.vpnProxyScheme || 'socks5').trim().toLowerCase();

  if (!settings.vpnProxyEnabled || !host || !port) return '';

  return `${scheme}://${host}:${port}`;
}

async function applyProxyToSession(browserSession, settings) {
  const proxyRules = buildProxyRules(settings);

  if (!proxyRules) {
    await browserSession.setProxy({ mode: 'direct' });
    return { enabled: false, proxyRules: '', proxyBypassRules: settings.vpnProxyBypass || '<local>' };
  }

  const proxyBypassRules = settings.vpnProxyBypass || '<local>';
  await browserSession.setProxy({
    mode: 'fixed_servers',
    proxyRules,
    proxyBypassRules
  });

  return { enabled: true, proxyRules, proxyBypassRules };
}

async function applyProxyToBrowserSessions(settings) {
  const results = [];

  for (const partition of browserPartitions) {
    const browserSession = session.fromPartition(partition);
    const result = await applyProxyToSession(browserSession, settings);
    results.push({ partition, ...result });
  }

  return results;
}

async function collectBrowserImportData(source) {
  if (source === 'chrome') return collectChromeImportData();
  if (source === 'safari') return collectSafariImportData();
  return { bookmarks: [], history: [] };
}

async function collectChromeImportData() {
  const profiles = getChromeProfilePaths();
  const bookmarks = [];
  const history = [];

  for (const profilePath of profiles) {
    bookmarks.push(...readChromeBookmarks(path.join(profilePath, 'Bookmarks')));
    history.push(...(await readChromiumHistory(path.join(profilePath, 'History'))));
  }

  return {
    bookmarks: dedupeByUrl(bookmarks),
    history: dedupeByUrl(history).slice(0, 1000)
  };
}

async function collectSafariImportData() {
  const safariPath = path.join(app.getPath('home'), 'Library', 'Safari');
  const bookmarks = await readSafariBookmarks(path.join(safariPath, 'Bookmarks.plist'));
  const history = await readSafariHistory(path.join(safariPath, 'History.db'));

  return {
    bookmarks: dedupeByUrl(bookmarks),
    history: dedupeByUrl(history).slice(0, 1000)
  };
}

function getChromeProfilePaths() {
  const basePath = path.join(app.getPath('home'), 'Library', 'Application Support', 'Google', 'Chrome');
  if (!existsSync(basePath)) return [];

  try {
    return readdirSync(basePath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && (entry.name === 'Default' || /^Profile \d+$/.test(entry.name)))
      .map((entry) => path.join(basePath, entry.name))
      .filter((profilePath) => existsSync(path.join(profilePath, 'Bookmarks')) || existsSync(path.join(profilePath, 'History')));
  } catch {
    return [];
  }
}

function readChromeBookmarks(bookmarksPath) {
  if (!existsSync(bookmarksPath)) return [];

  try {
    const parsed = JSON.parse(readFileSync(bookmarksPath, 'utf8'));
    const bookmarks = [];
    collectChromeBookmarkNodes(parsed.roots, bookmarks);
    return bookmarks;
  } catch {
    return [];
  }
}

function collectChromeBookmarkNodes(node, bookmarks) {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'url' && isImportableUrl(node.url)) {
    bookmarks.push({
      title: cleanImportTitle(node.name, node.url),
      url: node.url,
      createdAt: chromeTimestampToIso(node.date_added),
      updatedAt: new Date().toISOString()
    });
    return;
  }

  for (const child of Object.values(node)) {
    if (Array.isArray(child)) {
      for (const item of child) collectChromeBookmarkNodes(item, bookmarks);
    } else if (child && typeof child === 'object') {
      collectChromeBookmarkNodes(child, bookmarks);
    }
  }
}

async function readChromiumHistory(historyPath) {
  if (!existsSync(historyPath)) return [];

  const query = "select url, title, last_visit_time from urls where url like 'http%' order by last_visit_time desc limit 1000";
  const rows = await querySqlite(historyPath, query);

  return rows
    .map(([url, title, visitedAt]) => ({
      title: cleanImportTitle(title, url),
      url,
      visitedAt: chromeTimestampToIso(visitedAt)
    }))
    .filter((entry) => isImportableUrl(entry.url));
}

async function readSafariBookmarks(bookmarksPath) {
  if (!existsSync(bookmarksPath)) return [];

  try {
    const json = await execFileOutput('/usr/bin/plutil', ['-convert', 'json', '-o', '-', bookmarksPath]);
    const parsed = JSON.parse(json);
    const bookmarks = [];
    collectSafariBookmarkNodes(parsed, bookmarks);
    return bookmarks;
  } catch {
    return [];
  }
}

function collectSafariBookmarkNodes(node, bookmarks) {
  if (!node || typeof node !== 'object') return;

  if (node.URLString && isImportableUrl(node.URLString)) {
    bookmarks.push({
      title: cleanImportTitle(node.URIDictionary?.title || node.title, node.URLString),
      url: node.URLString,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  if (Array.isArray(node.Children)) {
    for (const child of node.Children) collectSafariBookmarkNodes(child, bookmarks);
  }
}

async function readSafariHistory(historyPath) {
  if (!existsSync(historyPath)) return [];

  const query = `
    select history_items.url, coalesce(history_visits.title, history_items.url), history_visits.visit_time
    from history_items
    join history_visits on history_items.id = history_visits.history_item
    where history_items.url like 'http%'
    order by history_visits.visit_time desc
    limit 1000
  `;
  const rows = await querySqlite(historyPath, query);

  return rows
    .map(([url, title, visitedAt]) => ({
      title: cleanImportTitle(title, url),
      url,
      visitedAt: safariTimestampToIso(visitedAt)
    }))
    .filter((entry) => isImportableUrl(entry.url));
}

async function importPasswordCsv() {
  const browserWindow = BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(browserWindow, {
    title: 'Import passwords CSV',
    properties: ['openFile'],
    filters: [{ name: 'CSV', extensions: ['csv'] }]
  });

  if (result.canceled || !result.filePaths[0]) {
    return { imported: 0, canceled: true };
  }

  const rows = parseCsv(readFileSync(result.filePaths[0], 'utf8'));
  let imported = 0;

  for (const row of rows) {
    const url = row.url || row.website || row.origin || row.originurl || row.loginurl;
    const password = row.password || row.passwordvalue;
    if (!isImportableUrl(url) || !password) continue;

    passwordStore.save({
      title: row.name || row.title,
      url,
      username: row.username || row.usernamevalue || row.login || row.email || row.user,
      password
    });
    imported += 1;
  }

  return { imported, canceled: false };
}

async function querySqlite(databasePath, query) {
  const sqlitePath = existsSync('/usr/bin/sqlite3') ? '/usr/bin/sqlite3' : 'sqlite3';
  const tempPath = path.join(app.getPath('temp'), `lumen-import-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`);

  try {
    copyFileSync(databasePath, tempPath);
    const stdout = await execFileOutput(sqlitePath, ['-batch', '-noheader', '-separator', '\t', tempPath, query]);
    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split('\t'));
  } catch {
    return [];
  } finally {
    try {
      if (existsSync(tempPath)) unlinkSync(tempPath);
    } catch {
      // Best-effort cleanup for copied browser databases.
    }
  }
}

function execFileOutput(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { maxBuffer: 8 * 1024 * 1024 }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(stdout);
    });
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => normalizeCsvHeader(header));
  return rows.slice(1).map((cells) => {
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = String(cells[index] || '').trim();
    });
    return entry;
  });
}

function normalizeCsvHeader(header) {
  return String(header || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function dedupeByUrl(items) {
  const seen = new Set();
  const deduped = [];

  for (const item of items) {
    if (!item.url || seen.has(item.url)) continue;
    seen.add(item.url);
    deduped.push(item);
  }

  return deduped;
}

function cleanImportTitle(title, url) {
  const trimmed = typeof title === 'string' ? title.trim() : '';
  if (trimmed) return trimmed;

  try {
    return new URL(url).hostname || 'Imported page';
  } catch {
    return 'Imported page';
  }
}

function isImportableUrl(url) {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

function chromeTimestampToIso(value) {
  const microseconds = Number(value);
  if (!Number.isFinite(microseconds) || microseconds <= 0) return new Date().toISOString();
  return new Date(microseconds / 1000 - 11644473600000).toISOString();
}

function safariTimestampToIso(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return new Date().toISOString();
  return new Date((seconds + 978307200) * 1000).toISOString();
}

function setupIpc() {
  ipcMain.handle('settings:get', () => {
    return settingsStore.getPublicSettings();
  });

  ipcMain.handle('browser:info', () => {
    return getBrowserInfo();
  });

  ipcMain.handle('settings:update-adblock', (_event, enabled) => {
    const publicSettings = settingsStore.setAdblockEnabled(enabled);
    for (const blocker of adBlockers.values()) {
      blocker.setEnabled(enabled);
    }
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('settings:update-bookmarks-bar', (_event, visible) => {
    const publicSettings = settingsStore.setBookmarksBarVisible(visible);
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('settings:update-preferences', async (_event, preferences) => {
    const publicSettings = settingsStore.updatePreferences(preferences || {});
    for (const blocker of adBlockers.values()) {
      blocker.setAllowlist(publicSettings.adblockAllowlist);
    }
    await applyProxyToBrowserSessions(publicSettings);
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('settings:reset-preferences', async () => {
    const publicSettings = settingsStore.resetPreferences();
    for (const blocker of adBlockers.values()) {
      blocker.setEnabled(publicSettings.adblockEnabled);
    }
    await applyProxyToBrowserSessions(publicSettings);
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('browser:ensure-partition', (_event, partition) => {
    ensureBrowserSession(partition || BROWSER_PARTITION);
    return true;
  });

  ipcMain.handle('vpn:status', () => {
    return getVpnStatus();
  });

  ipcMain.handle('vpn:open-amnezia', async () => {
    return openAmneziaVpn();
  });

  ipcMain.handle('vpn:open-docs', async () => {
    await shell.openExternal(AMNEZIA_DOCS_URL);
    return true;
  });

  ipcMain.handle('vpn:apply-proxy', async () => {
    return applyProxyToBrowserSessions(settingsStore.getPublicSettings());
  });

  ipcMain.handle('passwords:list', () => {
    return passwordStore.list();
  });

  ipcMain.handle('passwords:save', (_event, payload) => {
    const passwords = passwordStore.save(payload || {});
    broadcast('passwords:changed', passwords);
    return passwords;
  });

  ipcMain.handle('passwords:remove', (_event, id) => {
    const passwords = passwordStore.remove(id);
    broadcast('passwords:changed', passwords);
    return passwords;
  });

  ipcMain.handle('passwords:clear', () => {
    const passwords = passwordStore.clear();
    broadcast('passwords:changed', passwords);
    return passwords;
  });

  ipcMain.handle('passwords:get-secret', (_event, id) => {
    const secret = passwordStore.getSecret(id);
    const passwords = passwordStore.touch(id);
    broadcast('passwords:changed', passwords);
    return secret;
  });

  ipcMain.handle('passwords:copy', (_event, id) => {
    const secret = passwordStore.getSecret(id);
    clipboard.writeText(secret);
    const passwords = passwordStore.touch(id);
    broadcast('passwords:changed', passwords);
    return true;
  });

  ipcMain.handle('passwords:import-csv', async () => {
    const result = await importPasswordCsv();
    broadcast('passwords:changed', passwordStore.list());
    return result;
  });

  ipcMain.handle('browser:import-data', async (_event, source) => {
    const payload = await collectBrowserImportData(source);
    const result = settingsStore.importBrowserData(payload);
    broadcast('settings:changed', result.settings);
    return {
      source,
      bookmarksImported: result.bookmarksImported,
      historyImported: result.historyImported,
      settings: result.settings
    };
  });

  ipcMain.handle('bookmarks:add', (_event, bookmark) => {
    const publicSettings = settingsStore.addBookmark(bookmark || {});
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('bookmarks:remove', (_event, idOrUrl) => {
    const publicSettings = settingsStore.removeBookmark(idOrUrl);
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('bookmarks:clear', () => {
    const publicSettings = settingsStore.clearBookmarks();
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('browser:new-window', () => {
    createWindow();
    return true;
  });

  ipcMain.handle('browser:new-private-window', () => {
    createWindow({ privateMode: true });
    return true;
  });

  ipcMain.handle('window:get-state', (event) => {
    return getWindowState(BrowserWindow.fromWebContents(event.sender));
  });

  ipcMain.handle('window:control', (event, action) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    if (!browserWindow || browserWindow.isDestroyed()) return null;

    switch (action) {
      case 'minimize':
        browserWindow.minimize();
        break;
      case 'toggle-maximize':
        if (browserWindow.isMaximized()) {
          browserWindow.unmaximize();
        } else {
          browserWindow.maximize();
        }
        break;
      case 'close':
        browserWindow.close();
        break;
      default:
        break;
    }

    return getWindowState(browserWindow);
  });

  ipcMain.handle('browser:clear-data', async () => {
    const browserSession = session.fromPartition(BROWSER_PARTITION);
    await browserSession.clearCache();
    await browserSession.clearStorageData({
      storages: ['cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers']
    });
    resetAdblockStats();
    return true;
  });

  ipcMain.handle('browser:clear-cache', async () => {
    const browserSession = session.fromPartition(BROWSER_PARTITION);
    await browserSession.clearCache();
    return {
      clearedAt: new Date().toISOString()
    };
  });

  ipcMain.handle('adblock:stats', () => {
    return getAdblockStats();
  });

  ipcMain.handle('adblock:reset', () => {
    resetAdblockStats();
    return getAdblockStats();
  });

  ipcMain.handle('history:add', (_event, entry) => {
    const publicSettings = settingsStore.addHistory(entry || {});
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('history:clear', () => {
    const publicSettings = settingsStore.clearHistory();
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('session:save', (_event, tabs) => {
    const publicSettings = settingsStore.saveSession(tabs || []);
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('closed-tabs:add', (_event, tab) => {
    const publicSettings = settingsStore.addClosedTab(tab || {});
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('closed-tabs:pop', () => {
    const result = settingsStore.popClosedTab();
    broadcast('settings:changed', result.settings);
    return result;
  });

  ipcMain.handle('notes:update', (_event, payload) => {
    const publicSettings = settingsStore.updateNote(payload?.url, payload?.note);
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('profiles:add', (_event, name) => {
    const publicSettings = settingsStore.addProfile(name);
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('downloads:get', () => {
    return getDownloads();
  });

  ipcMain.handle('screenshots:get', () => {
    return settingsStore.getPublicSettings().screenshots;
  });

  ipcMain.handle('screenshots:clear', () => {
    const publicSettings = settingsStore.clearScreenshots();
    broadcast('settings:changed', publicSettings);
    return publicSettings;
  });

  ipcMain.handle('screenshots:open-folder', async () => {
    mkdirSync(getScreenshotDirectory(), { recursive: true });
    return shell.openPath(getScreenshotDirectory());
  });

  ipcMain.handle('path:open', async (_event, filePath) => {
    if (typeof filePath !== 'string' || !filePath.trim()) return 'Missing path';
    return shell.openPath(filePath);
  });

  ipcMain.handle('path:reveal', (_event, filePath) => {
    if (typeof filePath !== 'string' || !filePath.trim()) return false;
    shell.showItemInFolder(filePath);
    return true;
  });
}

function getAdblockStats() {
  return {
    total: adblockStats.total,
    byType: { ...adblockStats.byType }
  };
}

function resetAdblockStats() {
  adblockStats.total = 0;
  adblockStats.byType = {};
  for (const blocker of adBlockers.values()) {
    blocker.resetStats();
  }
  broadcast('adblock:reset', getAdblockStats());
}

function setupWindowOpenRouting() {
  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (isAllowedWebviewUrl(url)) {
        const targetWindow = getWindowForContents(contents);
        targetWindow?.webContents.send('browser:new-tab', url);
      }

      return { action: 'deny' };
    });

    contents.on('context-menu', (_contextEvent, params) => {
      showContextMenu(contents, params);
    });
  });
}

function showContextMenu(contents, params) {
  const settings = settingsStore.getPublicSettings();
  const labels = getContextMenuLabels(settings.language);
  const targetWindow = getWindowForContents(contents);
  const pageUrl = params.pageURL || contents.getURL() || '';
  const selectedText = (params.selectionText || '').trim();
  const template = [];

  if (params.isEditable) {
    template.push(
      { label: labels.undo, role: 'undo', enabled: params.editFlags.canUndo },
      { label: labels.redo, role: 'redo', enabled: params.editFlags.canRedo },
      { type: 'separator' },
      { label: labels.cut, role: 'cut', enabled: params.editFlags.canCut },
      { label: labels.copy, role: 'copy', enabled: params.editFlags.canCopy },
      { label: labels.paste, role: 'paste', enabled: params.editFlags.canPaste },
      { label: labels.selectAll, role: 'selectAll', enabled: params.editFlags.canSelectAll }
    );
  } else if (selectedText) {
    template.push({
      label: labels.selection,
      submenu: [
        { label: labels.copy, role: 'copy' },
        { label: labels.searchSelection, click: () => openUrlInTab(targetWindow, getSearchUrl(settings.searchEngine, selectedText)) }
      ]
    });
  }

  if (params.linkURL) {
    template.push({
      label: labels.link,
      submenu: [
        { label: labels.openLinkNewTab, click: () => openUrlInTab(targetWindow, params.linkURL) },
        { label: labels.copyLink, click: () => clipboard.writeText(params.linkURL) }
      ]
    });
  }

  if (params.srcURL) {
    template.push({
      label: labels.media,
      submenu: [
        { label: labels.openMediaNewTab, click: () => openUrlInTab(targetWindow, params.srcURL) },
        { label: labels.downloadMedia, enabled: isDownloadableUrl(params.srcURL), click: () => contents.downloadURL(params.srcURL) },
        { label: labels.copyMedia, click: () => clipboard.writeText(params.srcURL) }
      ]
    });
  }

  template.push({
    label: labels.page,
    submenu: [
      { label: labels.back, enabled: contents.canGoBack(), click: () => contents.goBack() },
      { label: labels.forward, enabled: contents.canGoForward(), click: () => contents.goForward() },
      { label: labels.reload, click: () => contents.reload() },
      { type: 'separator' },
      { label: labels.copyPageAddress, enabled: Boolean(pageUrl), click: () => clipboard.writeText(pageUrl) },
      { label: labels.splitView, click: () => sendCommandToWindow(targetWindow, 'split-view') },
      { label: labels.translatePage, click: () => sendCommandToWindow(targetWindow, 'translate-page') },
      { label: labels.passwords, click: () => sendCommandToWindow(targetWindow, 'password-manager') },
      { label: labels.readerMode, click: () => sendCommandToWindow(targetWindow, 'reader-mode') },
      { label: labels.screenshot, click: () => captureScreenshot(contents, params) }
    ]
  });

  if (!params.isEditable && !selectedText) {
    template.push({ label: labels.selectAll, role: 'selectAll' });
  }

  if (settings.developerContextMenuEnabled) {
    template.push({
      label: labels.developer,
      submenu: [
        { label: labels.inspect, click: () => contents.inspectElement(params.x, params.y) },
        { label: labels.devtools, click: () => contents.openDevTools({ mode: 'detach' }) }
      ]
    });
  }

  Menu.buildFromTemplate(template).popup({
    window: targetWindow
  });
}

function getContextMenuLabels(language) {
  if (language === 'en') {
    return {
      undo: 'Undo',
      redo: 'Redo',
      cut: 'Cut',
      copy: 'Copy',
      paste: 'Paste',
      selectAll: 'Select all',
      selection: 'Selection',
      searchSelection: 'Search selected text',
      page: 'Page',
      link: 'Link',
      media: 'Media',
      developer: 'Developer',
      back: 'Back',
      forward: 'Forward',
      reload: 'Reload',
      copyPageAddress: 'Copy page address',
      splitView: 'Split view',
      translatePage: 'Translate page',
      passwords: 'Passwords',
      readerMode: 'Reader mode',
      screenshot: 'Take screenshot',
      openLinkNewTab: 'Open link in new tab',
      copyLink: 'Copy link address',
      openMediaNewTab: 'Open media in new tab',
      downloadMedia: 'Download media',
      copyMedia: 'Copy media address',
      inspect: 'Inspect element',
      devtools: 'Open DevTools'
    };
  }

  return {
    undo: 'Отменить',
    redo: 'Повторить',
    cut: 'Вырезать',
    copy: 'Копировать',
    paste: 'Вставить',
    selectAll: 'Выбрать все',
    selection: 'Выделение',
    searchSelection: 'Найти выделенный текст',
    page: 'Страница',
    link: 'Ссылка',
    media: 'Медиа',
    developer: 'Разработчик',
    back: 'Назад',
    forward: 'Вперед',
    reload: 'Перезагрузить',
    copyPageAddress: 'Копировать адрес страницы',
    splitView: 'Разделить экран',
    translatePage: 'Перевести страницу',
    passwords: 'Пароли',
    readerMode: 'Режим чтения',
    screenshot: 'Сделать скриншот',
    openLinkNewTab: 'Открыть ссылку в новой вкладке',
    copyLink: 'Копировать ссылку',
    openMediaNewTab: 'Открыть медиа в новой вкладке',
    downloadMedia: 'Скачать медиа',
    copyMedia: 'Копировать адрес медиа',
    inspect: 'Код элемента',
    devtools: 'Открыть DevTools'
  };
}

function openUrlInTab(targetWindow, url) {
  if (!targetWindow || targetWindow.isDestroyed() || !isAllowedWebviewUrl(url)) return;
  targetWindow.webContents.send('browser:new-tab', url);
}

function sendCommandToWindow(targetWindow, command) {
  if (!targetWindow || targetWindow.isDestroyed()) return;
  targetWindow.webContents.send('menu:command', command);
}

function getSearchUrl(engine, query) {
  const engines = {
    duckduckgo: 'https://duckduckgo.com/?q=',
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    brave: 'https://search.brave.com/search?q=',
    yandex: 'https://yandex.com/search/?text='
  };
  return `${engines[engine] || engines.duckduckgo}${encodeURIComponent(query)}`;
}

function isDownloadableUrl(url) {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

async function captureScreenshot(contents, params = {}) {
  const targetWindow = getWindowForContents(contents);

  try {
    const image = await contents.capturePage();
    if (image.isEmpty()) return;

    const size = image.getSize();
    const directory = getScreenshotDirectory();
    const createdAt = new Date();
    const filename = `lumen-${toFileTimestamp(createdAt)}.png`;
    const filePath = path.join(directory, filename);
    const url = params.pageURL || contents.getURL() || '';
    const title = contents.getTitle() || readableScreenshotTitle(url);

    mkdirSync(directory, { recursive: true });
    writeFileSync(filePath, image.toPNG());

    const screenshot = {
      title,
      url,
      filename,
      path: filePath,
      width: size.width,
      height: size.height,
      createdAt: createdAt.toISOString()
    };
    const publicSettings = settingsStore.addScreenshot(screenshot);
    const savedScreenshot = publicSettings.screenshots[0] || screenshot;

    broadcast('settings:changed', publicSettings);
    targetWindow?.webContents.send('screenshots:created', {
      screenshot: savedScreenshot,
      settings: publicSettings
    });
  } catch {
    targetWindow?.webContents.send('screenshots:error');
  }
}

function readableScreenshotTitle(url) {
  try {
    return new URL(url).hostname || 'Screenshot';
  } catch {
    return 'Screenshot';
  }
}

function toFileTimestamp(date) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function getWindowForContents(contents) {
  const owner = contents.getOwnerBrowserWindow?.();
  if (owner && !owner.isDestroyed()) return owner;

  const focused = BrowserWindow.getFocusedWindow();
  if (focused && !focused.isDestroyed()) return focused;

  return [...windows].find((browserWindow) => !browserWindow.isDestroyed());
}

function sendCommandToFocusedWindow(command) {
  const targetWindow = BrowserWindow.getFocusedWindow() || [...windows].find((item) => !item.isDestroyed());
  if (!targetWindow || targetWindow.isDestroyed()) return;
  targetWindow.webContents.send('menu:command', command);
}

function getWindowState(browserWindow) {
  if (!browserWindow || browserWindow.isDestroyed()) {
    return {
      maximized: false,
      fullscreen: false
    };
  }

  return {
    maximized: browserWindow.isMaximized(),
    fullscreen: browserWindow.isFullScreen()
  };
}

function emitWindowState(browserWindow) {
  if (!browserWindow || browserWindow.isDestroyed()) return;
  browserWindow.webContents.send('window:state', getWindowState(browserWindow));
}

function broadcast(channel, payload) {
  for (const browserWindow of windows) {
    if (!browserWindow.isDestroyed()) {
      browserWindow.webContents.send(channel, payload);
    }
  }
}

function isAllowedWebviewUrl(src) {
  try {
    const parsed = new URL(src);
    return ['http:', 'https:', 'file:', 'about:', 'data:', 'view-source:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

app.whenReady().then(() => {
  settingsStore = new SettingsStore(app);
  passwordStore = new PasswordStore(app);
  setupApplicationMenu();
  setupAdBlocker();
  setupIpc();
  setupWindowOpenRouting();
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
