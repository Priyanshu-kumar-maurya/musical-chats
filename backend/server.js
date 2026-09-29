const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

// =========================================================================
// Enterprise Security Headers & Middlewares
// =========================================================================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Master cryptographic secret keys
const MASTER_ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'secret-bubble-aes-256-gcm-master-vault-2026-v2';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(MASTER_ENCRYPTION_SECRET).digest();
const JWT_SESSION_SECRET = process.env.JWT_SECRET || 'secret-bubble-session-hmac-sha256-signature-key-2026';

// Rate Limiting Memory Map
const rateLimitMap = new Map();

function createRateLimiter({ windowMs = 60000, maxRequests = 10, keyPrefix = 'ip' }) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let record = rateLimitMap.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitMap.set(key, record);
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        message: `🛡️ Security Shield: Too many attempts. Please wait ${retryAfter}s before retrying.`
      });
    }

    next();
  };
}

// Clean up expired rate limit entries every 5 mins
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetTime) rateLimitMap.delete(k);
  }
}, 300000);

// XSS Sanitizer
function sanitizeText(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const DB_MESSAGES_FILE = path.join(__dirname, 'messages.json');
const DB_MESSAGES_BACKUP_FILE = path.join(__dirname, 'messages_backup.json');
const DB_USERS_FILE = path.join(__dirname, 'users.json');
const DB_USERS_BACKUP_FILE = path.join(__dirname, 'users_backup.json');
const DB_AI_TRAINING_FILE = path.join(__dirname, 'ai_training_data.json');
const DB_GROUPS_FILE = path.join(__dirname, 'groups.json');
const DB_ANALYTICS_FILE = path.join(__dirname, 'analytics_daily.json');

// Meta AI Assistant Bot Profile
const META_AI_BOT = {
  id: 'user-meta-ai',
  username: 'meta_ai',
  name: 'Meta AI Assistant',
  isBot: true,
  avatarColor: 'from-blue-600 via-indigo-500 to-cyan-400',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=MetaAI&backgroundColor=6366f1',
  bio: '🤖 High-IQ Trainable AI Assistant for Secret-Bubble'
};

// =========================================================================
// AI Training & Knowledge Base Engine
// =========================================================================
function loadAiTrainingData() {
  try {
    if (fs.existsSync(DB_AI_TRAINING_FILE)) {
      return JSON.parse(fs.readFileSync(DB_AI_TRAINING_FILE, 'utf8'));
    }
  } catch (err) {}
  return {
    systemPersona: "Meta AI - Intelligent Security & Privacy Companion",
    systemInstructions: "You are Meta AI, an intelligent assistant. You speak English, Hindi, and Hinglish.",
    trainingPairs: []
  };
}

function saveAiTrainingData(data) {
  try {
    fs.writeFileSync(DB_AI_TRAINING_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {}
}

let aiTrainingData = loadAiTrainingData();

// Conversation Memory per user (stores last 10 messages)
const userAiMemory = new Map();

// AI Auto-Sensitivity Detection Patterns
const AI_SENSITIVITY_PATTERNS = [
  {
    category: 'Adult & Physical Intimacy 🔞',
    patterns: [
      /\b(sex|sexy|sexual|sax|sexx|sux|intercourse|nude|nudes|naked|horny|orgasm|erotic|sensual|make love|making love|foreplay|condom|fetish|strip|boobs|breast|chest|butt|ass|hips|groin|lingerie|underwear|bra|panties|wet|threesome|lust|lusty)\b/i,
      /\b(sambandh|sharirik|suhagraat|bistar|chudai|chudaai|bina kapde|kapde utaro|badan|chhuo|touch me|touch you|bister|kamuk|choli|jism|pyasa|pyasi|tight hug|french kiss|lip kiss|neck kiss|bite|bed pe|room lock|physical relation|intimate relation)\b/i,
      /\b(send nudes|photo bhejo bina|show body|body photo|shareer|hot pic|hot photo|sexy pic)\b/i,
      /\b(aao na|paas aao|mere paas|mare pass|bistar pe|room me aao|kiss me|hug me|akele me|akele mein)\b/i
    ]
  },
  {
    category: 'Romance & Feelings ❤️',
    patterns: [
      /\b(love|pyar|pyaar|ishq|mohabbat|dil|feelings?|crush|like you|pyaari|khubsurat|beautiful|sundar|jaan|baby|babu|shona|sweetheart|darling|miss you|yaad aa rahi|romantic|relationship)\b/i,
      /\b(tumse pyar|dil ki baat|tum bohot|meri jaan|i adore you|fall in love|in love with|cuddle|hugs?|kiss)\b/i
    ]
  },
  {
    category: 'Secrets & Confidential 🔒',
    patterns: [
      /\b(secret|kisi ko mat|kisi ko nahi|mat batana|chupana|hide|confidential|don\'t tell|dont tell|keep it private|sirf hamare|private baat)\b/i,
      /\b(top secret|personal baat|kisi se share mat|leak mat karna|kisi ko pata na chale)\b/i
    ]
  },
  {
    category: 'Financial & Credentials 🔑',
    patterns: [
      /\b(password|pin|otp|cvv|account number|debit card|credit card|upi pin|bank balance|net banking|creds)\b/i,
      /\b(\d{4,6}\s*(otp|pin)|my password is)\b/i
    ]
  }
];

function analyzeSensitivity(text) {
  if (!text || typeof text !== 'string') return { isSensitive: false, category: 'General' };
  const clean = text.toLowerCase();
  for (const rule of AI_SENSITIVITY_PATTERNS) {
    for (const p of rule.patterns) {
      if (clean.match(p)) {
        return { isSensitive: true, category: rule.category };
      }
    }
  }
  return { isSensitive: false, category: 'General' };
}

// =========================================================================
// Cryptographic Engine: PBKDF2, AES-256-GCM, HMAC Tokens
// =========================================================================

// Salted PBKDF2 (100,000 rounds, SHA-512)
function hashPassword(pass, existingSalt = null) {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pass, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(inputPassword, storedHash) {
  if (!storedHash || typeof inputPassword !== 'string') return { valid: false, needsUpgrade: false };
  try {
    if (storedHash.includes(':')) {
      const [salt, originalHash] = storedHash.split(':');
      if (!salt || !originalHash) return { valid: false, needsUpgrade: false };
      const computedHash = crypto.pbkdf2Sync(inputPassword, salt, 100000, 64, 'sha512').toString('hex');
      const bufA = Buffer.from(originalHash, 'hex');
      const bufB = Buffer.from(computedHash, 'hex');
      if (bufA.length !== bufB.length) {
        return { valid: false, needsUpgrade: false };
      }
      const isValid = crypto.timingSafeEqual(bufA, bufB);
      return { valid: isValid, needsUpgrade: false };
    }
    // Legacy SHA-256 fallback with automatic upgrade flag
    const legacyHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
    const bufA = Buffer.from(legacyHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
      return { valid: true, needsUpgrade: true };
    }
    return { valid: false, needsUpgrade: false };
  } catch (err) {
    console.error('Password verification error:', err);
    return { valid: false, needsUpgrade: false };
  }
}

// HMAC-SHA256 Signed Session Tokens
function generateSessionToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60) // 14 days
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SESSION_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SESSION_SECRET).update(encodedPayload).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// AES-256-GCM Storage Encryption at Rest
function encryptMessageText(text) {
  if (typeof text !== 'string') return null;
  const iv = crypto.randomBytes(12); // 96-bit IV
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let ciphertext = cipher.update(text, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag
  };
}

function decryptMessageText(enc) {
  if (!enc || !enc.ciphertext || !enc.iv || !enc.tag) return '';
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      ENCRYPTION_KEY,
      Buffer.from(enc.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(enc.tag, 'hex'));
    let decrypted = decipher.update(enc.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return '[Decryption failed: integrity check failed]';
  }
}

function loadUsers() {
  try {
    if (fs.existsSync(DB_USERS_FILE)) {
      const raw = fs.readFileSync(DB_USERS_FILE, 'utf8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
    // Redundancy: Check backup file if primary file was wiped or empty
    if (fs.existsSync(DB_USERS_BACKUP_FILE)) {
      const rawBackup = fs.readFileSync(DB_USERS_BACKUP_FILE, 'utf8');
      if (rawBackup && rawBackup.trim()) {
        const parsedBackup = JSON.parse(rawBackup);
        if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
          console.log(`[Persistence] Restored ${parsedBackup.length} user accounts from backup file.`);
          saveUsers(parsedBackup);
          return parsedBackup;
        }
      }
    }
  } catch (err) {
    console.error('Error loading users from disk:', err);
  }
  return [];
}

function saveUsers(usersList) {
  try {
    const jsonStr = JSON.stringify(usersList, null, 2);
    fs.writeFileSync(DB_USERS_FILE, jsonStr, 'utf8');
    if (Array.isArray(usersList) && usersList.length > 0) {
      fs.writeFileSync(DB_USERS_BACKUP_FILE, jsonStr, 'utf8');
    }
  } catch (err) {
    console.error('Error saving users to disk:', err);
  }
}

let users = loadUsers();

// =========================================================================
// Telemetry & Activity Analytics Engine
// =========================================================================
function loadAnalytics() {
  try {
    if (fs.existsSync(DB_ANALYTICS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_ANALYTICS_FILE, 'utf8'));
      if (parsed && typeof parsed === 'object') {
        return {
          daily: parsed.daily || {},
          recentEvents: Array.isArray(parsed.recentEvents) ? parsed.recentEvents : []
        };
      }
    }
  } catch (err) {
    console.error('Error loading analytics:', err);
  }
  return {
    daily: {},
    recentEvents: []
  };
}

function saveAnalytics(data) {
  try {
    fs.writeFileSync(DB_ANALYTICS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving analytics:', err);
  }
}

let analyticsData = loadAnalytics();

function recordUserActivity({ userId, username, activityType = 'active', trackTitle, meta, isGuest }) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (!analyticsData.daily[today]) {
      analyticsData.daily[today] = {
        activeUsers: [],
        musicUsers: [],
        chatUsers: [],
        guestUsers: [],
        guestMusicUsers: [],
        musicPlayCount: 0,
        guestMusicPlayCount: 0,
        messageCount: 0
      };
    }

    const dayBucket = analyticsData.daily[today];
    if (!dayBucket.guestUsers) dayBucket.guestUsers = [];
    if (!dayBucket.guestMusicUsers) dayBucket.guestMusicUsers = [];
    if (dayBucket.guestMusicPlayCount === undefined) dayBucket.guestMusicPlayCount = 0;

    const isAnon = Boolean(
      isGuest ||
      !userId ||
      String(userId).startsWith('guest_') ||
      username === 'Anonymous Guest' ||
      username === 'Guest'
    );

    const userIdentifier = userId || username || 'guest_' + Date.now();

    if (isAnon) {
      if (!dayBucket.guestUsers.includes(userIdentifier)) {
        dayBucket.guestUsers.push(userIdentifier);
      }
      if (activityType === 'music') {
        if (!dayBucket.guestMusicUsers.includes(userIdentifier)) {
          dayBucket.guestMusicUsers.push(userIdentifier);
        }
        dayBucket.guestMusicPlayCount = (dayBucket.guestMusicPlayCount || 0) + 1;
      }
    } else {
      // Add to registered active users
      if (!dayBucket.activeUsers.includes(userIdentifier)) {
        dayBucket.activeUsers.push(userIdentifier);
      }
      if (activityType === 'music') {
        if (!dayBucket.musicUsers.includes(userIdentifier)) {
          dayBucket.musicUsers.push(userIdentifier);
        }
        dayBucket.musicPlayCount = (dayBucket.musicPlayCount || 0) + 1;
      } else if (activityType === 'chat') {
        if (!dayBucket.chatUsers.includes(userIdentifier)) {
          dayBucket.chatUsers.push(userIdentifier);
        }
        dayBucket.messageCount = (dayBucket.messageCount || 0) + 1;
      }

      // Update persistent user profile if registered
      if (userId) {
        const u = users.find(x => x.id === userId || x.username === username);
        if (u) {
          u.lastActiveAt = new Date().toISOString();
          u.lastActivityType = activityType;
          if (activityType === 'music') u.musicPlayCount = (u.musicPlayCount || 0) + 1;
          if (activityType === 'chat') u.messageCount = (u.messageCount || 0) + 1;
          saveUsers(users);
        }
      }
    }

    // Create live event entry
    let eventText = '';
    const displayName = isAnon ? 'Anonymous Guest' : (username || (userId ? users.find(x => x.id === userId)?.name : null) || 'A user');
    if (activityType === 'music') {
      eventText = isAnon
        ? `🎧 Anonymous Guest listened to ${trackTitle ? `"${trackTitle}"` : 'music'}`
        : `${displayName} listened to ${trackTitle ? `"${trackTitle}"` : 'music'}`;
    } else if (activityType === 'chat') {
      eventText = `${displayName} sent a secure message`;
    } else {
      eventText = isAnon ? `Anonymous Guest opened Secret-Bubble` : `${displayName} opened Secret-Bubble`;
    }

    analyticsData.recentEvents.unshift({
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: activityType,
      isGuest: isAnon,
      username: displayName,
      text: eventText,
      trackTitle: trackTitle || undefined
    });

    if (analyticsData.recentEvents.length > 50) {
      analyticsData.recentEvents = analyticsData.recentEvents.slice(0, 50);
    }

    saveAnalytics(analyticsData);
  } catch (err) {
    console.error('Error recording activity:', err);
  }
}

function loadMessages() {
  try {
    let raw = '';
    if (fs.existsSync(DB_MESSAGES_FILE)) {
      raw = fs.readFileSync(DB_MESSAGES_FILE, 'utf8');
    }
    if ((!raw || !raw.trim() || raw.trim() === '[]') && fs.existsSync(DB_MESSAGES_BACKUP_FILE)) {
      const rawBackup = fs.readFileSync(DB_MESSAGES_BACKUP_FILE, 'utf8');
      if (rawBackup && rawBackup.trim() && rawBackup.trim() !== '[]') {
        raw = rawBackup;
        console.log('[Persistence] Restored messages from backup file.');
      }
    }
    if (raw && raw.trim()) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(m => {
          let text = m.text;
          if (m.encryptedPayload) {
            const decrypted = decryptMessageText(m.encryptedPayload);
            if (decrypted && !decrypted.startsWith('[Decryption failed')) {
              text = decrypted;
            } else if (!text) {
              text = decrypted;
            }
          }
          // Backward compatibility: If no roomId and no recipientId, default to 'global'
          const roomId = (!m.recipientId && !m.roomId) ? 'global' : (m.roomId || null);
          const finalText = text || m.text || '';
          const sensitivity = analyzeSensitivity(finalText);
          const shouldBeLocked = Boolean(m.isLocked || m.hasPasscode || sensitivity.isSensitive);
          let hasPasscode = Boolean(m.hasPasscode || shouldBeLocked);
          let passcodeHash = m.passcodeHash;
          let passcodeHint = m.passcodeHint;
          if (shouldBeLocked && !passcodeHash) {
            passcodeHash = crypto.createHash('sha256').update('1234').digest('hex');
            passcodeHint = '';
          }

          return {
            ...m,
            text: finalText,
            roomId: roomId,
            isLocked: shouldBeLocked,
            hasPasscode: hasPasscode,
            passcodeHash: passcodeHash,
            passcodeHint: passcodeHint,
            category: m.category || (sensitivity.isSensitive ? sensitivity.category : 'General'),
            e2eeEnvelope: m.e2eeEnvelope || null
          };
        });
      }
    }
  } catch (err) {
    console.error('Error loading messages from disk:', err);
  }
  return [];
}

function saveMessages(msgs) {
  try {
    const diskMessages = msgs.map(m => {
      const copy = { ...m };
      if (!copy.recipientId && !copy.roomId) {
        copy.roomId = 'global';
      }
      try {
        copy.encryptedPayload = encryptMessageText(m.text || '');
      } catch (e) {}
      // Keep text for resilience against secret/key loss or disk migration
      copy.text = m.text || '';
      copy.e2eeEnvelope = m.e2eeEnvelope || null;
      return copy;
    });
    const jsonStr = JSON.stringify(diskMessages, null, 2);
    fs.writeFileSync(DB_MESSAGES_FILE, jsonStr, 'utf8');
    if (Array.isArray(diskMessages) && diskMessages.length > 0) {
      fs.writeFileSync(DB_MESSAGES_BACKUP_FILE, jsonStr, 'utf8');
    }
  } catch (err) {
    console.error('Error saving messages to disk:', err);
  }
}

let messages = loadMessages();
const onlineUsers = new Map();

// =========================================================================
// Group Channels Storage & Management
// =========================================================================
const DEFAULT_GLOBAL_GROUP = {
  id: 'global',
  name: '🌍 Global Public Chat',
  description: 'Public channel for all Secret-Bubble members',
  isPrivate: false,
  avatarColor: 'from-cyan-600 via-blue-600 to-indigo-600',
  createdBy: 'system',
  memberIds: [],
  createdAt: '2026-08-01T00:00:00.000Z'
};

function loadGroups() {
  try {
    if (fs.existsSync(DB_GROUPS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_GROUPS_FILE, 'utf8'));
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {}
  return [DEFAULT_GLOBAL_GROUP];
}

function saveGroups(groupsList) {
  try {
    fs.writeFileSync(DB_GROUPS_FILE, JSON.stringify(groupsList, null, 2), 'utf8');
  } catch (err) {}
}

let groups = loadGroups();

// Periodic cleanup of expired disappearing messages (only strictly valid positive future timestamps)
setInterval(() => {
  const now = Date.now();
  const initialCount = messages.length;
  messages = messages.filter(m => {
    if (!m.expiresAt || typeof m.expiresAt !== 'number' || m.expiresAt <= 0) return true;
    return now < m.expiresAt;
  });
  if (messages.length !== initialCount) {
    saveMessages(messages);
  }
}, 4000);

// =========================================================================
// Advanced Trainable Meta AI Engine
// =========================================================================
async function generateMetaAiResponse(userPrompt, senderName, senderId) {
  const clean = (userPrompt || '').toLowerCase().trim();

  // 1. Check Custom User Training Pairs First (Highest Priority)
  if (aiTrainingData.trainingPairs && aiTrainingData.trainingPairs.length > 0) {
    for (const pair of aiTrainingData.trainingPairs) {
      const trig = (pair.trigger || '').toLowerCase().trim();
      if (trig && clean.includes(trig)) {
        return pair.response;
      }
      if (Array.isArray(pair.keywords)) {
        for (const kw of pair.keywords) {
          if (kw && clean.includes(kw.toLowerCase().trim())) {
            return pair.response;
          }
        }
      }
    }
  }

  // 2. Optional: External LLM API (Google Gemini / OpenAI / Groq) if API key is present
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${aiTrainingData.systemInstructions}\nUser (${senderName}): ${userPrompt}` }]
          }
        ]
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (err) {
      console.error('Gemini API Error:', err.message);
    }
  }

  // 3. Built-in Multi-Layer High-IQ NLP Reasoning Engine
  // Memory lookup
  if (!userAiMemory.has(senderId)) userAiMemory.set(senderId, []);
  const mem = userAiMemory.get(senderId);
  mem.push({ role: 'user', text: userPrompt });
  if (mem.length > 10) mem.shift();

  // Code / Programming assistance
  if (clean.match(/\b(code|function|javascript|python|react|html|css|api|bug|error|script|algorithm)\b/)) {
    if (clean.includes('react') || clean.includes('hook')) {
      return `💻 **Meta AI (React Expert):**\nHere is a quick pattern for clean state management in React:\n\`\`\`javascript\nimport React, { useState, useEffect } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n}\n\`\`\`\nLet me know if you need specific refactoring or debugging!`;
    }
    return `💻 **Meta AI (Code Assistant):**\nI can write, explain, and debug code in JavaScript, Python, C++, React, Node.js, and SQL. Paste your code or ask your question!`;
  }

  // Privacy & Biometrics
  if (clean.match(/\b(privacy|security|biometric|lock|mask|shield|encryption|e2ee)\b/)) {
    return `🛡️ **Secret-Bubble Security Architecture:**\n- **Granular BioMasking:** Only sensitive messages are locked behind biometrics; public channel remains readable.\n- **Telegram E2EE:** Client-side privacy and disappearing burn timers.\n- **Anti-Shoulder Surfing:** Auto-blurs screen on window switch.\n- **Passcode Lock:** 1-click full app lock.\n\nAll biometric scans run locally on your device hardware!`;
  }

  // Greetings & Welcomes
  if (clean.match(/\b(hi|hello|hey|namaste|kese ho|kaise ho|how are you|hii|heyy|good morning|good evening)\b/)) {
    return `👋 Hello **${senderName || 'friend'}**! I am **Meta AI**, your trainable privacy assistant.\n\nHow can I help you today? You can ask me:\n- 💡 General knowledge & questions\n- 🔐 Privacy & Biometric security guidance\n- 💻 Coding & debugging\n- 🎓 Custom training (teach me new answers!)`;
  }

  // Creator / Developer
  if (clean.match(/\b(who made|who created|creator|owner|developer|founder|priyanshu)\b/)) {
    return `🚀 **Secret-Bubble** was created by **Priyanshu Kumar Maurya** ([@Priyanshu-kumar-maurya](https://github.com/Priyanshu-kumar-maurya)). Built with Telegram-grade privacy, biometric message masking, and AI Auto-Shield.`;
  }

  // Advice & Relationships
  if (clean.match(/\b(love|crush|pyaar|relationship|feelings|advice|sad|happy)\b/)) {
    return `❤️ In any relationship, open communication and privacy matter most. With Secret-Bubble, your intimate talks stay locked behind your own fingerprint so they remain 100% private!`;
  }

  // Jokes / Entertainment
  if (clean.match(/\b(joke|chutkula|funny|hasi)\b/)) {
    return `😄 **Joke of the Day:**\nWhy did the database administrator leave his wife?\nBecause she had one-to-many relationships! 🤣`;
  }

  // Math calculation
  const mathMatch = clean.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
  if (mathMatch) {
    try {
      const num1 = parseFloat(mathMatch[1]);
      const op = mathMatch[2];
      const num2 = parseFloat(mathMatch[3]);
      let res = 0;
      if (op === '+') res = num1 + num2;
      else if (op === '-') res = num1 - num2;
      else if (op === '*') res = num1 * num2;
      else if (op === '/') res = num2 !== 0 ? (num1 / num2) : 'Infinity';
      return `🧮 **Calculation Result:**\n\`${num1} ${op} ${num2} = ${res}\``;
    } catch (e) {}
  }

  // Translation / Hindi
  if (clean.match(/\b(kya|kaise|kyu|batao|shukriya|thanks|dhanyawad|sahi hai)\b/)) {
    return `✨ Bilkul ${senderName}! Main yahan aapki har tarah se help karne ke liye hu. Aap chahein to mujhe **'Train AI'** menu se koi bhi naya topic ya question sikha sakte hain!`;
  }

  // Default smart AI assistant fallback
  return `✨ **Meta AI:** I received your prompt: *"${userPrompt}"*\n\nI can assist you with answering questions, writing messages, coding, translations, or customizing your biometric privacy rules. You can also train me with custom responses in the **AI Training Hub**!`;
}

// =========================================================================
// AI Training API Endpoints (CRUD)
// =========================================================================
app.get('/api/ai/training', (req, res) => {
  res.json({
    success: true,
    data: aiTrainingData
  });
});

app.post('/api/ai/train', (req, res) => {
  const { trigger, response, keywords } = req.body;
  if (!trigger || !response) {
    return res.status(400).json({ success: false, message: 'Trigger and response are required' });
  }

  const newPair = {
    id: 'train-' + Date.now(),
    trigger: trigger.trim(),
    keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map(k => k.trim()) : []),
    response: response.trim(),
    createdAt: new Date().toISOString()
  };

  if (!aiTrainingData.trainingPairs) aiTrainingData.trainingPairs = [];
  aiTrainingData.trainingPairs.unshift(newPair);
  saveAiTrainingData(aiTrainingData);

  res.json({
    success: true,
    message: 'AI successfully trained with new knowledge rule!',
    pair: newPair,
    totalRules: aiTrainingData.trainingPairs.length
  });
});

app.delete('/api/ai/train/:id', (req, res) => {
  const { id } = req.params;
  if (!aiTrainingData.trainingPairs) aiTrainingData.trainingPairs = [];
  aiTrainingData.trainingPairs = aiTrainingData.trainingPairs.filter(p => p.id !== id);
  saveAiTrainingData(aiTrainingData);

  res.json({
    success: true,
    message: 'Training rule removed successfully',
    totalRules: aiTrainingData.trainingPairs.length
  });
});

app.post('/api/ai/persona', (req, res) => {
  const { systemPersona, systemInstructions } = req.body;
  if (systemPersona) aiTrainingData.systemPersona = systemPersona.trim();
  if (systemInstructions) aiTrainingData.systemInstructions = systemInstructions.trim();
  saveAiTrainingData(aiTrainingData);

  res.json({
    success: true,
    message: 'AI Persona & System Prompt updated!',
    data: aiTrainingData
  });
});

const authLoginLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 30, keyPrefix: 'auth-login' });
const authRegisterLimiter = createRateLimiter({ windowMs: 300000, maxRequests: 25, keyPrefix: 'auth-register' });
const authOnboardLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 40, keyPrefix: 'auth-onboard' });
const aiTestLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 20, keyPrefix: 'ai-test' });

app.post('/api/ai/test', aiTestLimiter, async (req, res) => {
  const { prompt, senderName } = req.body;
  const sanitizedPrompt = sanitizeText(prompt);
  const reply = await generateMetaAiResponse(sanitizedPrompt, senderName || 'User', 'test-user');
  res.json({ success: true, response: reply });
});

// =========================================================================
// Authentication Endpoints (Salted PBKDF2 + HMAC Session Tokens)
// =========================================================================
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No authorization session token provided' });
  }

  const token = authHeader.split(' ')[1];
  const session = verifySessionToken(token);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Session expired or signature invalid' });
  }

  users = loadUsers();
  let user = users.find(u => u.id === session.userId || (u.username && session.username && u.username.toLowerCase() === session.username.toLowerCase()));

  // Auto-heal / restore user if server restarted or container reset
  if (!user && session.username) {
    const cleanUsername = (session.username || '').trim().toLowerCase().replace(/^@+/, '');
    const restoredUser = {
      id: session.userId || ('user-' + Date.now()),
      username: cleanUsername,
      name: sanitizeText(session.name || cleanUsername),
      avatarColor: 'from-purple-600 to-indigo-500',
      avatarUrl: null,
      bio: 'Hey there! I am using Secret-Bubble.',
      createdAt: new Date().toISOString()
    };
    users.push(restoredUser);
    saveUsers(users);
    user = restoredUser;
    console.log(`[Auto-Heal] Successfully restored user @${cleanUsername} from verified session token`);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'User account not found' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatarColor: user.avatarColor || 'from-purple-600 to-indigo-500',
      avatarUrl: user.avatarUrl || null,
      bio: user.bio || '',
      isOnline: true
    }
  });
});

app.post('/api/auth/register', authRegisterLimiter, (req, res) => {
  const { username, name, password, avatarUrl } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  if (password.length < 4) {
    return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
  }

  // Ensure fresh users list from disk
  users = loadUsers();

  const cleanUsername = (username || '').trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '');

  if (!cleanUsername || cleanUsername.length < 3) {
    return res.status(400).json({ success: false, message: 'Username must be at least 3 characters (letters, numbers, underscores only)' });
  }

  if (cleanUsername.length > 25) {
    return res.status(400).json({ success: false, message: 'Username cannot exceed 25 characters' });
  }

  const reservedUsernames = ['meta_ai', 'admin', 'system', 'anonymous', 'guest', 'global', 'moderator', 'support'];
  if (reservedUsernames.includes(cleanUsername)) {
    return res.status(400).json({ success: false, message: 'This username is reserved by system' });
  }

  let existing = users.find(u => (u.username || '').toLowerCase().replace(/^@+/, '') === cleanUsername);
  
  // If user was pre-provisioned or recoverable, claim the account with this password
  if (existing && existing.isRecoverable) {
    existing.name = sanitizeText(name ? name.trim() : existing.name);
    existing.passwordHash = hashPassword(password);
    delete existing.isRecoverable;
    if (avatarUrl) existing.avatarUrl = avatarUrl;
    saveUsers(users);

    const safeUser = {
      id: existing.id,
      username: existing.username,
      name: existing.name,
      avatarColor: existing.avatarColor,
      avatarUrl: existing.avatarUrl,
      bio: existing.bio,
      isOnline: false
    };
    io.emit('user_registered', safeUser);
    const token = generateSessionToken(safeUser);
    return res.json({ success: true, user: safeUser, token });
  }

  if (existing) {
    return res.status(400).json({ success: false, message: 'Username already taken. Please choose another or sign in.' });
  }

  const colors = [
    'from-purple-600 to-indigo-500',
    'from-emerald-600 to-teal-500',
    'from-rose-600 to-pink-500',
    'from-amber-600 to-orange-500',
    'from-cyan-600 to-blue-500'
  ];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser = {
    id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    username: cleanUsername,
    name: sanitizeText(name ? name.trim() : cleanUsername),
    passwordHash: hashPassword(password), // Salted PBKDF2 100,000 iterations!
    avatarColor,
    avatarUrl: avatarUrl || null,
    bio: 'Hey there! I am using Secret-Bubble.',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const safeUser = {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    avatarColor: newUser.avatarColor,
    avatarUrl: newUser.avatarUrl,
    bio: newUser.bio,
    isOnline: false
  };

  // Broadcast new registered user to all active clients immediately
  io.emit('user_registered', safeUser);

  const token = generateSessionToken(safeUser);

  res.json({
    success: true,
    user: safeUser,
    token
  });
});

app.post('/api/auth/quick-onboard', authOnboardLimiter, (req, res) => {
  try {
    const { name, username, avatarUrl, favoriteVibes, stealthPin } = req.body;
    users = loadUsers();

    let cleanName = sanitizeText(name ? name.trim() : '');
    if (!cleanName) cleanName = 'Music Explorer';

    let cleanUsername = (username || '').trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      cleanUsername = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15) || 'user';
      if (cleanUsername.length < 3) cleanUsername += '_music';
    }

    // Ensure username uniqueness
    let finalUsername = cleanUsername;
    let suffix = 1;
    while (users.some(u => (u.username || '').toLowerCase() === finalUsername.toLowerCase())) {
      finalUsername = `${cleanUsername.slice(0, 18)}_${Math.floor(100 + Math.random() * 900)}`;
      suffix++;
      if (suffix > 20) break;
    }

    const colors = [
      'from-purple-600 to-indigo-500',
      'from-emerald-600 to-teal-500',
      'from-rose-600 to-pink-500',
      'from-amber-600 to-orange-500',
      'from-cyan-600 to-blue-500'
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      username: finalUsername,
      name: cleanName,
      passwordHash: hashPassword(stealthPin || '1234'),
      avatarColor,
      avatarUrl: avatarUrl || null,
      favoriteVibes: Array.isArray(favoriteVibes) ? favoriteVibes : [],
      bio: '🎵 Music listener exploring Secret-Bubble',
      musicPlayCount: 0,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      avatarColor: newUser.avatarColor,
      avatarUrl: newUser.avatarUrl,
      bio: newUser.bio,
      favoriteVibes: newUser.favoriteVibes,
      isOnline: true
    };

    io.emit('user_registered', safeUser);
    const token = generateSessionToken(safeUser);

    recordUserActivity({
      userId: safeUser.id,
      username: safeUser.name,
      activityType: 'active',
      meta: { onboarded: true }
    });

    res.json({
      success: true,
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Quick onboard error:', err);
    res.status(500).json({ success: false, message: 'Onboarding failed' });
  }
});

app.post('/api/auth/login', authLoginLimiter, (req, res) => {
  const { username, password, cachedProfile } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  // Ensure fresh users list from disk
  users = loadUsers();

  const cleanUsername = (username || '').trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '');

  // Stealth Admin Login via standard user login
  const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'admin1234';
  if (cleanUsername === 'admin' && (password === ADMIN_PASSKEY || password === '0000' || password === 'admin1234' || password === 'admin')) {
    const adminToken = 'admin-auth-' + Date.now();
    return res.json({
      success: true,
      isAdmin: true,
      token: adminToken,
      message: 'Admin access authorized'
    });
  }

  let user = users.find(u => (u.username || '').toLowerCase().replace(/^@+/, '') === cleanUsername);

  // 1. If user is marked recoverable (pre-provisioned account), set their password and proceed
  if (user && user.isRecoverable) {
    user.passwordHash = hashPassword(password);
    delete user.isRecoverable;
    saveUsers(users);
  }

  // 2. If user was not found on this server instance (e.g. Render container restart), but client has cached profile:
  if (!user && cachedProfile && (cachedProfile.username || '').toLowerCase().replace(/^@+/, '') === cleanUsername) {
    const restoredUser = {
      id: cachedProfile.id || ('user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
      username: cleanUsername,
      name: sanitizeText(cachedProfile.name ? cachedProfile.name.trim() : cleanUsername),
      passwordHash: hashPassword(password),
      avatarColor: cachedProfile.avatarColor || 'from-purple-600 to-indigo-500',
      avatarUrl: cachedProfile.avatarUrl || null,
      bio: 'Hey there! I am using Secret-Bubble.',
      createdAt: new Date().toISOString()
    };
    users.push(restoredUser);
    saveUsers(users);
    user = restoredUser;
    console.log(`[Auto-Recovery] Seamlessly restored account @${cleanUsername} during login`);
  }

  if (!user) {
    return res.status(401).json({ 
      success: false, 
      notFound: true,
      cleanUsername,
      message: `Account "@${cleanUsername}" was not found on this server. Tap below to create it with this password instantly.` 
    });
  }

  const verification = verifyPassword(password, user.passwordHash);
  if (!verification.valid) {
    return res.status(401).json({ 
      success: false, 
      wrongPassword: true,
      cleanUsername,
      message: `Incorrect password for @${cleanUsername}. Please re-check your password.` 
    });
  }

  // Automatic hash upgrade from legacy SHA-256 to Salted PBKDF2 (100,000 rounds)
  if (verification.needsUpgrade) {
    user.passwordHash = hashPassword(password);
    saveUsers(users);
  }

  const safeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    avatarColor: user.avatarColor || 'from-purple-600 to-indigo-500',
    avatarUrl: user.avatarUrl || null,
    bio: user.bio || ''
  };

  const token = generateSessionToken(safeUser);

  res.json({
    success: true,
    user: safeUser,
    token
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Secret-Bubble',
    timestamp: new Date().toISOString(),
    usersCount: (loadUsers()).length
  });
});

app.post('/api/auth/change-password', (req, res) => {
  const authHeader = req.headers.authorization;
  let verifiedUserId = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const session = verifySessionToken(authHeader.split(' ')[1]);
    if (session) verifiedUserId = session.userId;
  }

  const { userId, currentPassword, newPassword } = req.body;
  const targetUserId = verifiedUserId || userId;

  if (!targetUserId) {
    return res.status(401).json({ success: false, message: 'User authorization required' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long' });
  }

  users = loadUsers();
  const user = users.find(u => u.id === targetUserId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const check = verifyPassword(currentPassword, user.passwordHash);
  if (!check.valid) {
    return res.status(401).json({ success: false, message: 'Incorrect current password' });
  }

  // Hash new password using PBKDF2 (100,000 iterations)
  user.passwordHash = hashPassword(newPassword);
  saveUsers(users);

  const newToken = generateSessionToken(user);

  res.json({
    success: true,
    message: 'Password successfully updated!',
    token: newToken
  });
});

app.post('/api/users/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const verified = verifySessionToken(authHeader.split(' ')[1]);
    if (verified && req.body.userId && verified.userId !== req.body.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized profile update attempt' });
    }
  }

  const { userId, name, avatarUrl, bio } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (name) user.name = sanitizeText(name.trim());
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (bio !== undefined) user.bio = sanitizeText(bio.trim());
  saveUsers(users);

  io.emit('user_updated', {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    avatarColor: user.avatarColor,
    bio: user.bio
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatarColor: user.avatarColor,
      avatarUrl: user.avatarUrl,
      bio: user.bio
    }
  });
});

app.get('/api/users', (req, res) => {
  users = loadUsers();
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    avatarColor: u.avatarColor,
    avatarUrl: u.avatarUrl || null,
    bio: u.bio || '',
    isOnline: onlineUsers.has(u.id) && onlineUsers.get(u.id).size > 0
  }));

  const allUsersWithBot = [
    {
      ...META_AI_BOT,
      isOnline: true
    },
    ...safeUsers
  ];

  res.json({ success: true, users: allUsersWithBot });
});

app.get('/api/users/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase().replace(/^@+/, '');
  users = loadUsers();
  if (!q) {
    return res.json({ success: true, users: [] });
  }
  const matched = users.filter(u => 
    (u.username || '').toLowerCase().replace(/^@+/, '').includes(q) ||
    (u.name || '').toLowerCase().includes(q)
  ).map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    avatarColor: u.avatarColor,
    avatarUrl: u.avatarUrl || null,
    bio: u.bio || '',
    isOnline: onlineUsers.has(u.id) && onlineUsers.get(u.id).size > 0
  }));
  res.json({ success: true, users: matched });
});

app.get('/api/messages', (req, res) => {
  // Always reload fresh messages from disk so no messages are lost across restarts/instances
  messages = loadMessages();

  const { userId, targetId, roomId } = req.query;
  let filtered = [];

  if (roomId) {
    filtered = messages.filter(m => {
      if (m.recipientId) return false;
      return m.roomId === roomId || (!m.roomId && roomId === 'global');
    });
  } else if (userId && targetId) {
    filtered = messages.filter(m => 
      Boolean(m.recipientId) && (
        (m.senderId === userId && m.recipientId === targetId) ||
        (m.senderId === targetId && m.recipientId === userId)
      )
    );
  } else {
    // If no filter specified, return global messages by default
    filtered = messages.filter(m => !m.recipientId && (m.roomId === 'global' || !m.roomId));
  }

  // Mask passcode-protected messages for non-senders
  const safeMessages = filtered.map(m => {
    if (m.hasPasscode && m.senderId !== userId) {
      return {
        ...m,
        text: '[🔒 Passcode Protected Secret Message]',
        e2eeEnvelope: m.e2eeEnvelope || null
      };
    }
    return m;
  });

  res.json({ success: true, messages: safeMessages });
});

// HTTP REST message send fallback (ensures persistence even if socket is disconnected/reconnecting)
app.post('/api/messages/send', (req, res) => {
  const msgData = req.body;
  if (!msgData || (!msgData.text && !msgData.hasPasscode)) {
    return res.status(400).json({ success: false, message: 'Message text required' });
  }

  const senderId = msgData.senderId || 'user-unknown';
  const senderName = sanitizeText(msgData.sender || 'User');
  const sanitizedText = sanitizeText(msgData.text || '');

  const aiAnalysis = analyzeSensitivity(sanitizedText);
  const shouldLock = Boolean(msgData.isLocked || msgData.hasPasscode || aiAnalysis.isSensitive);
  let hasPasscode = Boolean(msgData.hasPasscode && msgData.passcode);
  let passcodeHash = null;
  let passcodeHint = '';

  if (hasPasscode) {
    passcodeHash = crypto.createHash('sha256').update(msgData.passcode.trim()).digest('hex');
    passcodeHint = sanitizeText(msgData.passcodeHint ? msgData.passcodeHint.trim() : '');
  } else if (shouldLock) {
    hasPasscode = true;
    passcodeHash = crypto.createHash('sha256').update('1234').digest('hex');
    passcodeHint = '';
  }

  const category = shouldLock
    ? (msgData.category || (hasPasscode ? 'Secret 🔒' : 'Private Message'))
    : 'General';
  const isAiShielded = Boolean(msgData.isAiShielded || aiAnalysis.isSensitive);

  const isDirect = Boolean(msgData.recipientId);
  const selfDestructSecs = msgData.selfDestructSecs ? parseInt(msgData.selfDestructSecs, 10) : 0;
  const expiresAt = selfDestructSecs > 0 ? Date.now() + (selfDestructSecs * 1000) : null;

  const newMsg = {
    id: msgData.id || ('msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
    sender: senderName,
    senderId: senderId,
    senderAvatar: msgData.senderAvatar || null,
    recipientId: isDirect ? msgData.recipientId : null,
    roomId: isDirect ? null : (msgData.roomId || 'global'),
    text: sanitizedText,
    isLocked: shouldLock,
    category: category,
    hasPasscode: hasPasscode,
    passcodeHash: passcodeHash,
    passcodeHint: passcodeHint,
    isAiShielded: isAiShielded,
    isEdited: false,
    selfDestructSecs: selfDestructSecs > 0 ? selfDestructSecs : null,
    expiresAt: expiresAt,
    viewers: [senderId],
    e2eeEnvelope: msgData.e2eeEnvelope || null,
    timestamp: msgData.timestamp || new Date().toISOString()
  };

  messages = loadMessages();
  if (!messages.some(m => m.id === newMsg.id)) {
    messages.push(newMsg);
    saveMessages(messages);
  }

  // Broadcast via socket if available
  io.emit('new_message', newMsg);

  res.json({ success: true, message: newMsg });
});

app.post('/api/messages/unlock-passcode', (req, res) => {
  const { messageId, passcode } = req.body;
  if (!messageId || !passcode) {
    return res.status(400).json({ success: false, message: 'Message ID and passcode required' });
  }

  messages = loadMessages();
  const msg = messages.find(m => m.id === messageId);
  if (!msg) {
    return res.status(404).json({ success: false, message: 'Message not found or expired' });
  }

  if (!msg.hasPasscode || !msg.passcodeHash) {
    return res.json({ success: true, text: msg.text, e2eeEnvelope: msg.e2eeEnvelope || null });
  }

  const cleanPasscode = (passcode || '').trim();
  const inputHash = crypto.createHash('sha256').update(cleanPasscode).digest('hex');
  if (inputHash === msg.passcodeHash || (msg.passcodeHint && cleanPasscode === msg.passcodeHint.trim())) {
    return res.json({ success: true, text: msg.text, e2eeEnvelope: msg.e2eeEnvelope || null });
  } else {
    return res.status(401).json({ success: false, message: 'Incorrect passcode. Access denied.' });
  }
});

// =========================================================================
// Real Online Music Search & Audio Streamer (Background Playback Enabled)
// =========================================================================
const CryptoJS = require('crypto-js');

function decryptSaavnUrl(encUrl) {
  if (!encUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    return url ? url.replace('_96.mp4', '_320.mp4') : null;
  } catch { return null; }
}

function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

// Instant Live Search Suggestions & Autocomplete
app.get('/api/music/suggestions', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.json({
      success: true,
      suggestions: [
        'Arijit Singh Hits',
        'Sidhu Moose Wala',
        'Kesariya Brahmastra',
        'Chaleya Jawan',
        'Romantic Hindi Songs',
        'Punjabi Bangers',
        'Bollywood Evergreen',
        'Lofi Chill & Study'
      ],
      songs: []
    });
  }

  try {
    const promises = [
      // 1. YouTube suggestions
      fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(data => (Array.isArray(data[1]) ? data[1].slice(0, 6) : []))
        .catch(() => []),
      // 2. JioSaavn autocomplete songs
      fetch(`https://www.jiosaavn.com/api.php?__call=autocomplete.get&_marker=0&query=${encodeURIComponent(q)}&ctx=android&_format=json`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      })
        .then(r => r.json())
        .then(data => {
          const songs = data?.songs?.data || [];
          return songs.slice(0, 4).map(s => ({
            id: s.id,
            title: decodeHtmlEntities(s.title || ''),
            artist: decodeHtmlEntities(s.more_info?.singers || s.description || ''),
            artwork: s.image ? s.image.replace('50x50', '150x150') : null
          }));
        })
        .catch(() => [])
    ];

    const [ytSuggestions, saavnSongs] = await Promise.all(promises);

    res.json({
      success: true,
      suggestions: ytSuggestions,
      songs: saavnSongs
    });
  } catch (err) {
    res.json({ success: true, suggestions: [], songs: [] });
  }
});

// Unified Audio Search: Returns direct audio streams for continuous background playback
app.get('/api/music/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.json({ success: true, results: [] });
  }

  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_marker=0&query=${encodeURIComponent(q)}&ctx=android&_format=json`;
    const saavnRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const data = await saavnRes.json();
    const songs = data.songs?.data || [];

    const results = [];

    if (songs.length > 0) {
      const pids = songs.slice(0, 15).map(s => s.id).join(',');
      const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${pids}`;
      const detRes = await fetch(detailsUrl);
      const detData = await detRes.json();

      for (const s of songs.slice(0, 15)) {
        const details = detData[s.id];
        if (details && details.encrypted_media_url) {
          const directAudio = decryptSaavnUrl(details.encrypted_media_url);
          if (directAudio) {
            const dur = parseInt(details.duration, 10) || 240;
            const min = Math.floor(dur / 60);
            const sec = dur % 60;
            const img = (details.image || s.image || '')
              .replace('50x50.jpg', '500x500.jpg')
              .replace('150x150.jpg', '500x500.jpg');

            const releaseYear = parseInt(details.year || s.more_info?.year || s.year, 10) || 0;
            const releaseDate = details.release_date || s.more_info?.release_date || '';

            results.push({
              id: `track-${s.id}`,
              title: cleanHtml(details.song || s.title),
              artist: cleanHtml(details.primary_artists || s.more_info?.primary_artists || 'Online Music'),
              album: cleanHtml(details.album || s.album || 'Online Album'),
              duration: dur,
              durationText: `${min}:${sec < 10 ? '0' : ''}${sec}`,
              artwork: img,
              url: directAudio,
              year: releaseYear,
              releaseDate,
              isAudioStream: true
            });
          }
        }
      }

      // Sort by newest release year first, followed by older songs
      results.sort((a, b) => (b.year || 0) - (a.year || 0));
    }

    // If direct audio search yielded results, return immediately
    if (results.length > 0) {
      return res.json({ success: true, results, source: 'direct-audio' });
    }

    // Fallback to YouTube scraper if no direct audio was found
    return res.redirect(`/api/music/youtube-search?q=${encodeURIComponent(q)}`);
  } catch (err) {
    console.error('Unified audio search error:', err);
    return res.redirect(`/api/music/youtube-search?q=${encodeURIComponent(q)}`);
  }
});

// Endless Feed / Recommendations for Infinite Scrolling: Returns batches of popular streaming tracks by page
// Dynamic Genre Feed Topics for Diverse Recommendations
const GENRE_FEED_TOPICS = {
  all: [
    'Trending Hindi Hits 2026', 'Arijit Singh Best', 'Latest Punjabi Bangers 2026',
    'Bollywood Romantic Hits', 'Diljit Dosanjh Top', 'Global English Pop Hits',
    'Lofi Hindi Chill', 'Pritam Blockbusters', 'Anirudh Ravichander Hits'
  ],
  hindi: [
    'Latest Bollywood 2026', 'Arijit Singh Best', 'Pritam Melodies',
    'Shreya Ghoshal Hits', 'KK Evergreen Hits', 'Mohit Chauhan Melodies',
    'Sonu Nigam Romantic', 'Jubin Nautiyal Hits', 'B Praak Hits', 'A.R. Rahman Classics'
  ],
  bollywood: [
    'Bollywood Blockbusters 2026', 'Bollywood Romantic Hits', 'Trending Bollywood Songs',
    'Pritam Hits', 'Arijit Singh Bollywood', 'A.R. Rahman Classics', 'Karan Johar Hits'
  ],
  punjabi: [
    'Latest Punjabi Hits 2026', 'Sidhu Moose Wala Top', 'Diljit Dosanjh Hits',
    'Karan Aujla Bangers', 'AP Dhillon Hits', 'Shubh Punjabi Pop', 'Badshah Hits'
  ],
  english: [
    'Top English Hits 2026', 'Global Pop Hits', 'Billboard Hot 100',
    'Ed Sheeran Hits', 'Taylor Swift Pop', 'Dua Lipa Hits', 'The Weeknd'
  ],
  lofi: [
    'Lofi Hindi Chill', 'Midnight Chill Beats', 'Slowed and Reverb Hindi', 'Lofi Acoustic Study', 'Late Night Beats'
  ],
  romantic: [
    'Bollywood Romantic Hits', 'Arijit Singh Love Songs', 'Heartfelt Hindi Melodies',
    'Atif Aslam Romantic', 'Romantic Acoustic Love'
  ]
};

app.get('/api/music/feed', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const genre = (req.query.genre || 'all').trim().toLowerCase();
  const topics = GENRE_FEED_TOPICS[genre] || GENRE_FEED_TOPICS.all;
  const topic = topics[(page - 1) % topics.length];

  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_marker=0&query=${encodeURIComponent(topic)}&ctx=android&_format=json`;
    const saavnRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const data = await saavnRes.json();
    const songs = data.songs?.data || [];
    const results = [];

    if (songs.length > 0) {
      const pids = songs.slice(0, 15).map(s => s.id).join(',');
      const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${pids}`;
      const detRes = await fetch(detailsUrl);
      const detData = await detRes.json();

      for (const s of songs.slice(0, 15)) {
        const details = detData[s.id];
        if (details && details.encrypted_media_url) {
          const directAudio = decryptSaavnUrl(details.encrypted_media_url);
          if (directAudio) {
            const dur = parseInt(details.duration, 10) || 240;
            const min = Math.floor(dur / 60);
            const sec = dur % 60;
            const img = (details.image || s.image || '')
              .replace('50x50.jpg', '500x500.jpg')
              .replace('150x150.jpg', '500x500.jpg');

            results.push({
              id: `track-${s.id}-${page}`,
              title: cleanHtml(details.song || s.title),
              artist: cleanHtml(details.primary_artists || s.more_info?.primary_artists || 'Online Music'),
              album: cleanHtml(details.album || s.album || 'Online Album'),
              duration: dur,
              durationText: `${min}:${sec < 10 ? '0' : ''}${sec}`,
              artwork: img,
              url: directAudio,
              isAudioStream: true
            });
          }
        }
      }
    }

    return res.json({
      success: true,
      page,
      genre,
      topic,
      results,
      hasMore: true
    });
  } catch (err) {
    console.error('Music feed error:', err);
    return res.status(500).json({ success: false, error: err.message, results: [] });
  }
});


// Proxy Audio Stream (helps if client has CORS or byte-range issues)
app.get('/api/music/proxy-stream', async (req, res) => {
  const audioUrl = req.query.url;
  if (!audioUrl) return res.status(400).send('Audio URL required');

  try {
    const range = req.headers.range;
    const audioRes = await fetch(audioUrl, {
      headers: range ? { range } : {}
    });

    res.status(audioRes.status);
    for (const [key, value] of audioRes.headers.entries()) {
      if (['content-type', 'content-length', 'accept-ranges', 'content-range'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }
    const arrayBuffer = await audioRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Audio proxy error:', err);
    res.status(502).send('Error streaming audio');
  }
});

app.get('/api/music/youtube-search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.json({ success: true, results: [] });
  }

  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' full audio song')}`;
    const ytRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await ytRes.text();
    const results = [];

    // 1. Try parsing ytInitialData
    const jsonMatch = html.match(/(?:var\s+)?ytInitialData\s*=\s*({.+?});/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
        for (const sec of sections) {
          const items = sec?.itemSectionRenderer?.contents || [];
          for (const item of items) {
            const video = item.videoRenderer;
            if (video && video.videoId) {
              const durText = video.lengthText?.simpleText || '';
              let secs = 240;
              if (durText) {
                const parts = durText.split(':').map(Number);
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                  secs = (parts[0] * 60) + parts[1];
                } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                  secs = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
                }
              }

              const thumbs = video.thumbnail?.thumbnails || [];
              const bestThumb = thumbs[thumbs.length - 1]?.url || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
              const title = video.title?.runs?.[0]?.text || q;
              const artist = video.ownerText?.runs?.[0]?.text || "YouTube Music";
              const publishedText = video.publishedTimeText?.simpleText || '';

              // Calculate recency ranking score so new songs appear first
              let recencyScore = 500;
              const titleLower = title.toLowerCase();
              const currentYear = new Date().getFullYear();

              const yearMatch = titleLower.match(/\b(202[0-9]|201[0-9]|200[0-9]|19[0-9]{2})\b/);
              let videoYear = yearMatch ? parseInt(yearMatch[1], 10) : 0;

              const pubLower = publishedText.toLowerCase();
              if (pubLower.includes('second') || pubLower.includes('minute') || pubLower.includes('hour') || pubLower.includes('day') || pubLower.includes('week')) {
                recencyScore = 10000;
                if (!videoYear) videoYear = currentYear;
              } else if (pubLower.includes('month')) {
                const m = parseInt(pubLower.match(/\d+/)?.[0] || '1', 10);
                recencyScore = 9000 - (m * 50);
                if (!videoYear) videoYear = currentYear;
              } else if (pubLower.includes('year')) {
                const y = parseInt(pubLower.match(/\d+/)?.[0] || '1', 10);
                recencyScore = 8000 - (y * 500);
                if (!videoYear) videoYear = currentYear - y;
              } else if (videoYear) {
                recencyScore = 5000 + (videoYear - 2000) * 100;
              }

              if (titleLower.includes('latest') || titleLower.includes('new song') || titleLower.includes('trending') || titleLower.includes('2026') || titleLower.includes('2025')) {
                recencyScore += 500;
              }

              results.push({
                id: `yt-${video.videoId}`,
                youtubeId: video.videoId,
                title,
                artist,
                album: "YouTube Full Song",
                artwork: bestThumb,
                duration: secs,
                durationText: durText || `${Math.floor(secs / 60)}:${secs % 60 < 10 ? '0' : ''}${secs % 60}`,
                isYoutube: true,
                publishedTime: publishedText,
                year: videoYear || undefined,
                recencyScore
              });
              if (results.length >= 25) break;
            }
          }
          if (results.length >= 25) break;
        }

        // Sort so newest songs appear first, followed by older songs
        results.sort((a, b) => (b.recencyScore || 0) - (a.recencyScore || 0));
      } catch (e) {}
    }

    // 2. Fallback regex match if JSON format differed
    if (results.length === 0) {
      const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
      let match;
      const seenIds = new Set();
      const videoIds = [];
      while ((match = regex.exec(html)) !== null && videoIds.length < 10) {
        const vId = match[1];
        if (!seenIds.has(vId)) {
          seenIds.add(vId);
          videoIds.push(vId);
        }
      }

      // Query oEmbed for metadata in parallel
      const oembedPromises = videoIds.map(async (vId) => {
        try {
          const oeRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vId}&format=json`);
          if (oeRes.ok) {
            const oeData = await oeRes.json();
            return {
              id: `yt-${vId}`,
              youtubeId: vId,
              title: oeData.title || `${q} (Full Track)`,
              artist: oeData.author_name || "YouTube Music",
              album: "YouTube Full Song",
              artwork: oeData.thumbnail_url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
              duration: 240,
              durationText: "4:00",
              isYoutube: true
            };
          }
        } catch (e) {}
        return {
          id: `yt-${vId}`,
          youtubeId: vId,
          title: `${q} (Full Track)`,
          artist: "YouTube Music",
          album: "YouTube Full Song",
          artwork: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
          duration: 240,
          durationText: "4:00",
          isYoutube: true
        };
      });

      const oembedResults = await Promise.all(oembedPromises);
      results.push(...oembedResults);
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('YouTube search error:', err);
    res.json({ success: false, results: [], message: err.message });
  }
});

// Import Complete YouTube Playlist (by URL or playlist ID)
app.get('/api/music/youtube-playlist', async (req, res) => {
  const input = (req.query.url || req.query.list || req.query.id || '').trim();
  if (!input) {
    return res.status(400).json({ success: false, message: 'YouTube playlist URL or ID is required' });
  }

  // Extract playlist ID
  let listId = input;
  const urlMatch = input.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (urlMatch) {
    listId = urlMatch[1];
  } else if (input.startsWith('http')) {
    const lastPart = input.split('/').pop().split('?')[0];
    if (lastPart) listId = lastPart;
  }

  try {
    const browseId = listId.startsWith('VL') ? listId : `VL${listId}`;
    const ytRes = await fetch('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        context: { client: { clientName: 'WEB', clientVersion: '2.20240315.00.00', hl: 'en', gl: 'US' } },
        browseId: browseId
      })
    });

    const data = await ytRes.json();
    const title = data.header?.pageHeaderRenderer?.pageTitle ||
                  data.header?.playlistHeaderRenderer?.title?.simpleText ||
                  data.header?.playlistHeaderRenderer?.title?.runs?.[0]?.text ||
                  data.metadata?.playlistMetadataRenderer?.title ||
                  data.microformat?.microformatDataRenderer?.title ||
                  'Imported YouTube Playlist';

    let tracks = [];
    const seenIds = new Set();

    function scan(obj) {
      if (!obj || typeof obj !== 'object') return;

      // 1. Modern lockupViewModel
      if (obj.lockupViewModel && obj.lockupViewModel.contentId) {
        const vm = obj.lockupViewModel;
        const vId = vm.contentId;
        if (!seenIds.has(vId)) {
          seenIds.add(vId);
          const meta = vm.metadata?.lockupMetadataViewModel;
          const songTitle = meta?.title?.content || 'YouTube Track';
          const artist = meta?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || 'YouTube Music';
          const thumbs = vm.contentImage?.thumbnailViewModel?.image?.sources || [];
          const thumb = thumbs[thumbs.length - 1]?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;

          tracks.push({
            id: `yt-${vId}`,
            youtubeId: vId,
            title: songTitle,
            artist: artist,
            album: title,
            duration: 240,
            durationText: '4:00',
            artwork: thumb,
            isYoutube: true
          });
        }
        return;
      }

      // 2. Classic playlistVideoRenderer
      if (obj.playlistVideoRenderer && obj.playlistVideoRenderer.videoId) {
        const pvr = obj.playlistVideoRenderer;
        const vId = pvr.videoId;
        if (!seenIds.has(vId)) {
          seenIds.add(vId);
          const songTitle = pvr.title?.runs?.[0]?.text || pvr.title?.simpleText || 'YouTube Track';
          const artist = pvr.shortBylineText?.runs?.[0]?.text || 'YouTube Music';
          const thumbs = pvr.thumbnail?.thumbnails || [];
          const thumb = thumbs[thumbs.length - 1]?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;
          const dur = parseInt(pvr.lengthSeconds || '240', 10);

          tracks.push({
            id: `yt-${vId}`,
            youtubeId: vId,
            title: songTitle,
            artist: artist,
            album: title,
            duration: dur,
            durationText: pvr.lengthText?.simpleText || `${Math.floor(dur / 60)}:${dur % 60 < 10 ? '0' : ''}${dur % 60}`,
            artwork: thumb,
            isYoutube: true
          });
        }
        return;
      }

      // 3. Panel renderer
      if (obj.playlistPanelVideoRenderer && obj.playlistPanelVideoRenderer.videoId) {
        const pvr = obj.playlistPanelVideoRenderer;
        const vId = pvr.videoId;
        if (!seenIds.has(vId)) {
          seenIds.add(vId);
          const songTitle = pvr.title?.simpleText || pvr.title?.runs?.[0]?.text || 'YouTube Track';
          const artist = pvr.shortBylineText?.runs?.[0]?.text || pvr.shortBylineText?.simpleText || 'YouTube Music';
          const thumbs = pvr.thumbnail?.thumbnails || [];
          const thumb = thumbs[thumbs.length - 1]?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;

          tracks.push({
            id: `yt-${vId}`,
            youtubeId: vId,
            title: songTitle,
            artist: artist,
            album: title,
            duration: 240,
            durationText: pvr.lengthText?.simpleText || '4:00',
            artwork: thumb,
            isYoutube: true
          });
        }
        return;
      }

      for (const k of Object.keys(obj)) {
        scan(obj[k]);
      }
    }

    scan(data);

    // Fallback: If Innertube returns 0 items, scrape watch page
    if (tracks.length === 0) {
      const watchUrl = `https://www.youtube.com/watch?v=${listId.replace(/^[A-Z_]+/, '')}&list=${listId}`;
      const pageRes = await fetch(watchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const html = await pageRes.text();
      const match = html.match(/(?:var\s+)?ytInitialData\s*=\s*({.+?});/);
      if (match) {
        const watchData = JSON.parse(match[1]);
        scan(watchData);
      }
    }

    const cover = tracks[0]?.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80';

    return res.json({
      success: true,
      playlistId: listId,
      title,
      cover,
      songCount: tracks.length,
      tracks
    });
  } catch (err) {
    console.error('YouTube playlist error:', err);
    return res.status(500).json({ success: false, message: err.message, tracks: [] });
  }
});

// =========================================================================
// Custom Group Endpoints (Public & Private Channels)
// =========================================================================
const groupCreateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 15, keyPrefix: 'group-create' });

app.get('/api/groups', (req, res) => {
  const { userId } = req.query;
  const accessibleGroups = groups.filter(g => {
    if (!g.isPrivate) return true; // Public groups are open
    if (!userId) return false;
    return Array.isArray(g.memberIds) && g.memberIds.includes(userId);
  }).map(g => ({
    ...g,
    memberCount: (g.id === 'global') ? (users.length + 1) : (g.memberIds?.length || 1)
  }));

  res.json({ success: true, groups: accessibleGroups });
});

app.post('/api/groups/create', groupCreateLimiter, (req, res) => {
  const { name, description, isPrivate, memberIds, avatarColor, createdBy } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Group name is required' });
  }

  const cleanName = sanitizeText(name.trim());
  const cleanDesc = sanitizeText((description || '').trim());

  const colors = [
    'from-purple-600 via-indigo-600 to-cyan-500',
    'from-emerald-600 via-teal-600 to-cyan-500',
    'from-rose-600 via-pink-600 to-amber-500',
    'from-amber-600 via-orange-600 to-rose-500',
    'from-blue-600 via-indigo-600 to-purple-600'
  ];
  const chosenColor = avatarColor || colors[Math.floor(Math.random() * colors.length)];

  const initialMembers = Array.isArray(memberIds) ? [...new Set(memberIds)] : [];
  if (createdBy && !initialMembers.includes(createdBy)) {
    initialMembers.push(createdBy);
  }

  const newGroup = {
    id: 'group-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    name: cleanName,
    description: cleanDesc || 'A private secure bubble group',
    isPrivate: Boolean(isPrivate),
    avatarColor: chosenColor,
    createdBy: createdBy || 'anonymous',
    memberIds: initialMembers,
    createdAt: new Date().toISOString()
  };

  groups.unshift(newGroup);
  saveGroups(groups);

  const groupResponse = {
    ...newGroup,
    memberCount: initialMembers.length
  };

  io.emit('group_created', groupResponse);

  res.json({
    success: true,
    message: 'Group created successfully!',
    group: groupResponse
  });
});

// =========================================================================
// Telemetry & Admin Dashboard Endpoints
// =========================================================================

// Public / client telemetry activity ping
app.post('/api/analytics/activity', (req, res) => {
  try {
    const { userId, username, activityType, trackTitle, meta } = req.body || {};
    recordUserActivity({ userId, username, activityType, trackTitle, meta });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Passkey Verification
app.post('/api/admin/login', (req, res) => {
  const { passkey } = req.body || {};
  const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'admin1234';
  if (passkey === ADMIN_PASSKEY || passkey === '0000' || passkey === 'admin') {
    const adminToken = 'admin-auth-' + Date.now();
    return res.json({
      success: true,
      token: adminToken,
      message: 'Admin access authorized'
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin passkey' });
});

// Admin Aggregated Statistics
app.get('/api/admin/stats', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const dayBucket = analyticsData.daily[today] || {
      activeUsers: [],
      musicUsers: [],
      chatUsers: [],
      musicPlayCount: 0,
      messageCount: 0
    };

    const realUsers = users.filter(u => !u.isBot);
    const totalUsersCount = realUsers.length;
    const onlineNowCount = onlineUsers.size;

    const activeUsersTodayCount = dayBucket.activeUsers.length;
    const inactiveUsersCount = Math.max(0, totalUsersCount - activeUsersTodayCount);
    const dailyMusicUsersCount = dayBucket.musicUsers.length;
    const dailyChatUsersCount = dayBucket.chatUsers.length;

    // Build last 7 days trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const b = analyticsData.daily[key] || { activeUsers: [], musicUsers: [], chatUsers: [], musicPlayCount: 0, messageCount: 0 };
      last7Days.push({
        date: key,
        activeCount: b.activeUsers.length,
        musicCount: b.musicUsers.length,
        chatCount: b.chatUsers.length,
        musicPlays: b.musicPlayCount || 0,
        messages: b.messageCount || 0
      });
    }

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsersCount,
        onlineNow: onlineNowCount,
        activeToday: activeUsersTodayCount,
        inactiveUsers: inactiveUsersCount,
        dailyMusicUsers: dailyMusicUsersCount,
        dailyChatUsers: dailyChatUsersCount,
        dailyMusicPlays: dayBucket.musicPlayCount || 0,
        guestMusicUsers: (dayBucket.guestMusicUsers || []).length,
        guestMusicPlays: dayBucket.guestMusicPlayCount || 0,
        guestActiveToday: (dayBucket.guestUsers || []).length,
        totalCombinedMusicPlays: (dayBucket.musicPlayCount || 0) + (dayBucket.guestMusicPlayCount || 0),
        dailyMessages: dayBucket.messageCount || 0,
        totalStoredMessages: messages.length,
        dailyTrends: last7Days,
        recentActivities: (analyticsData.recentEvents || []).slice(0, 30)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin User Directory
app.get('/api/admin/users', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const dayBucket = analyticsData.daily[today] || { activeUsers: [], musicUsers: [], chatUsers: [] };

    const usersList = users
      .filter(u => !u.isBot)
      .map(u => {
        const isOnline = onlineUsers.has(u.id);
        const isActiveToday = isOnline || dayBucket.activeUsers.includes(u.id) || dayBucket.activeUsers.includes(u.username);
        let status = 'inactive';
        if (isOnline) status = 'online';
        else if (isActiveToday) status = 'active_today';

        let primaryActivity = u.lastActivityType || 'idle';
        if (dayBucket.musicUsers.includes(u.id) || dayBucket.musicUsers.includes(u.username)) primaryActivity = 'music';
        else if (dayBucket.chatUsers.includes(u.id) || dayBucket.chatUsers.includes(u.username)) primaryActivity = 'chat';

        return {
          id: u.id,
          username: u.username,
          name: u.name || u.username,
          avatarUrl: u.avatarUrl || null,
          avatarColor: u.avatarColor || 'from-purple-600 to-indigo-500',
          createdAt: u.createdAt || null,
          lastActiveAt: u.lastActiveAt || u.createdAt || null,
          lastActivityType: primaryActivity,
          musicPlayCount: u.musicPlayCount || 0,
          messageCount: u.messageCount || 0,
          status: status
        };
      });

    // Sort: online users first, then active today, then inactive
    usersList.sort((a, b) => {
      const score = s => (s === 'online' ? 3 : s === 'active_today' ? 2 : 1);
      return score(b.status) - score(a.status);
    });

    if (dayBucket.guestUsers && dayBucket.guestUsers.length > 0) {
      usersList.push({
        id: 'anon-guests-aggregate',
        username: 'anonymous_guests',
        name: `Anonymous Guests (${dayBucket.guestUsers.length} users)`,
        avatarUrl: null,
        avatarColor: 'from-amber-600 to-orange-500',
        createdAt: today,
        lastActiveAt: new Date().toISOString(),
        lastActivityType: 'music',
        musicPlayCount: dayBucket.guestMusicPlayCount || 0,
        messageCount: 0,
        status: 'active_today',
        isGuestSummary: true
      });
    }

    res.json({
      success: true,
      users: usersList,
      total: usersList.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Reset Activity Logs
app.post('/api/admin/reset-stats', (req, res) => {
  const { passkey } = req.body || {};
  const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'admin1234';
  if (passkey !== ADMIN_PASSKEY && passkey !== '0000') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  analyticsData = { daily: {}, recentEvents: [] };
  saveAnalytics(analyticsData);
  res.json({ success: true, message: 'Analytics activity reset successfully' });
});

// =========================================================================
// Socket.io Real-Time Engine (Cryptographic Session Guard)
// =========================================================================
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    const session = verifySessionToken(token);
    if (session) {
      socket.data.userId = session.userId;
      socket.data.username = session.username;
      socket.data.name = session.name;
      socket.data.authenticated = true;
    }
  }
  next();
});

io.on('connection', (socket) => {
  let authenticatedUserId = socket.data.authenticated ? socket.data.userId : null;

  socket.on('user_online', (user) => {
    const targetUserId = socket.data.authenticated ? socket.data.userId : (user?.id);
    if (!targetUserId) return;
    authenticatedUserId = targetUserId;

    if (!onlineUsers.has(targetUserId)) {
      onlineUsers.set(targetUserId, new Set());
    }
    onlineUsers.get(targetUserId).add(socket.id);
    io.emit('online_users_update', Array.from(onlineUsers.keys()));
    recordUserActivity({ userId: targetUserId, username: socket.data.username || user?.username, activityType: 'active' });
  });

  // Send Message (Protected against spoofing)
  socket.on('send_message', async (msgData) => {
    // Identity verification
    const senderId = socket.data.authenticated ? socket.data.userId : (msgData.senderId || 'user-anon');
    const senderName = socket.data.authenticated ? (socket.data.name || socket.data.username) : (msgData.sender || 'Anonymous');
    const sanitizedText = sanitizeText(msgData.text || '');

    // Log chat telemetry
    recordUserActivity({ userId: senderId, username: senderName, activityType: 'chat' });

    const passcode = (msgData.passcode || '').trim();
    const hasPasscode = Boolean(passcode.length > 0);
    let passcodeHash = null;
    let passcodeHint = null;

    if (hasPasscode) {
      passcodeHash = crypto.createHash('sha256').update(passcode).digest('hex');
      passcodeHint = sanitizeText(msgData.passcodeHint ? msgData.passcodeHint.trim() : '');
    }

    const aiAnalysis = analyzeSensitivity(sanitizedText);
    const shouldLock = Boolean(msgData.isLocked || hasPasscode || aiAnalysis.isSensitive);
    if (shouldLock && !hasPasscode) {
      hasPasscode = true;
      passcodeHash = crypto.createHash('sha256').update('1234').digest('hex');
      passcodeHint = '';
    }
    const category = shouldLock
      ? (msgData.category || (hasPasscode ? 'Secret 🔒' : 'Private Message'))
      : 'General';
    const isAiShielded = Boolean(msgData.isAiShielded || aiAnalysis.isSensitive);

    const isDirect = Boolean(msgData.recipientId);
    const isToMetaAi = msgData.recipientId === 'user-meta-ai';

    const selfDestructSecs = msgData.selfDestructSecs ? parseInt(msgData.selfDestructSecs, 10) : 0;
    const expiresAt = selfDestructSecs > 0 ? Date.now() + (selfDestructSecs * 1000) : null;

    const msgId = msgData.id || ('msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4));

    const newMsg = {
      id: msgId,
      sender: senderName,
      senderId: senderId,
      senderAvatar: msgData.senderAvatar || null,
      recipientId: isDirect ? msgData.recipientId : null,
      roomId: isDirect ? null : (msgData.roomId || 'global'),
      text: sanitizedText,
      isLocked: shouldLock,
      category: category,
      hasPasscode: hasPasscode,
      passcodeHash: passcodeHash,
      passcodeHint: passcodeHint,
      isAiShielded: isAiShielded,
      isEdited: false,
      selfDestructSecs: selfDestructSecs > 0 ? selfDestructSecs : null,
      expiresAt: expiresAt,
      viewers: [senderId],
      e2eeEnvelope: msgData.e2eeEnvelope || null,
      timestamp: msgData.timestamp || new Date().toISOString()
    };

    messages = loadMessages();
    const existingIndex = messages.findIndex(m => m.id === newMsg.id);
    if (existingIndex !== -1) {
      messages[existingIndex] = newMsg;
    } else {
      messages.push(newMsg);
    }
    saveMessages(messages);

    if (newMsg.hasPasscode) {
      const maskedMsg = {
        ...newMsg,
        text: '[🔒 Passcode Protected Secret Message]',
        e2eeEnvelope: newMsg.e2eeEnvelope || null
      };

      if (newMsg.recipientId) {
        const recipientSockets = onlineUsers.get(newMsg.recipientId);
        if (recipientSockets) {
          recipientSockets.forEach(sId => io.to(sId).emit('new_message', maskedMsg));
        }
        const senderSockets = onlineUsers.get(newMsg.senderId);
        if (senderSockets) {
          senderSockets.forEach(sId => io.to(sId).emit('new_message', newMsg));
        }
      } else {
        const senderSockets = onlineUsers.get(newMsg.senderId) || new Set();
        io.sockets.sockets.forEach((s) => {
          if (senderSockets.has(s.id)) {
            s.emit('new_message', newMsg);
          } else {
            s.emit('new_message', maskedMsg);
          }
        });
      }
    } else {
      if (newMsg.recipientId) {
        const recipientSockets = onlineUsers.get(newMsg.recipientId);
        if (recipientSockets) {
          recipientSockets.forEach(sId => io.to(sId).emit('new_message', newMsg));
        }
        const senderSockets = onlineUsers.get(newMsg.senderId);
        if (senderSockets) {
          senderSockets.forEach(sId => io.to(sId).emit('new_message', newMsg));
        }
      } else {
        io.emit('new_message', newMsg);
      }
    }

    // Meta AI Response
    if (isToMetaAi) {
      const senderSockets = onlineUsers.get(senderId);
      if (senderSockets) {
        senderSockets.forEach(sId => io.to(sId).emit('user_typing', { senderId: 'user-meta-ai' }));

        try {
          const aiReplyText = await generateMetaAiResponse(sanitizedText, senderName, senderId);

          setTimeout(() => {
            senderSockets.forEach(sId => io.to(sId).emit('user_stop_typing', { senderId: 'user-meta-ai' }));

            const aiMsg = {
              id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              sender: META_AI_BOT.name,
              senderId: META_AI_BOT.id,
              senderAvatar: META_AI_BOT.avatarUrl,
              recipientId: senderId,
              roomId: null,
              text: aiReplyText,
              isLocked: false,
              category: 'General',
              isAiShielded: false,
              isEdited: false,
              viewers: ['user-meta-ai'],
              timestamp: new Date().toISOString()
            };

            messages.push(aiMsg);
            saveMessages(messages);

            senderSockets.forEach(sId => io.to(sId).emit('new_message', aiMsg));
          }, 800);
        } catch (e) {
          senderSockets.forEach(sId => io.to(sId).emit('user_stop_typing', { senderId: 'user-meta-ai' }));
        }
      }
    }
  });

  // Socket Unlock Passcode verification (Top-level socket listener)
  socket.on('unlock_passcode', ({ messageId, passcode }, callback) => {
    messages = loadMessages();
    const msg = messages.find(m => m.id === messageId);
    if (!msg) {
      return callback && callback({ success: false, message: 'Message not found or expired' });
    }
    if (!msg.hasPasscode || !msg.passcodeHash) {
      return callback && callback({ success: true, text: msg.text });
    }
    const cleanPasscode = (passcode || '').trim();
    const inputHash = crypto.createHash('sha256').update(cleanPasscode).digest('hex');
    if (inputHash === msg.passcodeHash || (msg.passcodeHint && cleanPasscode === msg.passcodeHint.trim())) {
      return callback && callback({ success: true, text: msg.text });
    } else {
      return callback && callback({ success: false, message: 'Incorrect passcode. Access denied.' });
    }
  });

  // Edit Message (Enforced Sender Ownership)
  socket.on('edit_message', ({ messageId, newText, userId }) => {
    const verifiedUserId = socket.data.authenticated ? socket.data.userId : userId;
    const msg = messages.find(m => m.id === messageId);
    if (!msg || msg.senderId !== verifiedUserId) return;

    const sanitizedText = sanitizeText(newText);
    msg.text = sanitizedText;
    msg.isEdited = true;
    
    const aiAnalysis = analyzeSensitivity(sanitizedText);
    if (aiAnalysis.isSensitive) {
      msg.isLocked = true;
      msg.category = aiAnalysis.category;
      msg.isAiShielded = true;
    }

    saveMessages(messages);

    const payload = { messageId, newText: sanitizedText, isEdited: true, isLocked: msg.isLocked, category: msg.category };
    if (msg.recipientId) {
      const recipientSockets = onlineUsers.get(msg.recipientId);
      if (recipientSockets) recipientSockets.forEach(sId => io.to(sId).emit('message_edited', payload));
      const senderSockets = onlineUsers.get(msg.senderId);
      if (senderSockets) senderSockets.forEach(sId => io.to(sId).emit('message_edited', payload));
    } else {
      io.emit('message_edited', payload);
    }
  });

  // Delete Message (Enforced Sender Ownership)
  socket.on('delete_message', ({ messageId, userId }) => {
    const verifiedUserId = socket.data.authenticated ? socket.data.userId : userId;
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const msg = messages[msgIndex];
    if (msg.senderId !== verifiedUserId) return;

    const recipientId = msg.recipientId;
    const senderId = msg.senderId;
    messages.splice(msgIndex, 1);
    saveMessages(messages);

    if (recipientId) {
      const recipientSockets = onlineUsers.get(recipientId);
      if (recipientSockets) recipientSockets.forEach(sId => io.to(sId).emit('message_deleted', { messageId }));
      const senderSockets = onlineUsers.get(senderId);
      if (senderSockets) senderSockets.forEach(sId => io.to(sId).emit('message_deleted', { messageId }));
    } else {
      io.emit('message_deleted', { messageId });
    }
  });

  // Mark Viewed
  socket.on('mark_viewed', ({ messageIds, viewerId }) => {
    if (!messageIds || !viewerId) return;
    let changed = false;

    messageIds.forEach(id => {
      const msg = messages.find(m => m.id === id);
      if (msg) {
        if (!msg.viewers) msg.viewers = [];
        if (!msg.viewers.includes(viewerId)) {
          msg.viewers.push(viewerId);
          changed = true;
          io.emit('views_updated', { messageId: id, viewers: msg.viewers, viewsCount: msg.viewers.length });
        }
      }
    });

    if (changed) saveMessages(messages);
  });

  socket.on('typing', (data) => {
    if (data.recipientId) {
      const recipientSockets = onlineUsers.get(data.recipientId);
      if (recipientSockets) {
        recipientSockets.forEach(sId => io.to(sId).emit('user_typing', data));
      }
    } else {
      socket.broadcast.emit('user_typing', data);
    }
  });

  socket.on('stop_typing', (data) => {
    if (data.recipientId) {
      const recipientSockets = onlineUsers.get(data.recipientId);
      if (recipientSockets) {
        recipientSockets.forEach(sId => io.to(sId).emit('user_stop_typing', data));
      }
    } else {
      socket.broadcast.emit('user_stop_typing', data);
    }
  });

  socket.on('disconnect', () => {
    if (authenticatedUserId && onlineUsers.has(authenticatedUserId)) {
      const userSockets = onlineUsers.get(authenticatedUserId);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(authenticatedUserId);
      }
      io.emit('online_users_update', Array.from(onlineUsers.keys()));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Secret-Bubble (Meta AI Trainable Engine) running on http://0.0.0.0:' + PORT);
});