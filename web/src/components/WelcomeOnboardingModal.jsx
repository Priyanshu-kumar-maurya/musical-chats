import React, { useState, useRef } from 'react';
import { 
  Music, User, Camera, Sparkles, Check, Play, Headphones, Disc3, 
  Flame, Radio, Heart, ArrowRight
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Mia',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sam',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber'
];

const MUSIC_VIBES = [
  { id: 'bollywood', label: 'Bollywood Hits', icon: Disc3 },
  { id: 'lofi', label: 'Lo-Fi Chill', icon: Headphones },
  { id: 'punjabi', label: 'Punjabi & Desi', icon: Flame },
  { id: 'pop', label: 'Global Pop', icon: Sparkles },
  { id: 'phonk', label: 'Phonk & EDM', icon: Radio },
  { id: 'romantic', label: 'Romantic & Soul', icon: Heart }
];

export default function WelcomeOnboardingModal({ isOpen, onComplete, backendUrl }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [selectedVibes, setSelectedVibes] = useState(['bollywood', 'pop']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-generate username suggestion from name
  const handleNameChange = (val) => {
    setName(val);
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15);
    setUsername(slug);
  };

  const toggleVibe = (id) => {
    setSelectedVibes(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(v => v !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleCustomPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be smaller than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const displayName = name.trim() || 'Music Lover';
    const cleanUsername = (username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || displayName.toLowerCase().replace(/[^a-z0-9_]/g, '_')).slice(0, 20);

    const payload = {
      name: displayName,
      username: cleanUsername,
      avatarUrl: selectedAvatar,
      favoriteVibes: selectedVibes,
      stealthPin: '1234'
    };

    try {
      const res = await fetch(`${backendUrl}/api/auth/quick-onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('secure_chat_token', data.token);
        }
        localStorage.setItem('secure_chat_user', JSON.stringify(data.user));
        localStorage.setItem('secret_bubble_user_vibes', JSON.stringify(selectedVibes));
        localStorage.setItem('secret_bubble_onboarded', 'true');
        onComplete(data.user);
        return;
      }
    } catch (err) {
      console.warn('Backend quick onboard failed, creating offline profile:', err);
    }

    // Offline / fallback profile creation
    const fallbackUser = {
      id: 'u_' + cleanUsername,
      username: cleanUsername,
      name: displayName,
      avatarColor: 'from-emerald-600 to-teal-500',
      avatarUrl: selectedAvatar,
      bio: '🎵 Music listener exploring Secret-Bubble',
      favoriteVibes: selectedVibes,
      isOnline: true
    };

    localStorage.setItem('secure_chat_user', JSON.stringify(fallbackUser));
    localStorage.setItem('secret_bubble_user_vibes', JSON.stringify(selectedVibes));
    localStorage.setItem('secret_bubble_onboarded', 'true');
    onComplete(fallbackUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#121212] border border-[#282828] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-white font-sans max-h-[90vh] flex flex-col">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#1ed760]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center shrink-0 mb-5 relative z-10">
          <div className="inline-flex p-2 rounded-2xl bg-gradient-to-tr from-[#1ed760]/20 to-emerald-500/10 border border-[#1ed760]/30 text-[#1ed760] mb-3 shadow-lg shadow-[#1ed760]/10">
            <Music className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Welcome to Secret Bubble
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Set up your listener profile to personalize your music feed, playlists, and audio recommendations.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto no-scrollbar space-y-4 pr-0.5 flex-1 relative z-10">
          
          {/* Name & Handle Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              What should we call you?
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Priyanshu, Alex, Melophile..."
                maxLength={30}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#2e2e2e] focus:border-[#1ed760] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-1 focus:ring-[#1ed760]"
              />
            </div>
            {username && (
              <p className="text-[11px] text-zinc-500 mt-1 pl-1">
                Your handle: <span className="text-[#1ed760] font-mono font-medium">@{username}</span>
              </p>
            )}
          </div>

          {/* Avatar Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300">
                Choose Your Avatar
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-[#1ed760] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomPhoto}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((url, idx) => {
                const isSelected = selectedAvatar === url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative aspect-square rounded-xl overflow-hidden p-1 transition cursor-pointer border ${
                      isSelected 
                        ? 'border-[#1ed760] ring-2 ring-[#1ed760]/30 bg-[#282828] scale-105' 
                        : 'border-[#2e2e2e] hover:border-zinc-500 bg-[#1e1e1e]'
                    }`}
                  >
                    <img 
                      src={url} 
                      alt={`Avatar ${idx + 1}`} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#1ed760]/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorite Music Vibes Chips */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Select Your Favorite Vibes
            </label>
            <div className="flex flex-wrap gap-2">
              {MUSIC_VIBES.map((vibe) => {
                const isSelected = selectedVibes.includes(vibe.id);
                const IconComponent = vibe.icon;
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => toggleVibe(vibe.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1ed760]/15 text-[#1ed760] border-[#1ed760]/50 shadow-sm shadow-[#1ed760]/10 font-semibold'
                        : 'bg-[#1e1e1e] text-zinc-400 border-[#2e2e2e] hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[#1ed760]' : 'text-zinc-400'}`} />
                    <span>{vibe.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick PIN Info Note */}
          <div className="p-3 bg-[#181818] border border-[#282828] rounded-xl flex items-center gap-2.5 text-zinc-400">
            <Sparkles className="w-4 h-4 text-[#1ed760] shrink-0" />
            <p className="text-[11px] leading-tight">
              Default access PIN is <span className="text-white font-mono font-bold">1234</span>. You can change this anytime from Profile & Security settings.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2 shrink-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#1ed760]/20 transition transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{isSubmitting ? 'Personalizing Your Experience...' : 'Start Listening'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
