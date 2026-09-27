import React from 'react';
import { ShieldCheck, Lock, Settings, Menu, Globe, User, Bot, Sparkles, CheckCheck, MoreVertical, Flame, Brain, Users, Headphones, Download } from 'lucide-react';

export default function ChatHeader({
  target,
  onRelockAll,
  onOpenSettings,
  onOpenProfile,
  onLockApp,
  onOpenAiTraining,
  aiEnabled,
  isTyping,
  onToggleSidebar,
  disappearingTimer,
  onToggleStealth,
  isDecoyActive,
  onExitDecoy,
  onOpenInstall
}) {
  const isMetaAi = target?.id === 'user-meta-ai' || target?.isBot;

  return (
    <header className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-slate-900/95 border-b border-slate-800/80 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-xl select-none font-sans">
      
      {/* Target Info (Direct Friend, Global Channel, or Meta AI) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition shrink-0"
          title="Toggle Chats List"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative shrink-0">
          {target?.isGroup ? (
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${target.avatarColor || 'from-purple-600 to-indigo-600'} flex items-center justify-center text-white shadow-md shadow-purple-600/20`}>
              <Users className="w-5 h-5" />
            </div>
          ) : target?.type === 'room' ? (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <Globe className="w-5 h-5" />
            </div>
          ) : isMetaAi ? (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Bot className="w-5 h-5" />
            </div>
          ) : target?.avatarUrl ? (
            <img
              src={target.avatarUrl}
              alt={target.name}
              className="w-10 h-10 rounded-2xl object-cover border border-purple-500/60 shadow-md"
            />
          ) : (
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${target?.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
              {target?.name?.charAt(0) || 'U'}
            </div>
          )}

          {target?.type !== 'room' && !isMetaAi && (
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
              target?.isOnline ? 'bg-emerald-400 ring-1 ring-emerald-400' : 'bg-slate-600'
            }`} />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
            <span className="truncate">{target?.name || 'Global Public Chat'}</span>
            {isMetaAi ? (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold shrink-0">
                AI BOT
              </span>
            ) : target?.isGroup ? (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold shrink-0 ${
                target.isPrivate ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-300'
              }`}>
                {target.isPrivate ? 'PRIVATE' : 'GROUP'}
              </span>
            ) : target?.type === 'room' ? (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] font-bold shrink-0">
                PUBLIC
              </span>
            ) : target?.isOnline ? (
              <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                online
              </span>
            ) : null}
          </h2>

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
            {isTyping ? (
              <span className="text-cyan-400 font-medium animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> typing message...
              </span>
            ) : isMetaAi ? (
              <span className="text-cyan-300 font-medium">Meta AI Intelligence Engine • 24/7 Active</span>
            ) : target?.isGroup ? (
              <span className="text-slate-300 truncate">
                👥 {target.memberCount || target.members?.length || 1} members • {target.description || 'Community Group Chat'}
              </span>
            ) : target?.type === 'room' ? (
              <span className="text-slate-400">Public Channel • All members can view</span>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">Telegram E2EE • Biometric Masking</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Train AI Studio Button (Highlighted when in Meta AI chat) */}
        {isMetaAi && (
          <button
            onClick={onOpenAiTraining}
            className="px-2.5 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition animate-in fade-in"
            title="Open AI Training & Custom Knowledge Studio"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden sm:inline">Train AI</span>
          </button>
        )}

        {/* Disappearing timer badge if active */}
        {disappearingTimer > 0 && (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold" title={`Disappearing timer: ${disappearingTimer}s`}>
            <Flame className="w-3.5 h-3.5" />
            <span>{disappearingTimer}s</span>
          </div>
        )}

        {/* Decoy Session Active Warning */}
        {isDecoyActive && (
          <button
            onClick={onExitDecoy}
            className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500/30 transition animate-pulse"
            title="Decoy Mode Active. Click to exit."
          >
            <span>🛡️ DECOY MODE</span>
          </button>
        )}

        {/* Install / Download App Button */}
        {onOpenInstall && (
          <button
            onClick={onOpenInstall}
            className="p-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 hover:text-emerald-200 border border-emerald-800/60 rounded-xl transition shadow-sm"
            title="Download / Install App on Phone"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Stealth Music Player Camouflage (Panic Button) */}
        <button
          onClick={onToggleStealth}
          className="p-2 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-purple-200 border border-purple-800/60 rounded-xl transition shadow-sm"
          title="Panic Button: Instant Lo-Fi Music Disguise"
        >
          <Headphones className="w-4 h-4" />
        </button>

        {/* Telegram Instant App Lock */}
        <button
          onClick={onLockApp}
          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 rounded-xl transition"
          title="Instant Passcode Screen Lock"
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* Relock Biometric Messages */}
        <button
          onClick={onRelockAll}
          className="p-2 sm:px-3 sm:py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
          title="Relock All Biometric Messages"
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline text-xs">Relock</span>
        </button>

        {/* My Profile */}
        <button
          onClick={onOpenProfile}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition"
          title="My Profile & DP"
        >
          <User className="w-4 h-4" />
        </button>

        {/* Privacy Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition relative"
          title="Privacy Settings & AI Auto-Shield"
        >
          <Settings className="w-4 h-4" />
          {aiEnabled && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
          )}
        </button>
      </div>

    </header>
  );
}