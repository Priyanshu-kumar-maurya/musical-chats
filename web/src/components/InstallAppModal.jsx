import React, { useState, useEffect } from 'react';
import { Download, X, Shield, Music, Sparkles, CheckCircle2, Share, PlusSquare, Smartphone, ArrowRight, ExternalLink } from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose, onInstalled }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      return (
        localStorage.getItem('secret_bubble_app_installed') === 'true' ||
        localStorage.getItem('secret_bubble_apk_downloaded') === 'true' ||
        Boolean(window.Capacitor?.isNativePlatform?.()) ||
        Boolean(window.Capacitor) ||
        window.location?.protocol === 'capacitor:' ||
        (window.location?.hostname === 'localhost' && !window.location?.port && !window.location?.host?.includes(':')) ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) ||
        (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) ||
        (window.navigator && window.navigator.standalone === true) ||
        (document.referrer && document.referrer.includes('android-app://'))
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Check if app is already running in standalone mode or marked installed
    try {
      const standalone =
        localStorage.getItem('secret_bubble_app_installed') === 'true' ||
        localStorage.getItem('secret_bubble_apk_downloaded') === 'true' ||
        Boolean(window.Capacitor?.isNativePlatform?.()) ||
        Boolean(window.Capacitor) ||
        window.location?.protocol === 'capacitor:' ||
        (window.location?.hostname === 'localhost' && !window.location?.port && !window.location?.host?.includes(':')) ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) ||
        (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) ||
        (window.navigator && window.navigator.standalone === true) ||
        (document.referrer && document.referrer.includes('android-app://'));

      if (standalone) {
        setIsInstalled(true);
        try {
          localStorage.setItem('secret_bubble_app_installed', 'true');
        } catch {}
        return;
      }
    } catch {}

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      try {
        localStorage.setItem('secret_bubble_app_installed', 'true');
        localStorage.setItem('secret_bubble_install_dismissed', 'true');
      } catch {}
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (onInstalled) onInstalled();
      if (onClose) onClose();
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onClose, onInstalled]);

  if (!isOpen) return null;

  const markAlreadyInstalled = () => {
    try {
      localStorage.setItem('secret_bubble_app_installed', 'true');
      localStorage.setItem('secret_bubble_apk_downloaded', 'true');
      localStorage.setItem('secret_bubble_install_dismissed', 'true');
    } catch {}
    setIsInstalled(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('secret_bubble_installed'));
    }
    if (onInstalled) onInstalled();
    if (onClose) onClose();
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('secret_bubble_install_dismissed', 'true');
      sessionStorage.setItem('secret_bubble_install_dismissed', 'true');
    } catch {}
    if (onClose) onClose();
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          markAlreadyInstalled();
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback for Android/Chrome when beforeinstallprompt is pending or not supported
      setShowIOSGuide(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        {/* Neon Ambient Background Glows */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4 pt-1">
          
          {/* Copyright-free Music & Chat App Logo */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 opacity-70 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-950 shadow-2xl flex items-center justify-center">
              <img
                src="/app-logo.png"
                alt="App Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-lg">
              <Download className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* App Title & Tagline */}
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold tracking-wide uppercase mb-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Official Fast Web App</span>
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Secret-Bubble App
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Music Player Camouflage • Private E2EE Vault
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2 text-left text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <div className="p-1 rounded-lg bg-purple-600/20 text-purple-400 shrink-0">
                <Music className="w-3.5 h-3.5" />
              </div>
              <span><strong>Full Offline & Background Music</strong> (Plays even with screen turned off)</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <div className="p-1 rounded-lg bg-cyan-600/20 text-cyan-400 shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span><strong>Zero-Trace Secret Chat</strong> (Stealth disguise & PIN lock)</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <div className="p-1 rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span><strong>Direct 1-Tap Install</strong> (Fast, Free & uses under 2MB)</span>
            </div>
          </div>

          {/* iOS / Manual Guide Step Box if clicked */}
          {showIOSGuide && (
            <div className="w-full bg-purple-950/40 border border-purple-500/30 rounded-2xl p-3 text-left text-xs space-y-2 animate-in slide-in-from-top-2 duration-150">
              <p className="font-bold text-purple-300 flex items-center gap-1.5 text-[11px]">
                <Smartphone className="w-4 h-4" />
                <span>How to Install on your Phone:</span>
              </p>
              {isIOS ? (
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Tap the <strong>Share</strong> button <Share className="w-3 h-3 inline text-cyan-400 mx-0.5" /> in Safari browser.</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline text-purple-400 mx-0.5" />.</li>
                  <li>Tap <strong>Add</strong> at top-right to download.</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Tap the <strong>Menu (3 dots ⋮)</strong> in your browser.</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>App icon will appear on your phone home screen!</li>
                </ol>
              )}
              <button
                type="button"
                onClick={markAlreadyInstalled}
                className="w-full mt-2 py-1.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Added to Home Screen</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-1">
            <a
              href="https://github.com/codex-priyanshu/secret-bubble/releases/download/v1.0.0/Secret-Bubble.apk"
              download="Secret-Bubble.apk"
              onClick={() => markAlreadyInstalled()}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Direct 1-Click Download APK (.apk)</span>
            </a>

            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-200" />
              <span>Fast Web App Install (1-Click PWA)</span>
            </button>

            <a
              href="https://github.com/codex-priyanshu/secret-bubble/actions/workflows/build-apk.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 text-[11px] text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-1 transition"
            >
              <span>View All APK Releases & Builds</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
              <p className="font-semibold text-slate-200">📌 Android Installation Guide:</p>
              <p>1. Tap <strong>"Direct 1-Click Download APK"</strong> above to download <code className="text-emerald-400">Secret-Bubble.apk</code> directly.</p>
              <p>2. Open your notification bar or phone Downloads folder and tap the APK file.</p>
              <p>3. Tap <strong>"Install"</strong> (allow unknown sources if prompted) and launch natively!</p>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Continue in Browser
            </button>

            <button
              type="button"
              onClick={markAlreadyInstalled}
              className="w-full py-1 text-[11px] text-slate-400 hover:text-emerald-400 font-medium transition cursor-pointer underline underline-offset-4"
            >
              Already Installed? Don't show again
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
