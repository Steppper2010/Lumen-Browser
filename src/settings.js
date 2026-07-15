const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { dirname, join } = require('path');
const { randomUUID } = require('crypto');

const DEFAULT_SETTINGS = {
  adblockEnabled: true,
  adblockAllowlist: [],
  activeProfile: 'personal',
  bookmarksBarVisible: true,
  compactTabs: false,
  developerContextMenuEnabled: true,
  defaultZoomFactor: 1,
  homePageUrl: '',
  language: 'ru',
  motionEnabled: true,
  openNewTabsInBackground: false,
  openTabsNextToCurrent: true,
  privacyShieldEnabled: true,
  fingerprintProtectionEnabled: true,
  stripTrackingParamsEnabled: true,
  searchEngine: 'duckduckgo',
  securityIndicatorVisible: true,
  screenshotsPanelOnCapture: true,
  startPageBackdrop: 'signal-grid',
  theme: 'pure-black',
  translationTargetLanguage: 'ru',
  vpnProxyBypass: '<local>',
  vpnProxyEnabled: false,
  vpnProxyHost: '127.0.0.1',
  vpnProxyPort: '',
  vpnProxyScheme: 'socks5',
  bookmarks: [],
  closedTabs: [],
  history: [],
  notes: {},
  profiles: ['personal', 'work'],
  savedSession: [],
  screenshots: []
};

class SettingsStore {
  constructor(app) {
    this.filePath = join(app.getPath('userData'), 'settings.json');
    this.settings = this.read();
  }

  getPublicSettings() {
    return {
      adblockEnabled: this.settings.adblockEnabled,
      adblockAllowlist: [...this.settings.adblockAllowlist],
      activeProfile: this.settings.activeProfile,
      bookmarksBarVisible: this.settings.bookmarksBarVisible,
      compactTabs: this.settings.compactTabs,
      developerContextMenuEnabled: this.settings.developerContextMenuEnabled,
      defaultZoomFactor: this.settings.defaultZoomFactor,
      homePageUrl: this.settings.homePageUrl,
      language: this.settings.language,
      motionEnabled: this.settings.motionEnabled,
      openNewTabsInBackground: this.settings.openNewTabsInBackground,
      openTabsNextToCurrent: this.settings.openTabsNextToCurrent,
      privacyShieldEnabled: this.settings.privacyShieldEnabled,
      fingerprintProtectionEnabled: this.settings.fingerprintProtectionEnabled,
      stripTrackingParamsEnabled: this.settings.stripTrackingParamsEnabled,
      searchEngine: this.settings.searchEngine,
      securityIndicatorVisible: this.settings.securityIndicatorVisible,
      screenshotsPanelOnCapture: this.settings.screenshotsPanelOnCapture,
      startPageBackdrop: this.settings.startPageBackdrop,
      theme: this.settings.theme,
      translationTargetLanguage: this.settings.translationTargetLanguage,
      vpnProxyBypass: this.settings.vpnProxyBypass,
      vpnProxyEnabled: this.settings.vpnProxyEnabled,
      vpnProxyHost: this.settings.vpnProxyHost,
      vpnProxyPort: this.settings.vpnProxyPort,
      vpnProxyScheme: this.settings.vpnProxyScheme,
      bookmarks: [...this.settings.bookmarks],
      closedTabs: [...this.settings.closedTabs],
      history: [...this.settings.history],
      notes: { ...this.settings.notes },
      profiles: [...this.settings.profiles],
      savedSession: [...this.settings.savedSession],
      screenshots: [...this.settings.screenshots]
    };
  }

  getAdblockEnabled() {
    return this.settings.adblockEnabled;
  }

  setAdblockEnabled(enabled) {
    this.settings.adblockEnabled = Boolean(enabled);
    this.write();
    return this.getPublicSettings();
  }

  setBookmarksBarVisible(visible) {
    this.settings.bookmarksBarVisible = Boolean(visible);
    this.write();
    return this.getPublicSettings();
  }

  updatePreferences(preferences) {
    if (typeof preferences?.compactTabs === 'boolean') {
      this.settings.compactTabs = preferences.compactTabs;
    }

    if (Array.isArray(preferences?.adblockAllowlist)) {
      this.settings.adblockAllowlist = preferences.adblockAllowlist.map(cleanHost).filter(Boolean);
    }

    if (typeof preferences?.activeProfile === 'string') {
      this.settings.activeProfile = normalizeProfile(preferences.activeProfile, this.settings.profiles);
    }

    if (typeof preferences?.developerContextMenuEnabled === 'boolean') {
      this.settings.developerContextMenuEnabled = preferences.developerContextMenuEnabled;
    }

    if (typeof preferences?.defaultZoomFactor === 'number') {
      this.settings.defaultZoomFactor = normalizeZoomFactor(preferences.defaultZoomFactor);
    }

    if (typeof preferences?.homePageUrl === 'string') {
      this.settings.homePageUrl = cleanString(preferences.homePageUrl);
    }

    if (typeof preferences?.language === 'string') {
      this.settings.language = normalizeLanguage(preferences.language);
    }

    if (typeof preferences?.motionEnabled === 'boolean') {
      this.settings.motionEnabled = preferences.motionEnabled;
    }

    if (typeof preferences?.openNewTabsInBackground === 'boolean') {
      this.settings.openNewTabsInBackground = preferences.openNewTabsInBackground;
    }

    if (typeof preferences?.openTabsNextToCurrent === 'boolean') {
      this.settings.openTabsNextToCurrent = preferences.openTabsNextToCurrent;
    }

    if (typeof preferences?.privacyShieldEnabled === 'boolean') {
      this.settings.privacyShieldEnabled = preferences.privacyShieldEnabled;
    }

    if (typeof preferences?.fingerprintProtectionEnabled === 'boolean') {
      this.settings.fingerprintProtectionEnabled = preferences.fingerprintProtectionEnabled;
    }

    if (typeof preferences?.stripTrackingParamsEnabled === 'boolean') {
      this.settings.stripTrackingParamsEnabled = preferences.stripTrackingParamsEnabled;
    }

    if (typeof preferences?.securityIndicatorVisible === 'boolean') {
      this.settings.securityIndicatorVisible = preferences.securityIndicatorVisible;
    }

    if (typeof preferences?.searchEngine === 'string') {
      this.settings.searchEngine = normalizeSearchEngine(preferences.searchEngine);
    }

    if (typeof preferences?.screenshotsPanelOnCapture === 'boolean') {
      this.settings.screenshotsPanelOnCapture = preferences.screenshotsPanelOnCapture;
    }

    if (typeof preferences?.startPageBackdrop === 'string') {
      this.settings.startPageBackdrop = normalizeStartPageBackdrop(preferences.startPageBackdrop);
    }

    if (typeof preferences?.theme === 'string') {
      this.settings.theme = normalizeTheme(preferences.theme);
    }

    if (typeof preferences?.translationTargetLanguage === 'string') {
      this.settings.translationTargetLanguage = normalizeTranslationTarget(preferences.translationTargetLanguage);
    }

    if (typeof preferences?.vpnProxyBypass === 'string') {
      this.settings.vpnProxyBypass = cleanString(preferences.vpnProxyBypass) || DEFAULT_SETTINGS.vpnProxyBypass;
    }

    if (typeof preferences?.vpnProxyEnabled === 'boolean') {
      this.settings.vpnProxyEnabled = preferences.vpnProxyEnabled;
    }

    if (typeof preferences?.vpnProxyHost === 'string') {
      this.settings.vpnProxyHost = cleanString(preferences.vpnProxyHost) || DEFAULT_SETTINGS.vpnProxyHost;
    }

    if (typeof preferences?.vpnProxyPort === 'string' || typeof preferences?.vpnProxyPort === 'number') {
      this.settings.vpnProxyPort = normalizeProxyPort(preferences.vpnProxyPort);
    }

    if (typeof preferences?.vpnProxyScheme === 'string') {
      this.settings.vpnProxyScheme = normalizeProxyScheme(preferences.vpnProxyScheme);
    }

    this.write();
    return this.getPublicSettings();
  }

  resetPreferences() {
    const { bookmarks, closedTabs, history, notes, profiles, savedSession, screenshots } = this.settings;
    this.settings = {
      ...structuredClone(DEFAULT_SETTINGS),
      bookmarks,
      closedTabs,
      history,
      notes,
      profiles,
      savedSession,
      screenshots
    };
    this.write();
    return this.getPublicSettings();
  }

  addBookmark(bookmark) {
    const normalized = normalizeBookmark(bookmark);
    const existing = this.settings.bookmarks.find((item) => item.url === normalized.url);

    if (existing) {
      existing.title = normalized.title || existing.title;
      existing.updatedAt = new Date().toISOString();
      this.write();
      return this.getPublicSettings();
    }

    this.settings.bookmarks.unshift(normalized);
    this.write();
    return this.getPublicSettings();
  }

  removeBookmark(idOrUrl) {
    this.settings.bookmarks = this.settings.bookmarks.filter((bookmark) => {
      return bookmark.id !== idOrUrl && bookmark.url !== idOrUrl;
    });
    this.write();
    return this.getPublicSettings();
  }

  clearBookmarks() {
    this.settings.bookmarks = [];
    this.write();
    return this.getPublicSettings();
  }

  addHistory(entry) {
    const normalized = normalizeHistoryEntry(entry);
    if (!normalized.url) return this.getPublicSettings();

    this.settings.history = [
      normalized,
      ...this.settings.history.filter((item) => item.url !== normalized.url)
    ].slice(0, 1000);
    this.write();
    return this.getPublicSettings();
  }

  clearHistory() {
    this.settings.history = [];
    this.write();
    return this.getPublicSettings();
  }

  saveSession(tabs) {
    this.settings.savedSession = Array.isArray(tabs) ? tabs.map(normalizeSessionTab).filter((tab) => tab.url) : [];
    this.write();
    return this.getPublicSettings();
  }

  addClosedTab(tab) {
    const normalized = normalizeSessionTab(tab);
    if (!normalized.url) return this.getPublicSettings();

    this.settings.closedTabs = [normalized, ...this.settings.closedTabs].slice(0, 25);
    this.write();
    return this.getPublicSettings();
  }

  popClosedTab() {
    const [tab] = this.settings.closedTabs.splice(0, 1);
    this.write();
    return {
      tab: tab || null,
      settings: this.getPublicSettings()
    };
  }

  updateNote(url, note) {
    const cleanUrl = cleanString(url);
    if (!cleanUrl) return this.getPublicSettings();

    const cleanNote = typeof note === 'string' ? note : '';

    if (cleanNote.trim()) {
      this.settings.notes[cleanUrl] = {
        url: cleanUrl,
        note: cleanNote,
        updatedAt: new Date().toISOString()
      };
    } else {
      delete this.settings.notes[cleanUrl];
    }

    this.write();
    return this.getPublicSettings();
  }

  addProfile(name) {
    const profile = normalizeProfileName(name);
    if (!profile) return this.getPublicSettings();

    if (!this.settings.profiles.includes(profile)) {
      this.settings.profiles.push(profile);
    }

    this.settings.activeProfile = profile;
    this.write();
    return this.getPublicSettings();
  }

  addScreenshot(screenshot) {
    const normalized = normalizeScreenshot(screenshot);
    if (!normalized.path) return this.getPublicSettings();

    this.settings.screenshots = [normalized, ...this.settings.screenshots].slice(0, 200);
    this.write();
    return this.getPublicSettings();
  }

  clearScreenshots() {
    this.settings.screenshots = [];
    this.write();
    return this.getPublicSettings();
  }

  importBrowserData(payload = {}) {
    const incomingBookmarks = Array.isArray(payload.bookmarks) ? payload.bookmarks.map(normalizeBookmark).filter((item) => item.url) : [];
    const incomingHistory = Array.isArray(payload.history)
      ? payload.history.map(normalizeHistoryEntry).filter((item) => item.url)
      : [];
    const bookmarkUrls = new Set(this.settings.bookmarks.map((bookmark) => bookmark.url));
    const historyUrls = new Set(this.settings.history.map((entry) => entry.url));
    let bookmarksImported = 0;
    let historyImported = 0;

    for (const bookmark of incomingBookmarks) {
      if (bookmarkUrls.has(bookmark.url)) continue;
      bookmarkUrls.add(bookmark.url);
      this.settings.bookmarks.push(bookmark);
      bookmarksImported += 1;
    }

    for (const entry of incomingHistory) {
      if (historyUrls.has(entry.url)) continue;
      historyUrls.add(entry.url);
      this.settings.history.push(entry);
      historyImported += 1;
    }

    this.settings.history = this.settings.history
      .sort((left, right) => Date.parse(right.visitedAt || '') - Date.parse(left.visitedAt || ''))
      .slice(0, 1000);

    this.write();
    return {
      bookmarksImported,
      historyImported,
      settings: this.getPublicSettings()
    };
  }

  read() {
    if (!existsSync(this.filePath)) {
      return structuredClone(DEFAULT_SETTINGS);
    }

    try {
      const parsed = JSON.parse(readFileSync(this.filePath, 'utf8'));
      return mergeDefaults(parsed);
    } catch {
      return structuredClone(DEFAULT_SETTINGS);
    }
  }

  write() {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, `${JSON.stringify(this.settings, null, 2)}\n`);
  }
}

function mergeDefaults(settings) {
  const profiles = normalizeProfiles(settings.profiles);

  return {
    adblockEnabled: settings.adblockEnabled !== false,
    adblockAllowlist: Array.isArray(settings.adblockAllowlist)
      ? settings.adblockAllowlist.map(cleanHost).filter(Boolean)
      : [],
    activeProfile: normalizeProfile(settings.activeProfile, profiles),
    bookmarksBarVisible: settings.bookmarksBarVisible !== false,
    compactTabs: settings.compactTabs === true,
    developerContextMenuEnabled: settings.developerContextMenuEnabled !== false,
    defaultZoomFactor: normalizeZoomFactor(settings.defaultZoomFactor),
    homePageUrl: cleanString(settings.homePageUrl),
    language: normalizeLanguage(settings.language),
    motionEnabled: settings.motionEnabled !== false,
    openNewTabsInBackground: settings.openNewTabsInBackground === true,
    openTabsNextToCurrent: settings.openTabsNextToCurrent !== false,
    privacyShieldEnabled: settings.privacyShieldEnabled !== false,
    fingerprintProtectionEnabled: settings.fingerprintProtectionEnabled !== false,
    stripTrackingParamsEnabled: settings.stripTrackingParamsEnabled !== false,
    searchEngine: normalizeSearchEngine(settings.searchEngine),
    securityIndicatorVisible: settings.securityIndicatorVisible !== false,
    screenshotsPanelOnCapture: settings.screenshotsPanelOnCapture !== false,
    startPageBackdrop: normalizeStartPageBackdrop(settings.startPageBackdrop),
    theme: normalizeTheme(settings.theme),
    translationTargetLanguage: normalizeTranslationTarget(settings.translationTargetLanguage),
    vpnProxyBypass: cleanString(settings.vpnProxyBypass) || DEFAULT_SETTINGS.vpnProxyBypass,
    vpnProxyEnabled: settings.vpnProxyEnabled === true,
    vpnProxyHost: cleanString(settings.vpnProxyHost) || DEFAULT_SETTINGS.vpnProxyHost,
    vpnProxyPort: normalizeProxyPort(settings.vpnProxyPort),
    vpnProxyScheme: normalizeProxyScheme(settings.vpnProxyScheme),
    bookmarks: Array.isArray(settings.bookmarks)
      ? settings.bookmarks.map(normalizeBookmark).filter((bookmark) => bookmark.url)
      : [],
    closedTabs: Array.isArray(settings.closedTabs)
      ? settings.closedTabs.map(normalizeSessionTab).filter((tab) => tab.url).slice(0, 25)
      : [],
    history: Array.isArray(settings.history)
      ? settings.history.map(normalizeHistoryEntry).filter((entry) => entry.url).slice(0, 1000)
      : [],
    notes: normalizeNotes(settings.notes),
    profiles,
    savedSession: Array.isArray(settings.savedSession)
      ? settings.savedSession.map(normalizeSessionTab).filter((tab) => tab.url)
      : [],
    screenshots: Array.isArray(settings.screenshots)
      ? settings.screenshots.map(normalizeScreenshot).filter((screenshot) => screenshot.path).slice(0, 200)
      : []
  };
}

function normalizeBookmark(bookmark) {
  const now = new Date().toISOString();
  const url = cleanString(bookmark?.url);
  const title = cleanString(bookmark?.title) || readableBookmarkTitle(url);

  return {
    id: cleanString(bookmark?.id) || createId(),
    title,
    url,
    createdAt: cleanString(bookmark?.createdAt) || now,
    updatedAt: cleanString(bookmark?.updatedAt) || now
  };
}

function readableBookmarkTitle(url) {
  try {
    return new URL(url).hostname || 'Bookmark';
  } catch {
    return 'Bookmark';
  }
}

function cleanString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function cleanHost(value) {
  const trimmed = cleanString(value).toLowerCase();
  if (!trimmed) return '';

  try {
    return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname.replace(/^www\./, '');
  } catch {
    return trimmed.replace(/^www\./, '').replace(/[^\w.-]/g, '');
  }
}

function normalizeSearchEngine(value) {
  const normalized = cleanString(value).toLowerCase();
  if (['duckduckgo', 'google', 'bing', 'brave', 'yandex'].includes(normalized)) {
    return normalized;
  }

  return DEFAULT_SETTINGS.searchEngine;
}

function normalizeLanguage(value) {
  const normalized = cleanString(value).toLowerCase();
  return ['ru', 'en'].includes(normalized) ? normalized : DEFAULT_SETTINGS.language;
}

function normalizeTranslationTarget(value) {
  const normalized = cleanString(value).toLowerCase();
  return ['ru', 'en', 'de', 'fr', 'es', 'it', 'pt', 'tr', 'zh-cn', 'ja', 'ko'].includes(normalized)
    ? normalized
    : DEFAULT_SETTINGS.translationTargetLanguage;
}

function normalizeTheme(value) {
  const normalized = cleanString(value).toLowerCase();
  const allowed = [
    'pure-black',
    'graphite',
    'terminal',
    'paper-white',
    'midnight',
    'cyber-matrix',
    'frost',
    'solar',
    'violet-noir',
    'ember'
  ];
  return allowed.includes(normalized) ? normalized : DEFAULT_SETTINGS.theme;
}

function normalizeStartPageBackdrop(value) {
  const normalized = cleanString(value).toLowerCase();
  const allowed = ['signal-grid', 'orbital', 'digital-rain', 'waveform', 'starfield', 'radar', 'quiet'];
  return allowed.includes(normalized) ? normalized : DEFAULT_SETTINGS.startPageBackdrop;
}

function normalizeProxyScheme(value) {
  const normalized = cleanString(value).toLowerCase();
  return ['socks5', 'socks4', 'http', 'https'].includes(normalized) ? normalized : DEFAULT_SETTINGS.vpnProxyScheme;
}

function normalizeProxyPort(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 && number <= 65535 ? String(number) : DEFAULT_SETTINGS.vpnProxyPort;
}

function normalizeZoomFactor(value) {
  const number = Number(value);
  const allowed = [0.8, 0.9, 1, 1.1, 1.25, 1.5];
  return allowed.includes(number) ? number : DEFAULT_SETTINGS.defaultZoomFactor;
}

function normalizeHistoryEntry(entry) {
  const now = new Date().toISOString();
  return {
    id: cleanString(entry?.id) || createId(),
    title: cleanString(entry?.title) || readableBookmarkTitle(entry?.url),
    url: cleanString(entry?.url),
    profile: normalizeProfileName(entry?.profile) || DEFAULT_SETTINGS.activeProfile,
    visitedAt: cleanString(entry?.visitedAt) || now
  };
}

function normalizeSessionTab(tab) {
  return {
    id: cleanString(tab?.id) || createId(),
    title: cleanString(tab?.title) || readableBookmarkTitle(tab?.url),
    url: cleanString(tab?.url),
    profile: normalizeProfileName(tab?.profile) || DEFAULT_SETTINGS.activeProfile,
    active: tab?.active === true,
    savedAt: cleanString(tab?.savedAt) || new Date().toISOString()
  };
}

function normalizeNotes(notes) {
  if (!notes || typeof notes !== 'object') return {};

  const normalized = {};

  for (const [url, value] of Object.entries(notes)) {
    const cleanUrl = cleanString(value?.url || url);
    const note = typeof value?.note === 'string' ? value.note : '';

    if (cleanUrl && note.trim()) {
      normalized[cleanUrl] = {
        url: cleanUrl,
        note,
        updatedAt: cleanString(value?.updatedAt) || new Date().toISOString()
      };
    }
  }

  return normalized;
}

function normalizeScreenshot(screenshot) {
  const now = new Date().toISOString();
  return {
    id: cleanString(screenshot?.id) || createId(),
    title: cleanString(screenshot?.title) || 'Screenshot',
    url: cleanString(screenshot?.url),
    filename: cleanString(screenshot?.filename) || readableBookmarkTitle(screenshot?.path),
    path: cleanString(screenshot?.path),
    width: Number(screenshot?.width) || 0,
    height: Number(screenshot?.height) || 0,
    createdAt: cleanString(screenshot?.createdAt) || now
  };
}

function normalizeProfiles(profiles) {
  const normalized = Array.isArray(profiles)
    ? profiles.map(normalizeProfileName).filter(Boolean)
    : DEFAULT_SETTINGS.profiles;

  return [...new Set(normalized.length ? normalized : DEFAULT_SETTINGS.profiles)];
}

function normalizeProfile(value, profiles) {
  const profile = normalizeProfileName(value);
  return profiles.includes(profile) ? profile : profiles[0] || DEFAULT_SETTINGS.activeProfile;
}

function normalizeProfileName(value) {
  return cleanString(value).toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function createId() {
  return randomUUID();
}

module.exports = {
  SettingsStore
};
