import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { io } from 'socket.io-client';
import { Shield, Lock, Globe, EyeOff, Bot, Sparkles } from 'lucide-react';
import StealthMusicPlayer from './components/StealthMusicPlayer';
import LoginPage from './components/LoginPage';
import { useBiometrics } from './hooks/useBiometrics';
import { decryptE2EE, isE2EEEncrypted } from './utils/e2eeCrypto';

// Code-split heavy modals and chat components for fast initial load
const ChatHeader = lazy(() => import('./components/ChatHeader'));
const MessageItem = lazy(() => import('./components/MessageItem'));
const ChatInput = lazy(() => import('./components/ChatInput'));
const UserSidebar = lazy(() => import('./components/UserSidebar'));
const BiometricModal = lazy(() => import('./components/BiometricModal'));
const PrivacySettingsModal = lazy(() => import('./components/PrivacySettingsModal'));
const ProfileModal = lazy(() => import('./components/ProfileModal'));
const AppLockModal = lazy(() => import('./components/AppLockModal'));
const AiTrainingModal = lazy(() => import('./components/AiTrainingModal'));
const CreateGroupModal = lazy(() => import('./components/CreateGroupModal'));
const InstallAppModal = lazy(() => import('./components/InstallAppModal'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const WelcomeOnboardingModal = lazy(() => import('./components/WelcomeOnboardingModal'));

const getBackendUrl = () => {
  if (import.meta.env?.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Detect if running inside Android/iOS Capacitor native app
  const isNativeApp = typeof window !== 'undefined' && (
    Boolean(window.Capacitor?.isNativePlatform?.()) ||
    Boolean(window.Capacitor) ||
    window.location?.protocol === 'capacitor:' ||
    (window.location?.hostname === 'localhost' && !window.location?.port && !import.meta.env.DEV)
  );

  if (isNativeApp) {
    return 'https://secret-bubble-backend.onrender.com';
  }

  // Only use local machine port 5000 in Vite development server mode
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const hostname = window.location.hostname || 'localhost';
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return `http://${hostname}:5000`;
    }
  }

  return 'https://secret-bubble-backend.onrender.com';
};

const DEFAULT_SETTINGS = {
  aiEnabled: true,
  autoRelockSeconds: 15,
  antiShoulderSurfing: true,
  idleLockMinutes: 5,
  stealthMusicDisguise: false,
  stealthPin: '1234',
  decoyPin: '9999',
  categories: {
    adult_intimacy: true,
    romance_feelings: true,
    secrets_confidential: true,
    financial_credentials: true
  }
};

// Robust deduplicator to prevent double message rendering or duplicate cached history
function deduplicateMessages(msgList) {
  if (!Array.isArray(msgList)) return [];
  const seenIds = new Set();
  const result = [];
  for (const m of msgList) {
    if (!m || !m.id) continue;
    if (seenIds.has(m.id)) continue;
    seenIds.add(m.id);

    // Duplicate check: if a message with the exact same sender, text, and sent within 4s already exists, collapse it
    const isDup = result.some(prev => 
      prev.senderId === m.senderId &&
      prev.text === m.text &&
      Math.abs(new Date(prev.timestamp).getTime() - new Date(m.timestamp).getTime()) < 4000
    );
    if (!isDup) {
      result.push(m);
    }
  }
  return result;
}

export default function App() {
  const [isStealthMode, setIsStealthMode] = useState(() => {
    try {
      // By default on initial load or fresh open, always show the disguise Music Player
      const sessionUnlocked = sessionStorage.getItem('secret_bubble_session_unlocked') === 'true';
      return !sessionUnlocked;
    } catch {
      return true;
    }
  });
  const [isDecoySession, setIsDecoySession] = useState(false);
  
  // Robust check if app is already installed, running in Capacitor APK, or standalone PWA
  const checkAppInstalledStatus = () => {
    try {
      if (typeof window === 'undefined') return false;
      // 1. Stored installation / download flags
      if (
        localStorage.getItem('secret_bubble_app_installed') === 'true' ||
        localStorage.getItem('secret_bubble_apk_downloaded') === 'true' ||
        localStorage.getItem('secret_bubble_app_downloaded') === 'true'
      ) {
        return true;
      }
      // 2. Native Capacitor Android App environment
      if (
        Boolean(window.Capacitor?.isNativePlatform?.()) ||
        Boolean(window.Capacitor) ||
        window.location?.protocol === 'capacitor:' ||
        (window.location?.hostname === 'localhost' && !window.location?.port && !window.location?.host?.includes(':')) ||
        (window.navigator?.userAgent && (
          window.navigator.userAgent.includes('Capacitor') ||
          window.navigator.userAgent.includes('SecretBubbleApp')
        ))
      ) {
        try {
          localStorage.setItem('secret_bubble_app_installed', 'true');
        } catch {}
        return true;
      }
      // 3. Standalone PWA / Web APK / Fullscreen display mode
      if (
        (window.matchMedia && (
          window.matchMedia('(display-mode: standalone)').matches ||
          window.matchMedia('(display-mode: minimal-ui)').matches ||
          window.matchMedia('(display-mode: fullscreen)').matches ||
          window.matchMedia('(display-mode: window-controls-overlay)').matches
        )) ||
        (window.navigator && window.navigator.standalone === true) ||
        (document.referrer && document.referrer.includes('android-app://'))
      ) {
        try {
          localStorage.setItem('secret_bubble_app_installed', 'true');
        } catch {}
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const [isAppInstalled, setIsAppInstalled] = useState(checkAppInstalledStatus);

  // Never auto-popup install dialog on fresh open if already installed or dismissed
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    // If detected as installed, persist flag
    if (checkAppInstalledStatus()) {
      setIsAppInstalled(true);
      try {
        localStorage.setItem('secret_bubble_app_installed', 'true');
      } catch {}
    }

    const handleAppInstalled = () => {
      try {
        localStorage.setItem('secret_bubble_app_installed', 'true');
        localStorage.setItem('secret_bubble_apk_downloaded', 'true');
        localStorage.setItem('secret_bubble_install_dismissed', 'true');
      } catch {}
      setIsAppInstalled(true);
      setShowInstallModal(false);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'secret_bubble_app_installed' || e.key === 'secret_bubble_apk_downloaded') {
        setIsAppInstalled(checkAppInstalledStatus());
      }
    };

    const handleCustomInstallEvent = () => {
      setIsAppInstalled(true);
      setShowInstallModal(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('secret_bubble_installed', handleCustomInstallEvent);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('secret_bubble_installed', handleCustomInstallEvent);
    };
  }, []);

  const handleCloseInstallModal = () => {
    setShowInstallModal(false);
    try {
      localStorage.setItem('secret_bubble_install_dismissed', 'true');
      sessionStorage.setItem('secret_bubble_install_dismissed', 'true');
    } catch {}
  };

  const handleAppMarkedInstalled = () => {
    try {
      localStorage.setItem('secret_bubble_app_installed', 'true');
      localStorage.setItem('secret_bubble_apk_downloaded', 'true');
      localStorage.setItem('secret_bubble_install_dismissed', 'true');
    } catch {}
    setIsAppInstalled(true);
    setShowInstallModal(false);
  };

  // Only expose install handler if the app is NOT already downloaded/installed
  const openInstallHandler = !isAppInstalled ? () => setShowInstallModal(true) : undefined;

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('secure_chat_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('secure_chat_token') || null;
  });

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const user = localStorage.getItem('secure_chat_user');
      const onboarded = localStorage.getItem('secret_bubble_onboarded');
      return !user && !onboarded;
    } catch {
      return false;
    }
  });

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState({ type: 'room', id: 'global', name: '🌍 Global Public Chat' });
  const [messages, setMessages] = useState(() => {
    try {
      const cached = localStorage.getItem('secure_chat_cache_room_global');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          // Filter out any stale dummy messages from early development and deduplicate
          return deduplicateMessages(
            parsed.filter(m => m.senderId !== 'user-priya' && m.senderId !== 'user-rahul')
          );
        }
      }
      return [];
    } catch {
      return [];
    }
  });
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(() => {
    try {
      return typeof window !== 'undefined' && window.location.hash === '#admin';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setShowAdminDashboard(true);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [isAiTrainingOpen, setIsAiTrainingOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [unlockedPasscodeTexts, setUnlockedPasscodeTexts] = useState({});

  const selectedTargetRef = useRef(selectedTarget);
  useEffect(() => {
    selectedTargetRef.current = selectedTarget;
  }, [selectedTarget]);

  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const backendUrl = useMemo(() => getBackendUrl(), []);

  // Session token verification against backend on startup & purge old dummy cache
  useEffect(() => {
    try {
      const globalCache = localStorage.getItem('secure_chat_cache_room_global');
      if (globalCache && (globalCache.includes('user-priya') || globalCache.includes('user-rahul'))) {
        localStorage.removeItem('secure_chat_cache_room_global');
        setMessages([]);
      }
    } catch {}

    const token = localStorage.getItem('secure_chat_token');
    if (!token) {
      if (currentUser) {
        setCurrentUser(null);
        localStorage.removeItem('secure_chat_user');
      }
      return;
    }

    fetch(`${backendUrl}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('secure_chat_user', JSON.stringify(data.user));
        } else {
          // If server is cold-booting or restarted, do not immediately erase user
          console.warn('Session verification notice:', data?.message);
        }
      })
      .catch((err) => {
        // Offline / network failure / cold boot - retain state for offline usage
        console.warn('Backend connection notice:', err?.message || err);
      });
  }, [backendUrl]);

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('secure_chat_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('secure_chat_settings', JSON.stringify(newSettings));
      if (newSettings.stealthPin) {
        localStorage.setItem('secret_bubble_secret_pin', newSettings.stealthPin);
        localStorage.setItem('secret_bubble_pins_configured', 'true');
      }
      if (newSettings.decoyPin) {
        localStorage.setItem('secret_bubble_decoy_pin', newSettings.decoyPin);
      }
    } catch {}
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('secure_chat_user', JSON.stringify(updatedUser));
    } catch {}
    fetchUsers();
  };

  const messagesEndRef = useRef(null);

  const {
    isWebAuthnSupported,
    activePromptMsg,
    triggerUnlock,
    completeUnlock,
    cancelUnlock,
    relockMessage,
    relockAll,
    isUnlocked,
    getRemainingSeconds
  } = useBiometrics(settings.autoRelockSeconds);

  // Anti-Shoulder Surfing Window Blur Protection
  useEffect(() => {
    if (!settings.antiShoulderSurfing) return;

    const handleBlur = () => setIsWindowBlurred(true);
    const handleFocus = () => setIsWindowBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [settings.antiShoulderSurfing]);

  // Automatic Idle Inactivity Lock Timer
  useEffect(() => {
    if (!settings.idleLockMinutes || settings.idleLockMinutes <= 0 || isAppLocked || !currentUser) {
      return;
    }

    let idleTimeoutId;
    const timeoutMs = settings.idleLockMinutes * 60 * 1000;

    const resetIdleTimer = () => {
      clearTimeout(idleTimeoutId);
      idleTimeoutId = setTimeout(() => {
        setIsAppLocked(true);
      }, timeoutMs);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeoutId);
      events.forEach(ev => window.removeEventListener(ev, resetIdleTimer));
    };
  }, [settings.idleLockMinutes, isAppLocked, currentUser]);

  // Disappearing messages local cleanup
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setMessages(prev => {
        const remaining = prev.filter(m => !m.expiresAt || now < m.expiresAt);
        if (remaining.length !== prev.length) return remaining;
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Users List
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      // Offline fallback: Meta AI Bot
      setUsers([
        {
          id: 'user-meta-ai',
          username: 'meta_ai',
          name: 'Meta AI Assistant',
          isBot: true,
          avatarColor: 'from-blue-600 via-indigo-500 to-cyan-400',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=MetaAI&backgroundColor=6366f1',
          isOnline: true
        }
      ]);
    }
  }, [backendUrl]);

  // Fetch Groups List
  const fetchGroups = useCallback(async () => {
    if (!currentUserRef.current) return;
    try {
      const res = await fetch(`${backendUrl}/api/groups?userId=${currentUserRef.current.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.groups)) {
        setGroups(data.groups);
      }
    } catch (e) {}
  }, [backendUrl]);

  // Load cached messages immediately when target switches
  useEffect(() => {
    try {
      const key = `secure_chat_cache_${selectedTarget.type}_${selectedTarget.id}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setMessages(deduplicateMessages(parsed));
        }
      }
    } catch {}
  }, [selectedTarget.type, selectedTarget.id]);

  // Fetch Messages for current selected target
  const fetchMessages = useCallback(async () => {
    if (!currentUserRef.current) return;
    try {
      const currentTarget = selectedTargetRef.current;
      let url = `${backendUrl}/api/messages`;
      if (currentTarget.type === 'room') {
        url += `?roomId=${currentTarget.id}&userId=${currentUserRef.current.id}`;
      } else {
        url += `?userId=${currentUserRef.current.id}&targetId=${currentTarget.id}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        const deduped = deduplicateMessages(data.messages);
        setMessages(deduped);
        try {
          const key = `secure_chat_cache_${currentTarget.type}_${currentTarget.id}`;
          localStorage.setItem(key, JSON.stringify(deduped.slice(-100)));
        } catch {}
        
        // Mark viewed
        if (socket && data.messages.length > 0) {
          const unviewedIds = data.messages
            .filter(m => !m.viewers || !m.viewers.includes(currentUserRef.current.id))
            .map(m => m.id);
          if (unviewedIds.length > 0) {
            socket.emit('mark_viewed', { messageIds: unviewedIds, viewerId: currentUserRef.current.id });
          }
        }
      }
    } catch (e) {}
  }, [backendUrl, socket]);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchGroups();
      fetchMessages();
    }
  }, [currentUser, selectedTarget, fetchUsers, fetchGroups, fetchMessages]);

  // Socket.io Connection Setup with Cryptographic Token
  useEffect(() => {
    if (!currentUser) return;

    const s = io(backendUrl, {
      reconnectionAttempts: 10,
      timeout: 5000,
      auth: {
        token: authToken
      }
    });

    s.on('connect', () => {
      setConnectionStatus('connected');
      s.emit('user_online', currentUser);
      fetchUsers();
      fetchGroups();
    });

    s.on('online_users_update', (onlineIds) => {
      setUsers(prev => {
        const hasMissingUser = Array.isArray(onlineIds) && onlineIds.some(id => id !== 'user-meta-ai' && !prev.some(u => u.id === id));
        if (hasMissingUser) {
          fetchUsers();
        }
        return prev.map(u => ({
          ...u,
          isOnline: u.isBot ? true : onlineIds.includes(u.id)
        }));
      });
    });

    s.on('user_registered', (newUser) => {
      setUsers(prev => {
        if (prev.some(u => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
    });

    s.on('user_updated', () => {
      fetchUsers();
    });

    s.on('group_created', (newGroup) => {
      setGroups(prev => {
        if (prev.some(g => g.id === newGroup.id)) return prev;
        return [newGroup, ...prev];
      });
    });

    s.on('new_message', (msg) => {
      const currentTarget = selectedTargetRef.current;
      const user = currentUserRef.current;
      if (!user) return;

      const isForCurrentTarget =
        currentTarget.type === 'room'
          ? (!msg.recipientId && (msg.roomId === currentTarget.id || (!msg.roomId && currentTarget.id === 'global')))
          : (currentTarget.type === 'user' &&
              Boolean(msg.recipientId) &&
              ((msg.senderId === currentTarget.id && msg.recipientId === user.id) ||
               (msg.senderId === user.id && msg.recipientId === currentTarget.id)));

      if (isForCurrentTarget) {
        setMessages(prev => {
          // Check if message with this ID already exists
          const existingIdx = prev.findIndex(m => m.id === msg.id);
          if (existingIdx !== -1) {
            const updated = [...prev];
            updated[existingIdx] = { ...updated[existingIdx], ...msg };
            return updated;
          }

          // Check if it's an optimistic duplicate from this sender (same text, sent within 4s)
          const optIdx = prev.findIndex(m => 
            m.senderId === msg.senderId &&
            m.text === msg.text &&
            Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 4000
          );
          if (optIdx !== -1) {
            const updated = [...prev];
            updated[optIdx] = msg;
            try {
              const key = `secure_chat_cache_${currentTarget.type}_${currentTarget.id}`;
              localStorage.setItem(key, JSON.stringify(updated.slice(-100)));
            } catch {}
            return updated;
          }

          const updated = deduplicateMessages([...prev, msg]);
          try {
            const key = `secure_chat_cache_${currentTarget.type}_${currentTarget.id}`;
            localStorage.setItem(key, JSON.stringify(updated.slice(-100)));
          } catch {}
          return updated;
        });

        // Auto mark as viewed
        s.emit('mark_viewed', { messageIds: [msg.id], viewerId: user.id });
      } else if (msg.recipientId === user.id && msg.senderId !== user.id) {
        const fromId = msg.senderId;
        setUnreadCounts(prev => ({
          ...prev,
          [fromId]: (prev[fromId] || 0) + 1
        }));
      }
    });

    s.on('message_edited', ({ messageId, newText, isEdited, isLocked, category }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          return { ...m, text: newText, isEdited: true, isLocked, category };
        }
        return m;
      }));
    });

    s.on('message_deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    });

    s.on('views_updated', ({ messageId, viewers, viewsCount }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          return { ...m, viewers: viewers || (m.viewers ? [...m.viewers] : []) };
        }
        return m;
      }));
    });

    s.on('user_typing', (data) => {
      const user = currentUserRef.current;
      if (user && data.senderId !== user.id) {
        setTypingUsers(prev => ({ ...prev, [data.senderId]: true }));
      }
    });

    s.on('stop_typing', (data) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[data.senderId];
        return next;
      });
    });

    s.on('chat_reset', () => {
      setMessages([]);
      relockAll();
    });

    s.on('connect_error', () => {
      setConnectionStatus('disconnected');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [currentUser?.id, backendUrl, fetchUsers, relockAll]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (msgData) => {
    if (!currentUser) return;

    const isDirect = selectedTarget.type === 'user';
    const payload = {
      ...msgData,
      id: msgData.id || ('msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
      sender: currentUser.name,
      senderId: currentUser.id,
      senderAvatar: currentUser.avatarUrl || null,
      recipientId: isDirect ? selectedTarget.id : null,
      roomId: isDirect ? null : (selectedTarget.id || 'global'),
      timestamp: new Date().toISOString()
    };

    // Optimistically update UI and update local storage cache immediately
    setMessages(prev => {
      if (prev.some(m => m.id === payload.id)) return prev;
      const updated = deduplicateMessages([...prev, payload]);
      try {
        const key = `secure_chat_cache_${selectedTarget.type}_${selectedTarget.id}`;
        localStorage.setItem(key, JSON.stringify(updated.slice(-100)));
      } catch {}
      return updated;
    });

    if (socket && connectionStatus === 'connected') {
      socket.emit('send_message', payload);
    } else {
      // Fallback: POST via HTTP REST API to guarantee disk persistence
      try {
        await fetch(`${backendUrl}/api/messages/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('HTTP fallback message save error:', err);
      }

      // Offline Meta AI response fallback
      if (payload.recipientId === 'user-meta-ai') {
        setTimeout(() => {
          const aiMsg = {
            id: 'msg-' + (Date.now() + 1),
            sender: 'Meta AI Assistant',
            senderId: 'user-meta-ai',
            senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MetaAI&backgroundColor=6366f1',
            recipientId: currentUser.id,
            roomId: null,
            text: `🤖 **Meta AI:** Hello ${currentUser.name}! I am your AI assistant in Secret-Bubble. How can I help you with privacy, messaging, or answers today?`,
            isLocked: false,
            category: 'General',
            isAiShielded: false,
            isEdited: false,
            viewers: ['user-meta-ai'],
            timestamp: new Date().toISOString()
          };
          setMessages(prev => {
            const updated = [...prev, aiMsg];
            try {
              const key = `secure_chat_cache_${selectedTarget.type}_${selectedTarget.id}`;
              localStorage.setItem(key, JSON.stringify(updated.slice(-100)));
            } catch {}
            return updated;
          });
        }, 800);
      }
    }
  };

  const handleEditMessage = (messageId, newText) => {
    if (socket && currentUser) {
      socket.emit('edit_message', { messageId, newText, userId: currentUser.id });
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (socket && currentUser) {
      socket.emit('delete_message', { messageId, userId: currentUser.id });
    }
  };

  const handleTyping = () => {
    if (socket && currentUser) {
      socket.emit('typing', {
        senderId: currentUser.id,
        recipientId: selectedTarget.type === 'user' ? selectedTarget.id : null
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && currentUser) {
      socket.emit('stop_typing', {
        senderId: currentUser.id,
        recipientId: selectedTarget.type === 'user' ? selectedTarget.id : null
      });
    }
  };

  const handleSelectTarget = (target) => {
    setSelectedTarget(target);
    setIsSidebarOpen(false);
    relockAll();
    if (target.id) {
      setUnreadCounts(prev => ({ ...prev, [target.id]: 0 }));
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev.filter(g => g.id !== newGroup.id)]);
    handleSelectTarget({
      type: 'room',
      id: newGroup.id,
      name: newGroup.name,
      isGroup: true,
      ...newGroup
    });
  };

  const handleUnlockPasscodeMessage = useCallback(async (messageId, passcode) => {
    try {
      // 1. Client-Side Zero-Knowledge E2EE Decryption
      const targetMsg = messages.find(m => m.id === messageId);
      const e2eeCandidate = targetMsg?.e2eeEnvelope || (targetMsg && isE2EEEncrypted(targetMsg.text) ? targetMsg.text : null);
      if (e2eeCandidate) {
        const localDecrypted = await decryptE2EE(e2eeCandidate, passcode);
        if (localDecrypted) {
          setUnlockedPasscodeTexts(prev => ({
            ...prev,
            [messageId]: localDecrypted
          }));
          // Notify server asynchronously for view counting
          fetch(`${backendUrl}/api/messages/unlock-passcode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, passcode })
          }).catch(() => {});
          return { success: true, text: localDecrypted, isE2ee: true };
        }
      }

      // 2. Server API fallback for server-hashed messages
      const res = await fetch(`${backendUrl}/api/messages/unlock-passcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, passcode })
      });
      const data = await res.json();
      if (data.success && data.text) {
        let finalText = data.text;
        const envelope = data.e2eeEnvelope || (isE2EEEncrypted(data.text) ? data.text : null);
        if (envelope) {
          const decryptedFromEnvelope = await decryptE2EE(envelope, passcode);
          if (decryptedFromEnvelope) {
            finalText = decryptedFromEnvelope;
          }
        }
        setUnlockedPasscodeTexts(prev => ({
          ...prev,
          [messageId]: finalText
        }));
        return { success: true, text: finalText };
      }
      return { success: false, message: data.message || 'Incorrect passcode' };
    } catch (err) {
      return { success: false, message: 'Decryption failed or server error' };
    }
  }, [backendUrl, messages]);

  const handleRelockPasscodeMessage = useCallback((messageId) => {
    setUnlockedPasscodeTexts(prev => {
      const next = { ...prev };
      delete next[messageId];
      return next;
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('secure_chat_user');
    localStorage.removeItem('secure_chat_token');
    try {
      sessionStorage.removeItem('secret_bubble_session_unlocked');
    } catch {}
    setAuthToken(null);
    setCurrentUser(null);
    setMessages([]);
    setUnlockedPasscodeTexts({});
    setIsStealthMode(true);
    if (socket) socket.disconnect();
  };

  if (isStealthMode) {
    return (
      <>
        <StealthMusicPlayer
          currentUser={currentUser}
          secretPin={settings.stealthPin || '1234'}
          decoyPin={settings.decoyPin || '9999'}
          backendUrl={getBackendUrl()}
          onOpenInstall={openInstallHandler}
          onOpenAdmin={() => setShowAdminDashboard(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onUnlock={(isDecoy) => {
            setIsStealthMode(false);
            setIsDecoySession(Boolean(isDecoy));
            try {
              sessionStorage.setItem('secret_bubble_session_unlocked', 'true');
              localStorage.setItem('secret_bubble_stealth_active', 'false');
            } catch {}
          }}
        />
        <Suspense fallback={null}>
          <WelcomeOnboardingModal
            isOpen={showOnboarding}
            onComplete={(user) => {
              setCurrentUser(user);
              setShowOnboarding(false);
              fetchUsers();
            }}
            backendUrl={backendUrl}
          />
          <InstallAppModal
            isOpen={showInstallModal && !isAppInstalled}
            onClose={handleCloseInstallModal}
            onInstalled={handleAppMarkedInstalled}
          />
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            currentUser={currentUser || { name: 'Music Guest', username: 'guest', id: 'guest' }}
            onUpdateProfile={handleUpdateProfile}
            backendUrl={backendUrl}
          />
          <AdminDashboard
            isOpen={showAdminDashboard}
            onClose={() => {
              setShowAdminDashboard(false);
              if (window.location.hash === '#admin') window.location.hash = '';
            }}
            backendUrl={backendUrl}
          />
        </Suspense>
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLoginSuccess={(user, token) => {
            setCurrentUser(user);
            if (token) setAuthToken(token);
          }}
          backendUrl={backendUrl}
          onOpenInstall={openInstallHandler}
          onOpenAdmin={() => setShowAdminDashboard(true)}
        />
        <Suspense fallback={null}>
          <InstallAppModal
            isOpen={showInstallModal && !isAppInstalled}
            onClose={handleCloseInstallModal}
            onInstalled={handleAppMarkedInstalled}
          />
          <AdminDashboard
            isOpen={showAdminDashboard}
            onClose={() => {
              setShowAdminDashboard(false);
              if (window.location.hash === '#admin') window.location.hash = '';
            }}
            backendUrl={backendUrl}
          />
        </Suspense>
      </>
    );
  }

  const displayedMessages = isDecoySession ? [
    {
      id: 'decoy-1',
      sender: 'Campus Notes',
      senderId: 'sys-decoy-1',
      text: 'Shared the physics and mathematics notes from today.',
      isLocked: false,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'decoy-2',
      sender: 'Study Group',
      senderId: 'sys-decoy-2',
      text: 'Assignment submission deadline is 5 PM tomorrow.',
      isLocked: false,
      timestamp: new Date().toISOString()
    }
  ] : messages;

  const isCurrentTargetTyping = selectedTarget.type === 'user' && Boolean(typingUsers[selectedTarget.id]);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col md:p-3 text-slate-100 overflow-hidden font-sans relative">
      
      {/* Anti-Shoulder Surfing Privacy Cover */}
      {isWindowBlurred && settings.antiShoulderSurfing && !isAppLocked && (
        <div className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mb-4 shadow-xl shadow-purple-600/20">
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Anti-Shoulder Surfing Shield</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Chat preview is hidden because your window lost focus. Click anywhere or return to this tab to reveal.
          </p>
          <button
            onClick={() => setIsWindowBlurred(false)}
            className="mt-5 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
          >
            Resume Chat
          </button>
        </div>
      )}

      {/* Main Telegram App Container */}
      <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-slate-950"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <div className="flex-1 w-full max-w-6xl mx-auto bg-slate-900 border-0 md:border md:border-slate-800 md:rounded-3xl shadow-2xl overflow-hidden flex h-full relative">
        
        {/* Left Telegram Chat List Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 md:static md:flex md:w-80 bg-slate-900 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <UserSidebar
            currentUser={currentUser}
            users={users}
            groups={groups}
            selectedTarget={selectedTarget}
            onSelectTarget={handleSelectTarget}
            onLogout={handleLogout}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAiTraining={() => setIsAiTrainingOpen(true)}
            onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
            onLockApp={() => setIsAppLocked(true)}
            onRefreshUsers={fetchUsers}
            onOpenInstall={openInstallHandler}
            onOpenAdmin={() => setShowAdminDashboard(true)}
            unreadCounts={unreadCounts}
          />
        </div>

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
          />
        )}

        {/* Active Telegram Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/50 relative">
          
          <ChatHeader
            target={selectedTarget}
            onRelockAll={relockAll}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenAiTraining={() => setIsAiTrainingOpen(true)}
            onLockApp={() => setIsAppLocked(true)}
            onOpenInstall={openInstallHandler}
            onToggleStealth={() => {
              setIsStealthMode(true);
              try {
                sessionStorage.removeItem('secret_bubble_session_unlocked');
                localStorage.setItem('secret_bubble_stealth_active', 'true');
              } catch {}
            }}
            isDecoyActive={isDecoySession}
            onExitDecoy={() => setIsDecoySession(false)}
            aiEnabled={settings.aiEnabled}
            isTyping={isCurrentTargetTyping}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-1">
            {displayedMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 shadow-lg">
                  {selectedTarget.id === 'user-meta-ai' ? (
                    <Bot className="w-7 h-7 text-cyan-400 animate-bounce" />
                  ) : (
                    <Globe className="w-7 h-7" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-200">
                  {selectedTarget.id === 'user-meta-ai'
                    ? 'Chat with Meta AI Assistant'
                    : selectedTarget.type === 'room'
                    ? 'Global Public Channel'
                    : `Direct Chat with ${selectedTarget.name}`}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {selectedTarget.id === 'user-meta-ai'
                    ? 'Ask questions, get advice, translations, coding help, or privacy assistance!'
                    : selectedTarget.type === 'room'
                    ? 'Public community messages with Telegram view counts.'
                    : `Encrypted 1-on-1 private chat with ${selectedTarget.name}.`}
                </p>
              </div>
            ) : (
              displayedMessages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  currentUser={currentUser}
                  isUnlocked={isUnlocked}
                  remainingSeconds={getRemainingSeconds}
                  onUnlockClick={triggerUnlock}
                  onRelockClick={relockMessage}
                  onEditMessage={handleEditMessage}
                  onDeleteMessage={handleDeleteMessage}
                  unlockedPasscodeTexts={unlockedPasscodeTexts}
                  onUnlockPasscode={handleUnlockPasscodeMessage}
                  onRelockPasscode={handleRelockPasscodeMessage}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

        </div>

      </div>

      {/* Biometric Verification Modal */}
      {activePromptMsg && (
        <BiometricModal
          message={activePromptMsg}
          isWebAuthnSupported={isWebAuthnSupported}
          onConfirm={completeUnlock}
          onCancel={cancelUnlock}
        />
      )}

      {/* Passcode Lock Screen Modal */}
      <AppLockModal
        isLocked={isAppLocked}
        onUnlock={() => setIsAppLocked(false)}
      />

      {/* Profile & DP Upload Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        backendUrl={backendUrl}
      />

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* AI Training & Knowledge Studio Modal */}
      <AiTrainingModal
        isOpen={isAiTrainingOpen}
        onClose={() => setIsAiTrainingOpen(false)}
        backendUrl={backendUrl}
        currentUser={currentUser}
      />

      {/* Create New Telegram Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        currentUser={currentUser}
        users={users}
        backendUrl={backendUrl}
        onGroupCreated={handleGroupCreated}
      />

        {/* PWA Download / Install App Modal */}
        <InstallAppModal
          isOpen={showInstallModal && !isAppInstalled}
          onClose={handleCloseInstallModal}
          onInstalled={handleAppMarkedInstalled}
        />

        {/* Admin Telemetry & Real-Time Dashboard */}
        <AdminDashboard
          isOpen={showAdminDashboard}
          onClose={() => {
            setShowAdminDashboard(false);
            if (window.location.hash === '#admin') window.location.hash = '';
          }}
          backendUrl={backendUrl}
        />
      </Suspense>

    </div>
  );
}