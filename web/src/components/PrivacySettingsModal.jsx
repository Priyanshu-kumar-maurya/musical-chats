import React, { useState } from 'react';
import { 
  X, Bot, Shield, Clock, Flame, Heart, Lock, Key, CheckCircle, EyeOff, 
  Sparkles, ShieldCheck, Cpu, Database, Timer, CheckCircle2, Headphones, Music 
} from 'lucide-react';

export default function PrivacySettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) {
  if (!isOpen) return null;

  const toggleMasterAI = () => {
    onUpdateSettings({ ...settings, aiEnabled: !settings.aiEnabled });
  };

  const toggleAntiShoulderSurfing = () => {
    onUpdateSettings({ ...settings, antiShoulderSurfing: !settings.antiShoulderSurfing });
  };

  const toggleCategory = (catKey) => {
    onUpdateSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [catKey]: !settings.categories[catKey]
      }
    });
  };

  const setTimer = (seconds) => {
    onUpdateSettings({ ...settings, autoRelockSeconds: seconds });
  };

  const setIdleTimer = (mins) => {
    onUpdateSettings({ ...settings, idleLockMinutes: mins });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-600/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Telegram Privacy & AI Shield</h3>
            <p className="text-xs text-slate-400">Next-level biometric encryption & anti-spy controls</p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          
          {/* 1. Master AI Toggle */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${settings.aiEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-500'}`}>
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">AI Auto-Shield (Smart Detection)</p>
                <p className="text-xs text-slate-400">
                  {settings.aiEnabled
                    ? 'AI auto-masks sensitive chats without clicking lock'
                    : 'Disabled (Only manual lock button works)'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMasterAI}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                settings.aiEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  settings.aiEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Anti-Shoulder Surfing (Blur on window switch) */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${settings.antiShoulderSurfing ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-500'}`}>
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Anti-Shoulder Surfing Shield</p>
                <p className="text-xs text-slate-400">
                  Auto-blurs chats when switching tabs or window loses focus
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleAntiShoulderSurfing}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                settings.antiShoulderSurfing ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  settings.antiShoulderSurfing ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Category Toggles */}
          {settings.aiEnabled && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                AI Auto-Shield Categories
              </label>

              {/* Adult & Physical Intimacy */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">Adult & Physical Intimacy 🔞</span>
                    <p className="text-[11px] text-slate-400">Auto-locks sex, physical relations, intimate words</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.categories.adult_intimacy !== false}
                  onChange={() => toggleCategory('adult_intimacy')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Romance & Feelings */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">Romance & Feelings ❤️</span>
                    <p className="text-[11px] text-slate-400">Auto-locks romantic sentiments and affection</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.categories.romance_feelings !== false}
                  onChange={() => toggleCategory('romance_feelings')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Secrets & Confidential */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">Secrets & Confidential 🔒</span>
                    <p className="text-[11px] text-slate-400">"Keep it secret", confidential statements</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.categories.secrets_confidential !== false}
                  onChange={() => toggleCategory('secrets_confidential')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Financial & Passwords */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">Passwords, PIN & Financial 🔑</span>
                    <p className="text-[11px] text-slate-400">Auto-locks OTPs, passwords, bank cards</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.categories.financial_credentials !== false}
                  onChange={() => toggleCategory('financial_credentials')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 4. Auto-Relock Timer Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Biometric Message Auto-Relock
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTimer(sec)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    settings.autoRelockSeconds === sec
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* 5. Inactivity Idle Screen Auto-Lock */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              Inactivity Idle Screen Auto-Lock
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '1m', val: 1 },
                { label: '5m', val: 5 },
                { label: '10m', val: 10 },
                { label: 'Off', val: 0 }
              ].map(({ label, val }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setIdleTimer(val)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    settings.idleLockMinutes === val
                      ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Automatically locks screen with your passcode if inactive.
            </p>
          </div>

          {/* 6. Stealth Lo-Fi Music Player Camouflage Disguise */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Lo-Fi Music Player Camouflage</p>
                  <p className="text-[11px] text-purple-300/70">Disguises the entire app as a chill Lo-Fi music player</p>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/20 text-[11px] text-slate-300 space-y-1">
              <p className="text-purple-300 font-semibold">⚡ How to unlock secret chat:</p>
              <p>• <strong>Triple-tap</strong> the rotating vinyl disc</p>
              <p>• Or tap the <strong>Heart ❤️</strong> icon 3 times</p>
              <p>• Or tap <strong>EQ (Equalizer)</strong> icon and enter PIN</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                  Secret EQ PIN (Unlock)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={settings.stealthPin || '1234'}
                  onChange={(e) => onUpdateSettings({ ...settings, stealthPin: e.target.value.replace(/\D/g, '') || '1234' })}
                  placeholder="1234"
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                  Decoy Duress PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={settings.decoyPin || '9999'}
                  onChange={(e) => onUpdateSettings({ ...settings, decoyPin: e.target.value.replace(/\D/g, '') || '9999' })}
                  placeholder="9999"
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[9px] text-neutral-500 mt-0.5 block">Opens clean decoy</span>
              </div>
            </div>
          </div>

          {/* 7. Security Health Center & Cryptographic Audit */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Security Health Center
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                100% ZERO-KNOWLEDGE E2EE
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white text-[11px]">Client-Side Zero-Knowledge E2EE</p>
                    <p className="text-[10px] text-slate-400">AES-256-GCM + PBKDF2 (Zero Plaintext on Server)</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="font-semibold text-white text-[11px]">Storage Encryption at Rest</p>
                    <p className="text-[10px] text-slate-400">AES-256-GCM Zero-Knowledge Disk Vault</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white text-[11px]">LocalStorage Vault & Anti-Inspect Shield</p>
                    <p className="text-[10px] text-slate-400">AES-256 Client-Side Ciphertext (Zero Plaintext in DevTools)</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="font-semibold text-white text-[11px]">Password Security Vault</p>
                    <p className="text-[10px] text-slate-400">Salted PBKDF2 (100,000 Iterations, SHA-512)</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-semibold text-white text-[11px]">Session Guard & Handshake</p>
                    <p className="text-[10px] text-slate-400">HMAC-SHA256 Signed Handshake (Anti-Spoofing)</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <div>
                    <p className="font-semibold text-white text-[11px]">Anti-Brute Force Defense</p>
                    <p className="text-[10px] text-slate-400">IP Rate Limiting & Cooldown Protection</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            </div>
          </div>

        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Save & Apply Settings
        </button>

      </div>
    </div>
  );
}