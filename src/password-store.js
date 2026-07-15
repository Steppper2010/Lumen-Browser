const { safeStorage } = require('electron');
const { randomUUID } = require('crypto');
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { dirname, join } = require('path');

class PasswordStore {
  constructor(app) {
    this.filePath = join(app.getPath('userData'), 'passwords.json');
    this.entries = this.read();
  }

  list() {
    return this.entries.map(toPublicEntry).sort(sortByActivity);
  }

  save(payload) {
    if (!this.isEncryptionAvailable()) {
      throw new Error('Password encryption is unavailable on this system.');
    }

    const identity = normalizeIdentity(payload?.url || payload?.origin);
    if (!identity.origin) {
      throw new Error('A web address is required for this password.');
    }

    const now = new Date().toISOString();
    const requestedId = cleanString(payload?.id);
    const username = cleanString(payload?.username);
    const existing = requestedId
      ? this.entries.find((entry) => entry.id === requestedId)
      : this.entries.find((entry) => entry.origin === identity.origin && entry.username === username);
    const password = typeof payload?.password === 'string' ? payload.password : '';

    if (!password && !existing) {
      throw new Error('Password is required.');
    }

    const nextEntry = {
      id: existing?.id || randomUUID(),
      title: cleanString(payload?.title) || identity.hostname,
      origin: identity.origin,
      hostname: identity.hostname,
      username,
      encryptedSecret: password ? this.encrypt(password) : existing.encryptedSecret,
      encryption: 'safeStorage',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      lastUsedAt: existing?.lastUsedAt || ''
    };

    if (existing) {
      this.entries = this.entries.map((entry) => (entry.id === existing.id ? nextEntry : entry));
    } else {
      this.entries.unshift(nextEntry);
    }

    this.write();
    return this.list();
  }

  remove(id) {
    this.entries = this.entries.filter((entry) => entry.id !== cleanString(id));
    this.write();
    return this.list();
  }

  clear() {
    this.entries = [];
    this.write();
    return this.list();
  }

  getSecret(id) {
    const entry = this.entries.find((item) => item.id === cleanString(id));
    if (!entry) {
      throw new Error('Password entry was not found.');
    }

    return this.decrypt(entry);
  }

  touch(id) {
    const entry = this.entries.find((item) => item.id === cleanString(id));
    if (!entry) return this.list();

    entry.lastUsedAt = new Date().toISOString();
    this.write();
    return this.list();
  }

  isEncryptionAvailable() {
    return typeof safeStorage?.isEncryptionAvailable === 'function' && safeStorage.isEncryptionAvailable();
  }

  encrypt(secret) {
    return safeStorage.encryptString(secret).toString('base64');
  }

  decrypt(entry) {
    if (entry.encryption !== 'safeStorage') {
      throw new Error('Unsupported password encryption.');
    }

    return safeStorage.decryptString(Buffer.from(entry.encryptedSecret, 'base64'));
  }

  read() {
    if (!existsSync(this.filePath)) return [];

    try {
      const parsed = JSON.parse(readFileSync(this.filePath, 'utf8'));
      const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
      return entries.map(normalizeEntry).filter((entry) => entry.id && entry.origin && entry.encryptedSecret);
    } catch {
      return [];
    }
  }

  write() {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, `${JSON.stringify({ version: 1, entries: this.entries }, null, 2)}\n`);
  }
}

function normalizeEntry(entry) {
  const identity = normalizeIdentity(entry?.origin);

  return {
    id: cleanString(entry?.id),
    title: cleanString(entry?.title) || identity.hostname,
    origin: identity.origin,
    hostname: identity.hostname,
    username: cleanString(entry?.username),
    encryptedSecret: cleanString(entry?.encryptedSecret),
    encryption: cleanString(entry?.encryption) || 'safeStorage',
    createdAt: cleanString(entry?.createdAt),
    updatedAt: cleanString(entry?.updatedAt),
    lastUsedAt: cleanString(entry?.lastUsedAt)
  };
}

function toPublicEntry(entry) {
  return {
    id: entry.id,
    title: entry.title,
    origin: entry.origin,
    hostname: entry.hostname,
    username: entry.username,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    lastUsedAt: entry.lastUsedAt
  };
}

function sortByActivity(left, right) {
  const leftTime = Date.parse(left.lastUsedAt || left.updatedAt || left.createdAt || '') || 0;
  const rightTime = Date.parse(right.lastUsedAt || right.updatedAt || right.createdAt || '') || 0;
  return rightTime - leftTime;
}

function normalizeIdentity(value) {
  const raw = cleanString(value);
  if (!raw) return { origin: '', hostname: '' };

  try {
    const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
      return { origin: '', hostname: '' };
    }

    return {
      origin: parsed.origin,
      hostname: parsed.hostname.replace(/^www\./, '')
    };
  } catch {
    return { origin: '', hostname: '' };
  }
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

module.exports = {
  PasswordStore
};
