import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, Unlock, Bot, Flame, Smile, Mic, Paperclip, X, KeyRound, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { analyzeMessageSensitivity } from '../utils/aiPrivacyDetector';
import { encryptE2EE } from '../utils/e2eeCrypto';

const DEFAULT_CATEGORIES = [
  { id: 'Adult & Physical Intimacy 🔞', label: 'Intimacy 🔞' },
  { id: 'Romance & Feelings ❤️', label: 'Feelings ❤️' },
  { id: 'Secrets & Confidential 🔒', label: 'Secret 🔒' },
  { id: 'Financial & Credentials 🔑', label: 'Sensitive 🔑' }
];

const DISAPPEARING_OPTIONS = [
  { label: 'Off', secs: 0 },
  { label: '10s', secs: 10 },
  { label: '30s', secs: 30 },
  { label: '1m', secs: 60 },
  { label: '1h', secs: 3600 }
];

const QUICK_EMOJIS = ['😊', '❤️', '🔥', '👍', '😂', '🔒', '👀'];

export default function ChatInput({
  onSendMessage,
  onTyping,
  onStopTyping,
  settings,
  onOpenSettings
}) {
  const [text, setText] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Adult & Physical Intimacy 🔞');
  const [enablePasscodeLock, setEnablePasscodeLock] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeHint, setPasscodeHint] = useState('');
  const [showPasscodeText, setShowPasscodeText] = useState(false);
  const [selfDestructSecs, setSelfDestructSecs] = useState(0);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [aiDetection, setAiDetection] = useState({ isSensitive: false });
  const typingTimeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Live real-time AI Sensitivity scanning as user types
  useEffect(() => {
    if (settings?.aiEnabled && text.trim().length > 1) {
      const result = analyzeMessageSensitivity(text, settings.categories);
      setAiDetection(result);
      if (result.isSensitive) {
        setIsLocked(true);
        setEnablePasscodeLock(true);
        setSelectedCategory(result.category);
      }
    } else {
      setAiDetection({ isSensitive: false });
    }

    // Typing notification trigger
    if (text.trim()) {
      if (onTyping) onTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) onStopTyping();
      }, 1500);
    } else {
      if (onStopTyping) onStopTyping();
    }
  }, [text, settings]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const currentText = text.trim();
    if (!currentText || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Immediately clear text input so user cannot double-submit
    setText('');
    setIsLocked(false);
    setEnablePasscodeLock(false);
    const passToUse = passcode.trim();
    const hintToUse = passcodeHint.trim();
    setPasscode('');
    setPasscodeHint('');
    setShowPasscodeText(false);
    setAiDetection({ isSensitive: false });

    if (onStopTyping) onStopTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      let finalLocked = isLocked;
      let finalCategory = selectedCategory;
      let autoShielded = false;

      if (settings?.aiEnabled) {
        const analysis = analyzeMessageSensitivity(currentText, settings.categories);
        if (analysis.isSensitive) {
          finalLocked = true;
          finalCategory = analysis.category;
          autoShielded = true;
        }
      }

      const shouldLock = Boolean(finalLocked || enablePasscodeLock || autoShielded || aiDetection.isSensitive);
      const finalPasscode = shouldLock ? (passToUse || '1234') : null;
      const finalHint = shouldLock ? (hintToUse || (passToUse ? '' : '1234')) : null;

      let e2eeEnvelope = null;
      if (shouldLock && finalPasscode) {
        try {
          e2eeEnvelope = await encryptE2EE(currentText, finalPasscode);
        } catch (err) {
          console.warn('E2EE encryption warning:', err);
        }
      }

      onSendMessage({
        text: currentText,
        e2eeEnvelope: e2eeEnvelope,
        isLocked: shouldLock,
        category: shouldLock ? finalCategory : 'General',
        isAiShielded: autoShielded || aiDetection.isSensitive,
        selfDestructSecs: selfDestructSecs > 0 ? selfDestructSecs : null,
        hasPasscode: shouldLock,
        passcode: finalPasscode,
        passcodeHint: finalHint
      });
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 350);
    }
  };

  const handleVoiceRecord = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      // Send simulated voice note text
      clearInterval(timerIntervalRef.current);
      setIsRecordingVoice(false);
      if (recordingSeconds >= 1) {
        onSendMessage({
          text: `🎤 Voice Note (${recordingSeconds}s)`,
          isLocked: isLocked,
          category: isLocked ? selectedCategory : 'General',
          isAiShielded: false
        });
      }
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800/80 relative font-sans">
      
      {/* AI Live Detection Banner */}
      {aiDetection.isSensitive && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2 mb-2.5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-purple-950/90 to-slate-900 border border-rose-500/50 text-xs text-rose-200 animate-in slide-in-from-bottom-2 duration-200 shadow-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <Bot className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            </span>
            <span className="truncate">
              <strong>AI Auto-Shield:</strong> "{aiDetection.category}" detected &rarr; <strong>Auto-locked!</strong>
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/30 text-[10px] font-bold uppercase tracking-wider text-rose-200 shrink-0">
            Protected
          </span>
        </div>
      )}

      {/* Password Lock Settings Drawer */}
      {isLocked && (
        <div className="p-3 mb-2.5 bg-slate-950/95 border border-amber-500/40 rounded-2xl space-y-2.5 animate-in slide-in-from-bottom-2 duration-200 shadow-xl">
          
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <KeyRound className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Message Password Lock (Blur & Protect)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Readers must enter this password to view
              </span>
              <button
                type="button"
                onClick={() => { setIsLocked(false); setEnablePasscodeLock(false); }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                title="Remove lock"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category Tag Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <span className="text-[11px] text-slate-400 font-medium shrink-0">Category:</span>
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Password & Hint Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative flex items-center">
              <KeyRound className="w-3.5 h-3.5 text-amber-400 absolute left-3 pointer-events-none" />
              <input
                type={showPasscodeText ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Set custom secret password..."
                className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasscodeText(!showPasscodeText)}
                className="absolute right-2.5 text-slate-400 hover:text-slate-200 p-0.5"
                title={showPasscodeText ? "Hide password" : "Show password"}
              >
                {showPasscodeText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={passcodeHint}
                onChange={(e) => setPasscodeHint(e.target.value)}
                placeholder="Optional reminder / clue for recipient..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

        </div>
      )}

      {/* Quick Emoji Bar */}
      {showEmojiBar && (
        <div className="flex items-center gap-2 p-1.5 mb-2 bg-slate-950/80 border border-slate-800 rounded-2xl animate-in slide-in-from-bottom-1 duration-150">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setText(prev => prev + emoji)}
              className="p-1.5 text-base hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Telegram Chat Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        
        {/* Toggle Lock & Password Button */}
        <button
          type="button"
          onClick={() => {
            const next = !isLocked;
            setIsLocked(next);
            setEnablePasscodeLock(next);
          }}
          className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer ${
            isLocked
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20 scale-105'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
          }`}
          title={isLocked ? 'Password lock active (Message will be blurred)' : 'Lock message with password'}
        >
          {isLocked ? (
            <KeyRound className="w-5 h-5 animate-pulse text-amber-400" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
        </button>

        {/* Disappearing Self-Destruct Timer Button */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowTimerMenu(!showTimerMenu)}
            className={`p-2.5 sm:p-3 rounded-2xl border transition ${
              selfDestructSecs > 0
                ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Disappearing Messages Timer"
          >
            <Flame className="w-5 h-5" />
          </button>

          {/* Disappearing Timer Dropdown */}
          {showTimerMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowTimerMenu(false)} />
              <div className="absolute bottom-14 left-0 z-40 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl space-y-1 min-w-[140px] text-xs animate-in slide-in-from-bottom-2 duration-150">
                <p className="px-2 py-1 font-bold text-slate-400 text-[10px] uppercase">Self-Destruct</p>
                {DISAPPEARING_OPTIONS.map((opt) => (
                  <button
                    key={opt.secs}
                    type="button"
                    onClick={() => { setSelfDestructSecs(opt.secs); setShowTimerMenu(false); }}
                    className={`w-full px-3 py-1.5 rounded-xl text-left font-semibold transition ${
                      selfDestructSecs === opt.secs
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Text Input or Voice Recording Indicator */}
        <div className="relative flex-1 min-w-0">
          {isRecordingVoice ? (
            <div className="w-full py-2.5 px-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl flex items-center justify-between text-xs text-rose-300 animate-pulse">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                Recording Voice Note... ({recordingSeconds}s)
              </span>
              <span className="text-[10px] font-bold">Tap mic to send</span>
            </div>
          ) : (
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isLocked ? "Type private message (masked by biometrics)..." : "Write a message or @meta ai..."}
              autoComplete="on"
              autoCorrect="on"
              spellCheck="true"
              autoCapitalize="sentences"
              enterKeyHint="send"
              className={`w-full py-2.5 sm:py-3 pl-4 pr-10 bg-slate-950/90 border rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                isLocked
                  ? 'border-purple-500/80 focus:ring-1 focus:ring-purple-500/30'
                  : 'border-slate-800 focus:border-purple-500'
              }`}
            />
          )}

          {/* Emoji Toggle button inside input */}
          <button
            type="button"
            onClick={() => setShowEmojiBar(!showEmojiBar)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        {/* Voice Note or Send Button */}
        {text.trim() ? (
          <button
            type="submit"
            className="p-2.5 sm:p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl transition shadow-lg shadow-purple-600/30 flex items-center justify-center shrink-0 active:scale-95"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleVoiceRecord}
            className={`p-2.5 sm:p-3 rounded-2xl border transition flex items-center justify-center shrink-0 ${
              isRecordingVoice
                ? 'bg-rose-600 border-rose-500 text-white animate-bounce'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Record Voice Note"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

      </form>
    </div>
  );
}