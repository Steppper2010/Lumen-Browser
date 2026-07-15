const { EventEmitter } = require('events');

const BLOCKED_HOST_PARTS = [
  'doubleclick.net',
  'googlesyndication.com',
  'googletagservices.com',
  'googleadservices.com',
  'adservice.google.',
  'amazon-adsystem.com',
  'adsystem.com',
  'adnxs.com',
  'rubiconproject.com',
  'pubmatic.com',
  'openx.net',
  'criteo.com',
  'taboola.com',
  'outbrain.com',
  'scorecardresearch.com',
  'quantserve.com',
  'moatads.com',
  'hotjar.com',
  'mathtag.com',
  'analytics.yahoo.com',
  'facebook.com/tr',
  'connect.facebook.net/en_us/fbevents'
];

const BLOCKED_PATH_PATTERNS = [
  /\/pagead\//i,
  /\/adsystem\//i,
  /\/adserver\//i,
  /\/adservice\//i,
  /\/ad-delivery\//i,
  /\/advertising\//i,
  /\/banners?\//i,
  /\/sponsor(ed)?\//i,
  /\/tracking\//i,
  /\/trackers?\//i,
  /\/analytics\//i,
  /\/pixel\//i,
  /[?&](ad_id|adset_id|fbclid|gclid)=/i
];

function createAdBlocker(browserSession, initialEnabled = true) {
  const emitter = new EventEmitter();
  const stats = {
    total: 0,
    byType: {}
  };

  let enabled = Boolean(initialEnabled);
  let allowlist = [];

  browserSession.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (details, callback) => {
    if (!enabled) {
      callback({ cancel: false });
      return;
    }

    if (isAllowedByHost(details.url, allowlist)) {
      callback({ cancel: false });
      return;
    }

    const match = shouldBlock(details.url);

    if (!match) {
      callback({ cancel: false });
      return;
    }

    stats.total += 1;
    stats.byType[details.resourceType] = (stats.byType[details.resourceType] || 0) + 1;

    emitter.emit('blocked', {
      url: details.url,
      reason: match.reason,
      resourceType: details.resourceType,
      total: stats.total,
      byType: { ...stats.byType }
    });

    callback({ cancel: true });
  });

  return {
    enable() {
      enabled = true;
    },
    disable() {
      enabled = false;
    },
    isEnabled() {
      return enabled;
    },
    setEnabled(nextEnabled) {
      enabled = Boolean(nextEnabled);
    },
    setAllowlist(nextAllowlist) {
      allowlist = Array.isArray(nextAllowlist) ? nextAllowlist.map(cleanHost).filter(Boolean) : [];
    },
    getStats() {
      return {
        total: stats.total,
        byType: { ...stats.byType }
      };
    },
    resetStats() {
      stats.total = 0;
      stats.byType = {};
      emitter.emit('reset', this.getStats());
    },
    on(eventName, listener) {
      emitter.on(eventName, listener);
    }
  };
}

function isAllowedByHost(rawUrl, allowlist) {
  if (allowlist.length === 0) return false;

  let hostname;

  try {
    hostname = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return false;
  }

  return allowlist.some((allowedHost) => {
    return hostname === allowedHost || hostname.endsWith(`.${allowedHost}`);
  });
}

function cleanHost(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/^www\./, '');
}

function shouldBlock(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  const normalized = `${parsed.hostname}${parsed.pathname}`.toLowerCase();

  for (const hostPart of BLOCKED_HOST_PARTS) {
    if (normalized.includes(hostPart)) {
      return {
        reason: hostPart
      };
    }
  }

  const pathAndSearch = `${parsed.pathname}${parsed.search}`;

  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(pathAndSearch)) {
      return {
        reason: pattern.source
      };
    }
  }

  return null;
}

module.exports = {
  createAdBlocker,
  isAllowedByHost,
  shouldBlock
};
