import React, { useState, useRef } from 'react';
import { Shield, Lock, User, UserPlus, LogIn, ArrowRight, Globe, KeyRound, Camera, Eye, EyeOff, Sparkles, Download } from 'lucide-react';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Mia',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sam'
];

export default function LoginPage({ onLoginSuccess, backendUrl, onOpenInstall, onOpenAdmin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState(() => {
    try {
      const saved = localStorage.getItem('secret_bubble_saved_account');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.username) return p.username;
      }
      const u = localStorage.getItem('secure_chat_user');
      if (u) {
        const p = JSON.parse(u);
        if (p.username) return p.username;
      }
    } catch {}
    return 'nothing';
  });
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFoundUser, setNotFoundUser] = useState('');
  const fileInputRef = useRef(null);

  // Guard against showing install/download option if already running natively or installed
  const isAppActuallyInstalled = typeof window !== 'undefined' && (
    Boolean(window.AndroidNativeMedia) ||
    Boolean(window.SecretBubbleNative) ||
    Boolean(window.Capacitor?.isNativePlatform?.()) ||
    Boolean(window.Capacitor) ||
    (window.navigator?.userAgent && (
      window.navigator.userAgent.includes('SecretBubbleApp') ||
      window.navigator.userAgent.includes('NativeAPK') ||
      window.navigator.userAgent.includes('Capacitor')
    )) ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (window.navigator && window.navigator.standalone === true) ||
    localStorage.getItem('secret_bubble_app_installed') === 'true' ||
    localStorage.getItem('secret_bubble_apk_downloaded') === 'true' ||
    localStorage.getItem('secret_bubble_app_downloaded') === 'true'
  );

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be smaller than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleQuickCreate = async () => {
    if (!username.trim() || !password.trim()) return;
    setError('');
    setLoading(true);
    const cleanUser = username.trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '');
    try {
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          name: name.trim() || cleanUser,
          password: password.trim(),
          avatarUrl: avatarUrl || null
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      try {
        localStorage.setItem('secret_bubble_saved_account', JSON.stringify({
          id: data.user?.id || ('u_' + cleanUser),
          username: cleanUser,
          name: data.user?.name || cleanUser,
          avatarUrl: data.user?.avatarUrl || null,
          avatarColor: data.user?.avatarColor || null
        }));
      } catch {}
      if (data.token) {
        localStorage.setItem('secure_chat_token', data.token);
      }
      localStorage.setItem('secure_chat_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setNotFoundUser('');

    const cleanUser = username.trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '');

    if (!cleanUser || cleanUser.length < 3) {
      setError('Username must be at least 3 characters (letters, numbers, underscores only).');
      return;
    }

    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match. Please re-type identical password.');
      return;
    }

    setLoading(true);
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    // Stealth Admin Dashboard Trigger: if admin credentials are submitted in standard login
    if (!isRegister && cleanUser === 'admin' && (password.trim() === 'admin1234' || password.trim() === '0000')) {
      sessionStorage.setItem('secret_bubble_admin_auth', 'true');
      if (onOpenAdmin) {
        onOpenAdmin();
        setLoading(false);
        return;
      }
    }

    let savedAccount = null;
    try {
      const saved = localStorage.getItem('secret_bubble_saved_account');
      if (saved) savedAccount = JSON.parse(saved);
    } catch {}

    const payload = isRegister
      ? { username: cleanUser, name: name.trim() || cleanUser, password, avatarUrl: avatarUrl || null }
      : { username: cleanUser, password, cachedProfile: savedAccount };

    try {
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.isAdmin) {
        sessionStorage.setItem('secret_bubble_admin_auth', 'true');
        if (onOpenAdmin) {
          onOpenAdmin();
          setLoading(false);
          return;
        }
      }

      if (!res.ok || !data.success) {
        if (data.notFound) {
          setNotFoundUser(cleanUser);
        }
        throw new Error(data.message || 'Authentication failed');
      }

      // Save user account for future auto-recovery
      try {
        localStorage.setItem('secret_bubble_saved_account', JSON.stringify({
          id: data.user?.id || ('u_' + cleanUser),
          username: cleanUser,
          name: data.user?.name || name || cleanUser,
          avatarUrl: data.user?.avatarUrl || avatarUrl || null,
          avatarColor: data.user?.avatarColor || null
        }));
      } catch {}

      if (data.token) {
        localStorage.setItem('secure_chat_token', data.token);
      }
      localStorage.setItem('secure_chat_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Server connection error. Please ensure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      
      {/* Telegram Ambient Glow Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Brand Icon & Telegram Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-1 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-purple-600/30 mb-3 w-16 h-16 overflow-hidden border-2 border-white/20">
            <img
              src="/app-logo.png"
              alt="App Logo"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Secret-Bubble</h1>
          <p className="text-xs text-slate-400 mt-1">
            Music & Zero-Trace Private Vault
          </p>
        </div>

        {/* Tab Switcher: Login / Sign Up */}
        <div className="flex p-1 bg-slate-950/80 rounded-2xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
              !isRegister
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
              isRegister
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 mb-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs text-center font-medium animate-in fade-in space-y-2.5">
            <p className="leading-relaxed">{error}</p>
            {notFoundUser && (
              <button
                type="button"
                onClick={handleQuickCreate}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition cursor-pointer active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create @{notFoundUser} with this password (1-Click)</span>
              </button>
            )}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {isRegister && (
            <>
              {/* DP Upload during registration */}
              <div className="flex flex-col items-center mb-2">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="DP Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-400 group-hover:border-purple-500 group-hover:text-purple-400 transition">
                      <Camera className="w-5 h-5" />
                      <span className="text-[9px] mt-0.5 font-semibold">Add DP</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Preset Avatars */}
                <div className="flex gap-1.5 mt-2.5">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-7 h-7 rounded-full overflow-hidden border transition ${
                        avatarUrl === url ? 'border-purple-400 scale-110' : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name (e.g. Priyanshu Maurya)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Username (Handle)</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Unique username (e.g. alex_07)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition"
              />
            </div>
            {isRegister && (
              <p className="text-[10px] text-slate-500 mt-1">Letters, numbers and underscores only (min 3 chars)</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 4 chars)"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter identical password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Register & Join Chat' : 'Sign In to Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Download Android APK / Install App Button */}
        {onOpenInstall && !isAppActuallyInstalled && (
          <button
            type="button"
            onClick={onOpenInstall}
            className="w-full mt-3 py-2.5 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Android APK / Install App</span>
          </button>
        )}

        {/* Telegram Privacy Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span>Biometric Protection • No Phone Number Required</span>
        </div>

        {onOpenAdmin && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-[11px] text-slate-500 hover:text-emerald-400 transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <Shield className="w-3 h-3 text-emerald-500/70" />
              <span>Admin Portal & Growth Stats</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}