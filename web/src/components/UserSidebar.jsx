import React, { useState, useEffect } from 'react';
import { 
  Users, User, Search, MessageSquare, Globe, Shield, LogOut, Camera, 
  Pin, Bot, CheckCheck, Menu, Moon, Lock, Settings as SettingsIcon, Sparkles, Plus, Brain, X, RefreshCw, Download 
} from 'lucide-react';

function getChatSnippet(userId, currentUserId) {
  try {
    const key = `secure_chat_cache_user_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const msgs = JSON.parse(raw);
    if (!Array.isArray(msgs) || msgs.length === 0) return null;
    const lastMsg = msgs[msgs.length - 1];
    let preview = lastMsg.text || '';
    if (lastMsg.attachment) {
      preview = `📎 ${lastMsg.attachment.name || 'Document'}`;
    }
    const time = lastMsg.timestamp ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return { preview, time, isMe: lastMsg.senderId === currentUserId };
  } catch {
    return null;
  }
}

export default function UserSidebar({
  currentUser,
  users,
  groups = [],
  selectedTarget,
  onSelectTarget,
  onLogout,
  onOpenProfile,
  onOpenSettings,
  onLockApp,
  onOpenAiTraining,
  onOpenCreateGroup,
  onRefreshUsers,
  onOpenInstall,
  onOpenAdmin,
  unreadCounts = {}
}) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'direct', 'channels', 'bots'
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Separate Meta AI Bot, Public Channel, and real users
  const metaAiBot = users.find(u => u.id === 'user-meta-ai' || u.isBot);
  const knownUsersMap = new Map();
  users.forEach(u => {
    if (u && u.id && u.id !== currentUser?.id && u.id !== 'user-meta-ai' && !u.isBot) {
      knownUsersMap.set(u.id, u);
    }
  });

  // Check if any chat caches exist in localStorage that are not in users list
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('secure_chat_cache_user_')) {
        const uId = k.replace('secure_chat_cache_user_', '');
        if (uId && uId !== currentUser?.id && uId !== 'user-meta-ai' && !knownUsersMap.has(uId)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const msgs = JSON.parse(raw);
            if (Array.isArray(msgs) && msgs.length > 0) {
              const otherMsg = msgs.find(m => m && m.senderId === uId);
              const displayName = otherMsg?.sender || uId.replace(/^u_/, '').replace(/^user-/, '');
              knownUsersMap.set(uId, {
                id: uId,
                username: uId.replace(/^u_/, '').replace(/^user-/, ''),
                name: displayName,
                avatarUrl: otherMsg?.senderAvatar || null,
                avatarColor: 'from-purple-600 to-indigo-500'
              });
            }
          }
        }
      }
    }
  } catch {}

  const realUsers = Array.from(knownUsersMap.values());

  const cleanSearch = search.trim().toLowerCase().replace(/^@+/, '');
  const rawSearch = search.trim().toLowerCase();

  const filteredUsers = realUsers.filter(u => {
    if (!cleanSearch) return true;
    const nameMatch = (u.name || '').toLowerCase().includes(rawSearch) || (u.name || '').toLowerCase().includes(cleanSearch);
    const usernameMatch = (u.username || '').toLowerCase().replace(/^@+/, '').includes(cleanSearch);
    return nameMatch || usernameMatch;
  });

  const customGroups = groups.filter(g => g.id !== 'global');
  const filteredGroups = customGroups.filter(g => {
    if (!cleanSearch) return true;
    return (g.name || '').toLowerCase().includes(cleanSearch) || 
           (g.description || '').toLowerCase().includes(cleanSearch);
  });

  const totalDirectUnreads = Object.values(unreadCounts || {}).reduce((a, b) => a + (Number(b) || 0), 0);

  return (
    <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800/90 flex flex-col h-full select-none relative font-sans">
      
      {/* Telegram-style Top Header */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-2">
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Telegram Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Telegram Dropdown Menu */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <div className="absolute left-0 top-12 z-50 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-slate-800 flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${currentUser?.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-xs`}>
                    {(currentUser?.name?.charAt(0) || 'U').toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{currentUser?.name || 'User'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">@{currentUser?.username || ''}</p>
                  </div>
                </div>

                <button
                  onClick={() => { setIsMenuOpen(false); onOpenCreateGroup && onOpenCreateGroup(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition"
                >
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-300">Create New Group</span>
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); onOpenProfile(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span>My Profile & DP</span>
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); onLockApp && onLockApp(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Passcode Lock Screen</span>
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); onOpenAiTraining && onOpenAiTraining(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition"
                >
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-cyan-300">Train AI Bot Studio</span>
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); onOpenSettings && onOpenSettings(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition"
                >
                  <SettingsIcon className="w-4 h-4 text-cyan-400" />
                  <span>Privacy & AI Shield</span>
                </button>

                {onOpenInstall && !isAppActuallyInstalled && (
                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenInstall(); }}
                    className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-emerald-300 hover:text-white flex items-center gap-2.5 transition"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Install / Download App</span>
                  </button>
                )}

                {onOpenAdmin && (
                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenAdmin(); }}
                    className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-emerald-300 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Admin Dashboard</span>
                  </button>
                )}

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={() => { setIsMenuOpen(false); onLogout(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-rose-950/60 text-rose-400 flex items-center gap-2.5 transition font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Telegram Search Bar */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onFocus={() => onRefreshUsers && onRefreshUsers()}
            onChange={(e) => {
              setSearch(e.target.value);
              if (onRefreshUsers) onRefreshUsers();
            }}
            placeholder="Search username or friend..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Lock Screen Shortcut */}
        <button
          onClick={onLockApp}
          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition"
          title="Instant Passcode Lock"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs (All, Direct, Channels, Bots) - Hidden during Search, No Scrollbar */}
      {!cleanSearch && (
        <div 
          className="flex gap-1 px-3 py-2 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto no-scrollbar text-[11px] font-semibold"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full transition shrink-0 ${
              activeFilter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Chats
          </button>
          <button
            onClick={() => setActiveFilter('direct')}
            className={`px-3 py-1 rounded-full transition shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'direct'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Direct ({realUsers.length})</span>
            {totalDirectUnreads > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-sm animate-pulse">
                {totalDirectUnreads}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('groups')}
            className={`px-3 py-1 rounded-full transition shrink-0 flex items-center gap-1 ${
              activeFilter === 'groups'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Groups</span>
            <span className="text-[10px] opacity-80">({groups.length || 1})</span>
          </button>
          <button
            onClick={() => setActiveFilter('bots')}
            className={`px-3 py-1 rounded-full transition shrink-0 ${
              activeFilter === 'bots'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            AI Bot 🤖
          </button>
        </div>
      )}

      {/* Chat List Feed */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">

        {/* CASE A: ACTIVE SEARCH RESULTS VIEW */}
        {cleanSearch ? (
          <div className="space-y-3">
            <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-400 font-semibold border-b border-slate-800/80">
              <span className="text-purple-300 font-bold">Search Results for "{search}"</span>
              <button
                onClick={() => { setSearch(''); if (onRefreshUsers) onRefreshUsers(); }}
                className="text-[10px] text-slate-400 hover:text-purple-300"
              >
                Clear
              </button>
            </div>

            {/* Matching Users List */}
            {filteredUsers.length > 0 && (
              <div className="space-y-1">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Users ({filteredUsers.length})
                </p>
                {filteredUsers.map((user) => {
                  const isSelected = selectedTarget?.type === 'user' && selectedTarget?.id === user.id;
                  const unread = Number(unreadCounts[user.id]) || 0;
                  const snippet = getChatSnippet(user.id, currentUser?.id);

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectTarget({ type: 'user', ...user });
                        setSearch('');
                      }}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition group ${
                        isSelected
                          ? 'bg-purple-600/25 border border-purple-500 text-purple-100 shadow-md'
                          : 'hover:bg-slate-800/70 bg-slate-950/40 border border-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow-sm"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${user.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                              {user.name.charAt(0)}
                            </div>
                          )}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                            user.isOnline ? 'bg-emerald-400 ring-1 ring-emerald-400' : 'bg-slate-600'
                          }`} />
                        </div>

                        <div className="text-left min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-xs font-bold truncate ${unread > 0 ? 'text-white' : 'text-slate-200'}`}>
                              {user.name}
                            </p>
                            {user.isOnline && (
                              <span className="text-[9px] font-medium text-emerald-400">online</span>
                            )}
                          </div>
                          <p className={`text-[11px] truncate mt-0.5 ${
                            unread > 0 ? 'text-purple-300 font-semibold' : 'text-slate-400'
                          }`}>
                            {snippet?.preview ? (
                              <span>
                                {snippet.isMe && <span className="text-slate-500 mr-1">You:</span>}
                                {snippet.preview}
                              </span>
                            ) : (
                              `@${user.username}`
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 ml-2">
                        {snippet?.time && (
                          <span className={`text-[10px] font-mono ${unread > 0 ? 'text-purple-300 font-bold' : 'text-slate-500'}`}>
                            {snippet.time}
                          </span>
                        )}
                        {unread > 0 && (
                          <span className="mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold shadow-md shadow-purple-900/40 animate-pulse">
                            {unread}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Matching Groups List */}
            {filteredGroups.length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Groups ({filteredGroups.length})
                </p>
                {filteredGroups.map((group) => {
                  const isSelected = selectedTarget?.type === 'room' && selectedTarget?.id === group.id;

                  return (
                    <button
                      key={group.id}
                      onClick={() => {
                        onSelectTarget({ type: 'room', id: group.id, name: group.name, isGroup: true, ...group });
                        setSearch('');
                      }}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition group ${
                        isSelected
                          ? 'bg-purple-600/25 border border-purple-500 text-purple-100 shadow-md'
                          : 'hover:bg-slate-800/70 bg-slate-950/40 border border-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${group.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white shadow-md shrink-0`}>
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold text-white truncate">{group.name}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {group.description || 'Custom Group Chat'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* No Results Fallback */}
            {filteredUsers.length === 0 && filteredGroups.length === 0 && (
              <div className="text-center py-8 px-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                  <Search className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">No user found matching "{search}"</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Make sure your friend has registered on the app, or check spelling without symbols.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRefreshUsers && onRefreshUsers()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mx-auto transition shadow-lg cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Users Directory</span>
                </button>
              </div>
            )}

          </div>
        ) : (
          /* CASE B: NORMAL CHAT FEED */
          <>
            {/* GROUPS / CHANNELS SECTION */}
            {(activeFilter === 'all' || activeFilter === 'groups') && (
              <>
                {/* Direct Create Group Button */}
                {activeFilter === 'groups' && (
                  <button
                    onClick={onOpenCreateGroup}
                    className="w-full py-2.5 px-3 mb-2 rounded-2xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Plus className="w-4 h-4 text-purple-400" />
                    <span>Create New Group</span>
                  </button>
                )}

                {/* 1. Global Public Chat Channel (Pinned Top) */}
                <button
                  onClick={() => onSelectTarget({ type: 'room', id: 'global', name: '🌍 Global Public Chat' })}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition group relative ${
                    selectedTarget?.type === 'room' && selectedTarget?.id === 'global'
                      ? 'bg-purple-600/20 border border-purple-500/60 text-purple-100 shadow-md'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20 shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white truncate">Global Public Channel</p>
                        <span className="p-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold shrink-0">PIN</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Public community chat • Views tracking
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-2">
                    <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] text-slate-500 mt-1 font-mono">Live</span>
                  </div>
                </button>

                {/* Custom User Groups List */}
                {filteredGroups.map((group) => {
                  const isSelected = selectedTarget?.type === 'room' && selectedTarget?.id === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => onSelectTarget({ type: 'room', id: group.id, name: group.name, isGroup: true, ...group })}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition group relative ${
                        isSelected
                          ? 'bg-purple-600/20 border border-purple-500/60 text-purple-100 shadow-md'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${group.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white shadow-md shrink-0`}>
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-white truncate">{group.name}</p>
                            {group.isPrivate ? (
                              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold flex items-center gap-0.5 shrink-0">
                                <Lock className="w-2.5 h-2.5" /> Private
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] font-bold shrink-0">
                                Group
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {group.description || `${group.memberCount || 1} members`}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {group.memberCount || 1} {group.memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* 2. Meta AI Assistant Bot (Pinned) */}
            {(activeFilter === 'all' || activeFilter === 'bots') && metaAiBot && (
              <button
                onClick={() => onSelectTarget({ type: 'user', ...metaAiBot })}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition group relative ${
                  selectedTarget?.type === 'user' && selectedTarget?.id === metaAiBot.id
                    ? 'bg-indigo-600/25 border border-indigo-500/60 text-indigo-100 shadow-md'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
                      <Bot className="w-5 h-5" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 rounded-full text-cyan-400 ring-1 ring-cyan-400">
                      <Sparkles className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate">Meta AI Assistant</p>
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold shrink-0">BOT</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      AI Privacy & Intelligence Assistant
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-2">
                  <span className="text-[10px] text-cyan-400 font-bold">24/7 AI</span>
                </div>
              </button>
            )}

            {/* SECTION DIVIDER: DIRECT USERS */}
            {(activeFilter === 'all' || activeFilter === 'direct') && (
              <div className="pt-3 pb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Direct Messages ({realUsers.length})</span>
              </div>
            )}

            {/* Real Users List */}
            {(activeFilter === 'all' || activeFilter === 'direct') && realUsers.map((user) => {
              const isSelected = selectedTarget?.type === 'user' && selectedTarget?.id === user.id;
              const unread = Number(unreadCounts[user.id]) || 0;
              const snippet = getChatSnippet(user.id, currentUser?.id);

              return (
                <button
                  key={user.id}
                  onClick={() => onSelectTarget({ type: 'user', ...user })}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition group ${
                    isSelected
                      ? 'bg-purple-600/20 border border-purple-500/60 text-purple-100 shadow-md'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${user.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        user.isOnline ? 'bg-emerald-400 ring-1 ring-emerald-400' : 'bg-slate-600'
                      }`} />
                    </div>

                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-bold truncate ${unread > 0 ? 'text-white' : 'text-slate-200'}`}>
                          {user.name}
                        </p>
                        {user.isOnline && (
                          <span className="text-[9px] font-medium text-emerald-400">online</span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${
                        unread > 0 ? 'text-purple-300 font-semibold' : 'text-slate-400'
                      }`}>
                        {snippet?.preview ? (
                          <span>
                            {snippet.isMe && <span className="text-slate-500 mr-1">You:</span>}
                            {snippet.preview}
                          </span>
                        ) : (
                          `@${user.username}`
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 ml-2">
                    {snippet?.time && (
                      <span className={`text-[10px] font-mono ${unread > 0 ? 'text-purple-300 font-bold' : 'text-slate-500'}`}>
                        {snippet.time}
                      </span>
                    )}
                    {unread > 0 && (
                      <span className="mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold shadow-md shadow-purple-900/40 animate-pulse">
                        {unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {realUsers.length === 0 && (activeFilter === 'all' || activeFilter === 'direct') && (
              <div className="text-center py-8 text-slate-500 text-xs">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No other users registered yet.</p>
                <p className="text-[10px] mt-1 text-slate-600">Share your app link to start chatting!</p>
              </div>
            )}
          </>
        )}

      </div>

      {/* Current User Bottom Bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
          title="Edit Profile & DP"
        >
          <div className="relative shrink-0">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt="DP"
                className="w-9 h-9 rounded-full object-cover border border-purple-500 shadow-md group-hover:scale-105 transition"
              />
            ) : (
              <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${currentUser.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-105 transition`}>
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 rounded-full text-purple-400">
              <Camera className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="truncate text-left">
            <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition truncate">{currentUser.name}</h4>
            <span className="text-[10px] text-slate-400 font-mono">@{currentUser.username}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Log Out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}