// =============================================================================
// Secret-Bubble Zero-Knowledge LocalStorage Encryption Vault
// Military-Grade AES-256 Cryptographic Storage Shield
// =============================================================================

import CryptoJS from 'crypto-js';

const VAULT_PREFIX = 'SB_VAULT:v1:';
const SEED_STORAGE_KEY = '_sb_vault_seed';

// Capture native storage primitives before any monkey patching
const originalGetItem = typeof window !== 'undefined' && window.Storage ? window.Storage.prototype.getItem : null;
const originalSetItem = typeof window !== 'undefined' && window.Storage ? window.Storage.prototype.setItem : null;
const originalRemoveItem = typeof window !== 'undefined' && window.Storage ? window.Storage.prototype.removeItem : null;
const originalClear = typeof window !== 'undefined' && window.Storage ? window.Storage.prototype.clear : null;

let cachedVaultKey = null;

/**
 * Returns or generates a deterministic, device-bound 256-bit AES vault key
 */
function getVaultKey() {
  if (cachedVaultKey) return cachedVaultKey;

  try {
    let seed = null;
    if (typeof window !== 'undefined' && window.localStorage && originalGetItem) {
      seed = originalGetItem.call(window.localStorage, SEED_STORAGE_KEY);
      if (!seed || seed.length < 32) {
        if (window.crypto && window.crypto.getRandomValues) {
          const randBytes = new Uint8Array(32);
          window.crypto.getRandomValues(randBytes);
          seed = Array.from(randBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        } else {
          seed = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);
        }
        if (originalSetItem) {
          originalSetItem.call(window.localStorage, SEED_STORAGE_KEY, seed);
        }
      }
    }

    const entropy = [
      seed || 'sb-default-device-vault-entropy-seed',
      typeof navigator !== 'undefined' ? (navigator.userAgent || '') : 'node-env',
      typeof navigator !== 'undefined' ? (navigator.language || '') : '',
      'SecretBubble::AES-256::Vault::ZeroTrace::2026'
    ].join('::');

    cachedVaultKey = CryptoJS.SHA256(entropy).toString();
    return cachedVaultKey;
  } catch (err) {
    cachedVaultKey = CryptoJS.SHA256('SecretBubble::FallbackMasterVaultKey::2026').toString();
    return cachedVaultKey;
  }
}

/**
 * Determines whether a localStorage key should be encrypted.
 * Covers all chat history, messages, users, contacts, settings, unread counts, and PINs.
 */
export function shouldEncryptKey(key) {
  if (!key || typeof key !== 'string') return false;
  if (key === SEED_STORAGE_KEY || key === '_sb_vault_init') return false;

  return (
    key.startsWith('secure_chat_') ||
    key.startsWith('secret_bubble_') ||
    key.startsWith('e2ee_') ||
    key.includes('message') ||
    key.includes('chat') ||
    key.includes('contact') ||
    key.includes('user') ||
    key.includes('unread') ||
    key.includes('token') ||
    key.includes('pin')
  );
}

/**
 * Encrypts a string into AES-256 ciphertext with VAULT_PREFIX header
 */
export function encryptVaultValue(plainValue) {
  if (plainValue === null || plainValue === undefined) return plainValue;
  const str = typeof plainValue === 'string' ? plainValue : JSON.stringify(plainValue);
  if (str.startsWith(VAULT_PREFIX)) return str;

  try {
    const key = getVaultKey();
    const ciphertext = CryptoJS.AES.encrypt(str, key).toString();
    return `${VAULT_PREFIX}${ciphertext}`;
  } catch (err) {
    return str;
  }
}

/**
 * Decrypts an AES-256 ciphertext value starting with VAULT_PREFIX
 */
export function decryptVaultValue(cipherValue) {
  if (typeof cipherValue !== 'string' || !cipherValue.startsWith(VAULT_PREFIX)) {
    return cipherValue; // Not encrypted with vault header, return raw
  }

  try {
    const key = getVaultKey();
    const rawCipher = cipherValue.substring(VAULT_PREFIX.length);
    const decryptedBytes = CryptoJS.AES.decrypt(rawCipher, key);
    const plainText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    if (!plainText && rawCipher.length > 0) {
      return null;
    }
    return plainText;
  } catch (err) {
    return null;
  }
}

/**
 * Migrates all existing unencrypted localStorage items to encrypted format immediately
 */
export function migrateExistingStorageToVault() {
  if (typeof window === 'undefined' || !window.localStorage || !originalGetItem || !originalSetItem) return;

  try {
    let migratedCount = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && shouldEncryptKey(k)) {
        const raw = originalGetItem.call(window.localStorage, k);
        if (raw && typeof raw === 'string' && !raw.startsWith(VAULT_PREFIX)) {
          const encrypted = encryptVaultValue(raw);
          originalSetItem.call(window.localStorage, k, encrypted);
          migratedCount++;
        }
      }
    }

    if (migratedCount > 0) {
      console.log(`[SecureStorage] 🛡️ Successfully encrypted ${migratedCount} localStorage items with AES-256.`);
    }
  } catch (err) {}
}

/**
 * Hooks window.Storage.prototype to transparently encrypt all writes and decrypt all reads.
 * Ensures anyone inspecting localStorage in DevTools only sees ciphertext!
 */
export function installSecureStorageShield() {
  if (typeof window === 'undefined' || !window.Storage || !originalSetItem || !originalGetItem) return;
  if (window.__SB_SECURE_STORAGE_SHIELD_INSTALLED__) return;
  window.__SB_SECURE_STORAGE_SHIELD_INSTALLED__ = true;

  // 1. One-time startup migration of existing plain text
  migrateExistingStorageToVault();

  // 2. Intercept setItem: Encrypt target keys transparently
  window.Storage.prototype.setItem = function (key, value) {
    if (this === window.localStorage && shouldEncryptKey(key)) {
      try {
        const strVal = value === null || value === undefined ? '' : String(value);
        if (strVal.startsWith(VAULT_PREFIX)) {
          return originalSetItem.call(this, key, strVal);
        }
        const encrypted = encryptVaultValue(strVal);
        return originalSetItem.call(this, key, encrypted);
      } catch (err) {
        return originalSetItem.call(this, key, value);
      }
    }
    return originalSetItem.call(this, key, value);
  };

  // 3. Intercept getItem: Decrypt target keys transparently
  window.Storage.prototype.getItem = function (key) {
    const raw = originalGetItem.call(this, key);
    if (this === window.localStorage && raw && typeof raw === 'string') {
      if (raw.startsWith(VAULT_PREFIX)) {
        try {
          const decrypted = decryptVaultValue(raw);
          return decrypted !== null ? decrypted : raw;
        } catch (err) {
          return raw;
        }
      }
    }
    return raw;
  };
}

/**
 * Direct API for secure storage
 */
export const secureStorage = {
  getItem(key) {
    if (typeof window === 'undefined' || !window.localStorage || !originalGetItem) return null;
    const raw = originalGetItem.call(window.localStorage, key);
    if (raw && typeof raw === 'string' && raw.startsWith(VAULT_PREFIX)) {
      return decryptVaultValue(raw);
    }
    return raw;
  },

  setItem(key, value) {
    if (typeof window === 'undefined' || !window.localStorage || !originalSetItem) return;
    const encrypted = shouldEncryptKey(key) ? encryptVaultValue(value) : String(value);
    originalSetItem.call(window.localStorage, key, encrypted);
  },

  removeItem(key) {
    if (typeof window === 'undefined' || !window.localStorage || !originalRemoveItem) return;
    originalRemoveItem.call(window.localStorage, key);
  },

  clear() {
    if (typeof window === 'undefined' || !window.localStorage || !originalClear) return;
    originalClear.call(window.localStorage);
  },

  encrypt: encryptVaultValue,
  decrypt: decryptVaultValue,
  isEncrypted(val) {
    return typeof val === 'string' && val.startsWith(VAULT_PREFIX);
  }
};
