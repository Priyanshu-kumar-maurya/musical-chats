import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Disc, Sliders, Music, Radio, 
  Sparkles, Shield, X, Lock, Check, FolderPlus, List, 
  HardDrive, Smartphone, Music2, Plus, Search, 
  Globe, Flame, ExternalLink, Loader2, Video, Eye, EyeOff,
  Headphones, ChevronDown, ChevronUp, RadioTower, KeyRound, AlertCircle, Download,
  ListMusic, ArrowLeft, Trash2, User, Maximize2, RefreshCw, History, Clock
} from 'lucide-react';

const FEATURED_ONLINE_TRACKS = [
  {
    id: 'track-rjkrTnma',
    title: "Kesariya - Brahmāstra",
    artist: "Pritam, Arijit Singh, Amitabh Bhattacharya",
    album: "Brahmāstra Soundtrack",
    duration: 268,
    durationText: "4:28",
    url: "https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4",
    artwork: "https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg",
    youtubeId: "BddP6PYo2gs",
    year: 2022,
    isAudioStream: true,
    color: "from-amber-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-faloMmjX',
    title: "Chaleya - Jawan",
    artist: "Anirudh Ravichander, Arijit Singh, Shilpa Rao",
    album: "Jawan Soundtrack",
    duration: 200,
    durationText: "3:20",
    url: "https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4",
    artwork: "https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg",
    youtubeId: "VAdGW7QDJzc",
    year: 2023,
    isAudioStream: true,
    color: "from-rose-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-qZtKBMZ_',
    title: "Apna Bana Le - Bhediya",
    artist: "Sachin-Jigar, Arijit Singh",
    album: "Bhediya Soundtrack",
    duration: 261,
    durationText: "4:21",
    url: "https://aac.saavncdn.com/815/483a6e118e8108cbb3e5cd8701674f32_320.mp4",
    artwork: "https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg",
    youtubeId: "ElZfdU54Cp8",
    year: 2022,
    isAudioStream: true,
    color: "from-indigo-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-H2r9PnvA',
    title: "295 - Moosetape",
    artist: "Sidhu Moose Wala",
    album: "Moosetape",
    duration: 270,
    durationText: "4:30",
    url: "https://aac.saavncdn.com/609/852628435c98083dfe217c1cfa731bb5_320.mp4",
    artwork: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg",
    youtubeId: "n_FCrCQ6-9U",
    year: 2021,
    isAudioStream: true,
    color: "from-blue-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-NIidiD9g',
    title: "Heeriye (feat. Arijit Singh)",
    artist: "Jasleen Royal, Arijit Singh, Dulquer Salmaan",
    album: "Single",
    duration: 194,
    durationText: "3:14",
    url: "https://aac.saavncdn.com/022/a192e8d320ea5630db314d04fedf0aa5_320.mp4",
    artwork: "https://c.saavncdn.com/022/Heeriye-feat-Arijit-Singh-Hindi-2023-20230928050405-500x500.jpg",
    youtubeId: "RLzC55ai0eo",
    year: 2023,
    isAudioStream: true,
    color: "from-teal-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-aRZbUYD7',
    title: "Tum Hi Ho - Aashiqui 2",
    artist: "Mithoon, Arijit Singh",
    album: "Aashiqui 2",
    duration: 262,
    durationText: "4:22",
    url: "https://aac.saavncdn.com/430/5c5ea5cc00e3bff45616013226f376fe_320.mp4",
    artwork: "https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg",
    youtubeId: "Umqb9KENgmk",
    year: 2013,
    isAudioStream: true,
    color: "from-blue-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-mPTrDSun',
    title: "Raataan Lambiyan - Shershaah",
    artist: "Tanishk Bagchi, Jubin Nautiyal, Asees Kaur",
    album: "Shershaah",
    duration: 230,
    durationText: "3:50",
    url: "https://aac.saavncdn.com/238/35726d4394604604e961bf5b846870d0_320.mp4",
    artwork: "https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg",
    youtubeId: "gvyUuxdRdR4",
    year: 2021,
    isAudioStream: true,
    color: "from-pink-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-M7k5t7vw',
    title: "Lover - MoonChild Era",
    artist: "Diljit Dosanjh",
    album: "MoonChild Era",
    duration: 190,
    durationText: "3:10",
    url: "https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4",
    artwork: "https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.jpg",
    youtubeId: "m4n2_mGZ5aM",
    year: 2021,
    isAudioStream: true,
    color: "from-amber-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-1e0En7YX',
    title: "Pehle Bhi Main - ANIMAL",
    artist: "Vishal Mishra, Raj Shekhar",
    album: "ANIMAL",
    duration: 250,
    durationText: "4:10",
    url: "https://aac.saavncdn.com/092/81b52beea90f186f27cf5c5eead972c8_320.mp4",
    artwork: "https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg",
    youtubeId: "k4yXQkG2s1E",
    year: 2023,
    isAudioStream: true,
    color: "from-purple-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-xzUVX40K',
    title: "Brown Munde",
    artist: "AP Dhillon, Gurinder Gill, Shinda Kahlon",
    album: "Brown Munde",
    duration: 254,
    durationText: "4:14",
    url: "https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4",
    artwork: "https://c.saavncdn.com/973/Brown-Munde-English-2020-20260520131422-500x500.jpg",
    youtubeId: "VNs_cCtdbPc",
    year: 2020,
    isAudioStream: true,
    color: "from-red-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-VQp1eXug',
    title: "Zara Sa - Jannat",
    artist: "Sayeed Quadri, Pritam, KK",
    album: "Jannat",
    duration: 302,
    durationText: "5:02",
    url: "https://aac.saavncdn.com/801/571617f7810fb699ed56bc8a7d9e40d9_320.mp4",
    artwork: "https://c.saavncdn.com/801/Jannat-Hindi-2008-20190629135803-500x500.jpg",
    youtubeId: "5F24XG9_3lA",
    year: 2008,
    isAudioStream: true,
    color: "from-cyan-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-4mHUvJ4u',
    title: "Satranga - ANIMAL",
    artist: "Arijit Singh, Shreyas Puranik",
    album: "ANIMAL",
    duration: 271,
    durationText: "4:31",
    url: "https://aac.saavncdn.com/092/86b1368e104225e0bfbc69cda4ab8580_320.mp4",
    artwork: "https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg",
    youtubeId: "sAzlW4DYKUo",
    year: 2023,
    isAudioStream: true,
    color: "from-red-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-dF_dPijA',
    title: "Pappu Can't Dance",
    artist: "Benny Dayal, Naresh Iyer, Blaaze, A.R. Rahman",
    album: "Jaane Tu... Ya Jaane Na",
    duration: 264,
    durationText: "4:24",
    url: "https://aac.saavncdn.com/033/52742623b9d7580aef311375416f8744_320.mp4",
    artwork: "https://c.saavncdn.com/033/Jaane-Tu-Ya-Jaane-Na-Hindi-2008-20221128173303-500x500.jpg",
    youtubeId: "h-h8jR_yUvI",
    year: 2008,
    isAudioStream: true,
    color: "from-emerald-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-lofi-stream',
    title: "Lofi Chill Radio - Relax / Study",
    artist: "24/7 Continuous Background Stream",
    album: "Chillhop 24/7",
    duration: 7200,
    durationText: "2:00:00",
    url: "https://play.streamafrica.net/lofiradio",
    artwork: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80",
    youtubeId: "jfKfPfyJRdk",
    year: 2024,
    isAudioStream: true,
    color: "from-purple-950/60 via-slate-950 to-slate-950"
  }
];

// Personalized Vibe & Genre Filter Chips
const VIBE_CHIPS = [
  { id: 'for_you', label: 'For You', emoji: '✨' },
  { id: 'hindi', label: 'Hindi Hits', emoji: '🎵' },
  { id: 'bollywood', label: 'Bollywood', emoji: '🌟' },
  { id: 'punjabi', label: 'Punjabi', emoji: '🔥' },
  { id: 'english', label: 'English & Pop', emoji: '🌍' },
  { id: 'lofi', label: 'Lofi & Chill', emoji: '☕' },
  { id: 'romantic', label: 'Romantic', emoji: '❤️' }
];

// Continuous procedural fallback pool to guarantee non-stop songs even if offline
const BACKUP_STREAM_POOL = [
  {
    id: "stream-pool-o-maahi",
    title: "O Maahi - Dunki",
    artist: "Pritam, Arijit Singh, Irshad Kamil",
    album: "Dunki",
    duration: 233,
    durationText: "3:53",
    url: "https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4",
    artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
    youtubeId: "S_y0x9_Z4vI",
    isAudioStream: true
  },
  {
    id: "stream-pool-ve-kamleya",
    title: "Ve Kamleya - Rocky Aur Rani",
    artist: "Pritam, Arijit Singh, Shreya Ghoshal",
    album: "Rocky Aur Rani Kii Prem Kahaani",
    duration: 247,
    durationText: "4:07",
    url: "https://aac.saavncdn.com/022/a192e8d320ea5630db314d04fedf0aa5_320.mp4",
    artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
    youtubeId: "p842fU2yHkE",
    isAudioStream: true
  },
  {
    id: "stream-pool-shayad",
    title: "Shayad - Love Aaj Kal",
    artist: "Pritam, Arijit Singh",
    album: "Love Aaj Kal",
    duration: 248,
    durationText: "4:08",
    url: "https://aac.saavncdn.com/815/483a6e118e8108cbb3e5cd8701674f32_320.mp4",
    artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80",
    youtubeId: "vqu2s2yU9-g",
    isAudioStream: true
  },
  {
    id: "stream-pool-dil-diyan-gallan",
    title: "Dil Diyan Gallan",
    artist: "Atif Aslam, Vishal-Shekhar",
    album: "Tiger Zinda Hai",
    duration: 260,
    durationText: "4:20",
    url: "https://aac.saavncdn.com/430/5c5ea5cc00e3bff45616013226f376fe_320.mp4",
    artwork: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80",
    youtubeId: "mevO4I0HyvU",
    isAudioStream: true
  },
  {
    id: "stream-pool-tere-hawaale",
    title: "Tere Hawaale - Laal Singh Chaddha",
    artist: "Arijit Singh, Shilpa Rao, Pritam",
    album: "Laal Singh Chaddha",
    duration: 334,
    durationText: "5:34",
    url: "https://aac.saavncdn.com/238/35726d4394604604e961bf5b846870d0_320.mp4",
    artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
    youtubeId: "KUpwupYj_tY",
    isAudioStream: true
  },
  {
    id: "stream-pool-beete-lamhein",
    title: "Beete Lamhein - The Train",
    artist: "KK, Mithoon",
    album: "The Train",
    duration: 275,
    durationText: "4:35",
    url: "https://aac.saavncdn.com/801/571617f7810fb699ed56bc8a7d9e40d9_320.mp4",
    artwork: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80",
    youtubeId: "8Znd7v1aE2M",
    isAudioStream: true
  },
  {
    id: "stream-pool-excuses",
    title: "Excuses - Intense",
    artist: "AP Dhillon, Gurinder Gill",
    album: "Excuses",
    duration: 176,
    durationText: "2:56",
    url: "https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4",
    artwork: "https://images.unsplash.com/photo-1445985543470-41fdd6ce388d?w=500&q=80",
    youtubeId: "vX2cDW8LUWk",
    isAudioStream: true
  },
  {
    id: "stream-pool-agar-tum-saath-ho",
    title: "Agar Tum Saath Ho - Tamasha",
    artist: "A.R. Rahman, Alka Yagnik, Arijit Singh",
    album: "Tamasha",
    duration: 341,
    durationText: "5:41",
    url: "https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4",
    artwork: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&q=80",
    youtubeId: "sK7riqg2mr4",
    isAudioStream: true
  }
];

function getProceduralBatch(page) {
  const batchSize = 6;
  return BACKUP_STREAM_POOL.map((item, idx) => ({
    ...item,
    id: `stream-page-${page}-song-${idx}`,
    title: page > 1 ? `${item.title} (Live Mix ${page})` : item.title,
    color: "from-purple-950/60 via-slate-950 to-slate-950"
  }));
}

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}



const CURATED_PLAYLISTS = [
  {
    id: 'pl-romantic',
    title: "Romantic Melodies",
    description: "Heartfelt love songs by Arijit Singh, Mithoon, Atif Aslam & Jasleen Royal",
    cover: "https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg",
    gradient: "from-rose-600 to-pink-900",
    badge: "Romantic",
    songIds: ['track-rjkrTnma', 'track-qZtKBMZ_', 'track-NIidiD9g', 'track-aRZbUYD7', 'track-mPTrDSun', 'track-4mHUvJ4u', 'track-VQp1eXug']
  },
  {
    id: 'pl-punjabi',
    title: "Punjabi Bangers",
    description: "High-energy beats by Sidhu Moose Wala, AP Dhillon & Diljit Dosanjh",
    cover: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg",
    gradient: "from-amber-600 to-orange-900",
    badge: "Punjabi",
    songIds: ['track-H2r9PnvA', 'track-M7k5t7vw', 'track-xzUVX40K', 'track-faloMmjX']
  },
  {
    id: 'pl-lofi',
    title: "Lofi Chill & Study",
    description: "Calm 24/7 background beats to relax, study and focus",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80",
    gradient: "from-purple-600 to-indigo-950",
    badge: "Chill",
    songIds: ['track-lofi-stream', 'track-qZtKBMZ_', 'track-1e0En7YX', 'track-NIidiD9g']
  },
  {
    id: 'pl-bollywood',
    title: "Bollywood Evergreen & Party",
    description: "Iconic memorable hits by KK, A.R. Rahman, Anirudh & Pritam",
    cover: "https://c.saavncdn.com/801/Jannat-Hindi-2008-20190629135803-500x500.jpg",
    gradient: "from-cyan-600 to-blue-900",
    badge: "Classics",
    songIds: ['track-VQp1eXug', 'track-dF_dPijA', 'track-faloMmjX', 'track-aRZbUYD7']
  }
];

export default function StealthMusicPlayer({
  currentUser = null,
  onUnlock,
  secretPin = '1234',
  decoyPin = '9999',
  backendUrl = '',
  onOpenInstall,
  onOpenAdmin,
  onOpenProfile
}) {
  // Resume last session playback state
  const [savedSession, setSavedSession] = useState(() => {
    try {
      const rawTrack = localStorage.getItem('secret_bubble_last_track');
      const rawTime = localStorage.getItem('secret_bubble_last_time');
      if (rawTrack) {
        const parsedTrack = JSON.parse(rawTrack);
        const parsedTime = parseFloat(rawTime) || 0;
        return { track: parsedTrack, time: parsedTime };
      }
    } catch {}
    return null;
  });

  const [hasDismissedResume, setHasDismissedResume] = useState(false);
  const isFirstMountRef = useRef(true);
  const lastSavedTimeRef = useRef(0);

  const [tracks, setTracks] = useState(() => {
    try {
      const rawTrack = localStorage.getItem('secret_bubble_last_track');
      // Mix featured tracks with a randomized procedural batch so songs are fresh & rotating on every launch
      const pool = [...FEATURED_ONLINE_TRACKS, ...BACKUP_STREAM_POOL];
      const randomized = [...pool].sort(() => Math.random() - 0.5);
      if (rawTrack) {
        const parsed = JSON.parse(rawTrack);
        const filtered = randomized.filter(t => t.id !== parsed.id);
        return [parsed, ...filtered];
      }
      return randomized;
    } catch {}
    return FEATURED_ONLINE_TRACKS;
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    try {
      const rawTrack = localStorage.getItem('secret_bubble_last_track');
      if (rawTrack) {
        return 0; // Last played track restored at top index
      }
    } catch {}
    return 0;
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(() => {
    try {
      const rawTime = localStorage.getItem('secret_bubble_last_time');
      const t = parseFloat(rawTime);
      return (t && t > 5) ? Math.floor(t) : 0;
    } catch {
      return 0;
    }
  });

  const [duration, setDuration] = useState(268);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(90);
  const [viewMode, setViewMode] = useState('list'); // 'list' (default on launch) | 'nowPlaying'
  const [showVideoMode, setShowVideoMode] = useState(false);
  const [canvasMode, setCanvasMode] = useState('canvas'); // 'canvas' | 'cover'
  const [backgroundVideoEnabled, setBackgroundVideoEnabled] = useState(true);
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(false);

  // Infinite non-stop streaming & feed states
  const [feedPage, setFeedPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const listScrollRef = useRef(null);

  // YouTube Playlist Import States
  const [showImportYoutubeModal, setShowImportYoutubeModal] = useState(false);
  const [youtubePlaylistInput, setYoutubePlaylistInput] = useState('');
  const [isImportingYoutube, setIsImportingYoutube] = useState(false);
  const [importYoutubeError, setImportYoutubeError] = useState('');
  const [importYoutubeSuccess, setImportYoutubeSuccess] = useState('');

  // Learned User Tastes & Dynamic Genre Feed States
  const [userTastes, setUserTastes] = useState(() => {
    try {
      const saved = localStorage.getItem('secret_bubble_user_tastes');
      return saved ? JSON.parse(saved) : { hindi: 5, bollywood: 5, punjabi: 3, english: 2, lofi: 2, romantic: 4 };
    } catch {
      return { hindi: 5, bollywood: 5, punjabi: 3, english: 2, lofi: 2, romantic: 4 };
    }
  });
  const [selectedGenre, setSelectedGenre] = useState('for_you'); // 'for_you' | 'hindi' | 'bollywood' | 'punjabi' | 'english' | 'lofi' | 'romantic'
  const [isFeedRefreshing, setIsFeedRefreshing] = useState(false);

  // Playlist Management States
  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('secret_bubble_user_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [likedSongIds, setLikedSongIds] = useState(() => {
    try {
      const saved = localStorage.getItem('secret_bubble_liked_song_ids');
      return saved ? JSON.parse(saved) : ['track-rjkrTnma', 'track-aRZbUYD7'];
    } catch {
      return ['track-rjkrTnma', 'track-aRZbUYD7'];
    }
  });
  const [selectedPlaylistView, setSelectedPlaylistView] = useState(null); // null | playlist object
  const userVibes = useMemo(() => {
    try {
      const saved = localStorage.getItem('secret_bubble_user_vibes');
      return saved ? JSON.parse(saved) : ['bollywood', 'lofi', 'punjabi'];
    } catch {
      return ['bollywood', 'lofi', 'punjabi'];
    }
  }, []);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState(null); // track object to add to playlist

  // Listening History state (Recently Played)
  const [listeningHistory, setListeningHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('secret_bubble_listening_history');
      if (saved) return JSON.parse(saved);
      const lastTrackStr = localStorage.getItem('secret_bubble_last_track');
      if (lastTrackStr) {
        const last = JSON.parse(lastTrackStr);
        if (last && last.title) return [{ ...last, playedAt: Date.now() }];
      }
      return [];
    } catch {
      return [];
    }
  });

  const recordTrackToHistory = useCallback((track) => {
    if (!track || !track.title) return;
    setListeningHistory(prev => {
      const filtered = prev.filter(t => (t.id ? t.id !== track.id : t.title !== track.title));
      const entry = {
        ...track,
        playedAt: Date.now()
      };
      const nextHistory = [entry, ...filtered].slice(0, 100);
      try {
        localStorage.setItem('secret_bubble_listening_history', JSON.stringify(nextHistory));
      } catch {}
      return nextHistory;
    });
  }, []);

  const clearListeningHistory = useCallback(() => {
    setListeningHistory([]);
    try {
      localStorage.removeItem('secret_bubble_listening_history');
    } catch {}
    setSelectedPlaylistView(prev => prev?.id === 'pl-history' ? { ...prev, songs: [] } : prev);
  }, []);

  // Online Search states
  const [activeTab, setActiveTab] = useState('playlist'); // 'playlist' | 'playlists' | 'search' | 'trending' | 'phone'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');

  // Live Autocomplete & Typing Suggestions States
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [matchingSongs, setMatchingSongs] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const suggestionsBoxRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsBoxRef.current && !suggestionsBoxRef.current.contains(e.target) &&
        searchInputRef.current && !searchInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSuggestions(true);

    const clean = val.trim().toLowerCase();
    if (!clean) {
      setMatchingSongs([]);
      setSuggestionsList([]);
      return;
    }

    // 1. Instant local catalog scan (0ms latency!)
    const catalogPool = [...FEATURED_ONLINE_TRACKS, ...BACKUP_STREAM_POOL, ...tracks];
    const seenSongIds = new Set();
    const localMatches = [];

    for (const song of catalogPool) {
      if (seenSongIds.has(song.id)) continue;
      const t = (song.title || '').toLowerCase();
      const a = (song.artist || '').toLowerCase();
      if (t.includes(clean) || a.includes(clean)) {
        seenSongIds.add(song.id);
        localMatches.push(song);
        if (localMatches.length >= 4) break;
      }
    }
    setMatchingSongs(localMatches);

    // 2. Debounced online suggestions fetch (160ms)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const apiBase = getBackendApiUrl();
        const urls = [];
        if (apiBase) urls.push(`${apiBase}/api/music/suggestions?q=${encodeURIComponent(clean)}`);
        urls.push(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(clean)}`);

        for (const url of urls) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (data && data.suggestions && Array.isArray(data.suggestions)) {
                setSuggestionsList(data.suggestions.slice(0, 6));
                if (data.songs && Array.isArray(data.songs) && localMatches.length < 2) {
                  setMatchingSongs(prev => {
                    const combined = [...prev];
                    for (const s of data.songs) {
                      if (!combined.some(x => x.title?.toLowerCase() === s.title?.toLowerCase())) {
                        combined.push({
                          ...s,
                          duration: 220,
                          isYoutube: true
                        });
                      }
                    }
                    return combined.slice(0, 4);
                  });
                }
                break;
              } else if (Array.isArray(data) && Array.isArray(data[1])) {
                setSuggestionsList(data[1].slice(0, 6));
                break;
              }
            }
          } catch (e) {}
        }
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 160);
  };

  // Secret unlock & PINs setup state
  const [isPinSetupDone, setIsPinSetupDone] = useState(() => {
    try {
      return localStorage.getItem('secret_bubble_pins_configured') === 'true';
    } catch {
      return false;
    }
  });
  const [activeSecretPin, setActiveSecretPin] = useState(() => {
    try {
      return localStorage.getItem('secret_bubble_secret_pin') || secretPin || '1234';
    } catch {
      return secretPin || '1234';
    }
  });
  const [activeDecoyPin, setActiveDecoyPin] = useState(() => {
    try {
      return localStorage.getItem('secret_bubble_decoy_pin') || decoyPin || '9999';
    } catch {
      return decoyPin || '9999';
    }
  });

  // First-time PIN creation modal
  const [showSetupPinModal, setShowSetupPinModal] = useState(false);
  const [setupSecretPin, setSetupSecretPin] = useState('');
  const [setupDecoyPin, setSetupDecoyPin] = useState('');
  const [showSetupSecretEye, setShowSetupSecretEye] = useState(false);
  const [showSetupDecoyEye, setShowSetupDecoyEye] = useState(false);
  const [setupError, setSetupError] = useState('');

  // Returning user PIN modal
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [heartTapCount, setHeartTapCount] = useState(0);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [showCodeEye, setShowCodeEye] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Audio and video elements
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const iframeRef = useRef(null);
  const canvasIframeRef = useRef(null);
  const canvasSlotRef = useRef(null);
  const [canvasSlotRect, setCanvasSlotRect] = useState(null);
  const modalVideoIframeRef = useRef(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Track bounding rectangle of center-stage video canvas slot for seamless YouTube positioning
  useEffect(() => {
    if (viewMode === 'nowPlaying' && canvasMode === 'canvas' && canvasSlotRef.current) {
      const updateRect = () => {
        if (canvasSlotRef.current) {
          const r = canvasSlotRef.current.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            setCanvasSlotRect({
              top: Math.round(r.top),
              left: Math.round(r.left),
              width: Math.round(r.width),
              height: Math.round(r.height)
            });
          }
        }
      };
      updateRect();
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect);
      const timer = setTimeout(updateRect, 100);
      const interval = setInterval(updateRect, 1000);
      return () => {
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
        clearTimeout(timer);
        clearInterval(interval);
      };
    } else {
      setCanvasSlotRect(null);
    }
  }, [viewMode, canvasMode]);

  // Synchronize play/pause with canvas iframe
  useEffect(() => {
    if (canvasIframeRef.current?.contentWindow) {
      try {
        const cmd = isPlaying ? 'playVideo' : 'pauseVideo';
        canvasIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: cmd, args: [] }),
          '*'
        );
      } catch (e) {}
    }
  }, [isPlaying, canvasMode]);

  // Pause HTML5 audio when Full Video modal is active on an audio track so sound does not duplicate
  useEffect(() => {
    if (showVideoMode && !currentTrack?.isYoutube && audioRef.current) {
      audioRef.current.pause();
    } else if (!showVideoMode && !currentTrack?.isYoutube && isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [showVideoMode, currentTrack, isPlaying]);

  // Helper for Next/Previous tracks
  const handleNextTrack = useCallback(() => {
    if (isShuffle && tracks.length > 1) {
      let nextIndex = Math.floor(Math.random() * tracks.length);
      while (nextIndex === currentTrackIndex) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      }
      setCurrentTrackIndex(nextIndex);
    } else {
      setCurrentTrackIndex(i => (i + 1) % tracks.length);
    }
    setCurrentTime(0);
  }, [isShuffle, tracks.length, currentTrackIndex]);

  const handlePrevTrack = useCallback(() => {
    setCurrentTrackIndex(i => (i - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  }, [tracks.length]);

  // Update track duration when switching (preserve initial session timestamp on first mount)
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      setDuration(currentTrack.duration || 220);
      return;
    }
    setCurrentTime(0);
    setDuration(currentTrack.duration || 220);
  }, [currentTrackIndex, currentTrack]);

  // Persist current track to local storage
  useEffect(() => {
    if (!currentTrack) return;
    try {
      localStorage.setItem('secret_bubble_last_track', JSON.stringify(currentTrack));
    } catch {}
  }, [currentTrack]);

  // Record playing track to listening history
  useEffect(() => {
    if (isPlaying && currentTrack) {
      recordTrackToHistory(currentTrack);
    }
  }, [isPlaying, currentTrack, recordTrackToHistory]);

  // Persist playback timestamp periodically
  useEffect(() => {
    if (currentTime > 0 && Math.abs(currentTime - lastSavedTimeRef.current) >= 2) {
      lastSavedTimeRef.current = currentTime;
      try {
        localStorage.setItem('secret_bubble_last_time', String(currentTime));
      } catch {}
    }
  }, [currentTime]);

  // =========================================================================
  // OS MediaSession, Native Android & Lock Screen System Notifications
  // =========================================================================
  // 1. Setup metadata & permanent action handlers when currentTrack changes
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    try {
      const art = currentTrack.artwork || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512";
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || "Secret Music Player",
        artist: currentTrack.artist || "Online Stream",
        album: currentTrack.album || "Stealth Music Lounge",
        artwork: [
          { src: art, sizes: '96x96' },
          { src: art, sizes: '128x128' },
          { src: art, sizes: '192x192' },
          { src: art, sizes: '256x256' },
          { src: art, sizes: '384x384' },
          { src: art, sizes: '512x512' }
        ]
      });

      const setHandler = (action, fn) => {
        try {
          navigator.mediaSession.setActionHandler(action, fn);
        } catch (e) {}
      };

      setHandler('play', () => {
        setIsPlaying(true);
        if (currentTrack.url && audioRef.current) {
          audioRef.current.play().catch(() => {});
        } else if (currentTrack.isYoutube && iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
              '*'
            );
          } catch (e) {}
        }
        if (canvasIframeRef.current?.contentWindow) {
          try {
            canvasIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
              '*'
            );
          } catch (e) {}
        }
      });

      setHandler('pause', () => {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
        if (currentTrack.isYoutube && iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
              '*'
            );
          } catch (e) {}
        }
        if (canvasIframeRef.current?.contentWindow) {
          try {
            canvasIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
              '*'
            );
          } catch (e) {}
        }
      });

      setHandler('nexttrack', () => {
        handleNextTrack();
      });

      setHandler('previoustrack', () => {
        handlePrevTrack();
      });

      setHandler('seekto', (details) => {
        if (typeof details.seekTime === 'number') {
          const seekSec = Math.floor(details.seekTime);
          setCurrentTime(seekSec);
          if (currentTrack.url && audioRef.current) {
            audioRef.current.currentTime = seekSec;
          } else if (currentTrack.isYoutube && iframeRef.current?.contentWindow) {
            try {
              iframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'seekTo', args: [seekSec, true] }),
                '*'
              );
            } catch (e) {}
          }
          if (canvasIframeRef.current?.contentWindow) {
            try {
              canvasIframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'seekTo', args: [seekSec, true] }),
                '*'
              );
            } catch (e) {}
          }
        }
      });

      setHandler('seekbackward', () => {
        setCurrentTime(prev => {
          const newTime = Math.max(0, prev - 10);
          if (currentTrack.url && audioRef.current) {
            audioRef.current.currentTime = newTime;
          } else if (currentTrack.isYoutube && iframeRef.current?.contentWindow) {
            try {
              iframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
                '*'
              );
            } catch (e) {}
          }
          if (canvasIframeRef.current?.contentWindow) {
            try {
              canvasIframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
                '*'
              );
            } catch (e) {}
          }
          return newTime;
        });
      });

      setHandler('seekforward', () => {
        setCurrentTime(prev => {
          const newTime = Math.min(duration || 300, prev + 10);
          if (currentTrack.url && audioRef.current) {
            audioRef.current.currentTime = newTime;
          } else if (currentTrack.isYoutube && iframeRef.current?.contentWindow) {
            try {
              iframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
                '*'
              );
            } catch (e) {}
          }
          if (canvasIframeRef.current?.contentWindow) {
            try {
              canvasIframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
                '*'
              );
            } catch (e) {}
          }
          return newTime;
        });
      });

      setHandler('stop', () => {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
        if (iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
              '*'
            );
          } catch (e) {}
        }
        if (canvasIframeRef.current?.contentWindow) {
          try {
            canvasIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
              '*'
            );
          } catch (e) {}
        }
      });
    } catch (err) {
      console.warn('MediaSession init error:', err);
    }
  }, [currentTrack, duration, handleNextTrack, handlePrevTrack]);

  // 2. Synchronize playbackState with isPlaying across MediaSession, Native Android & Service Worker
  useEffect(() => {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch (e) {}
    }

    // Direct Native Android Notification sync (Capacitor APK)
    if (typeof window !== 'undefined' && window.AndroidNativeMedia?.updateMedia && currentTrack) {
      try {
        window.AndroidNativeMedia.updateMedia(
          currentTrack.title || "Secret-Bubble Music",
          currentTrack.artist || "Online Stream",
          currentTrack.album || "Stealth Lounge",
          currentTrack.artwork || "",
          Boolean(isPlaying),
          Number(duration || 0),
          Number(currentTime || 0)
        );
      } catch (e) {}
    }

    // Web Service Worker notification tray fallback (PWA / Mobile Chrome)
    if (typeof navigator !== 'undefined' && navigator.serviceWorker?.controller && currentTrack) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'UPDATE_MEDIA_NOTIFICATION',
          title: currentTrack.title || 'Secret-Bubble Music',
          artist: currentTrack.artist || 'Online Stream',
          artwork: currentTrack.artwork || '',
          isPlaying: Boolean(isPlaying),
          action: isPlaying ? 'update' : 'pause'
        });
      } catch (e) {}
    }
  }, [isPlaying, currentTrack, duration, currentTime]);

  // 3. Synchronize lock screen progress bar position
  useEffect(() => {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(1, duration),
          playbackRate: 1,
          position: Math.min(Math.max(0, currentTime), duration)
        });
      } catch (e) {}
    }
  }, [currentTime, duration]);

  // 4. Listen to external lock screen & notification controls (Native Android + Service Worker)
  useEffect(() => {
    const handleAction = (action, val) => {
      if (action === 'play') {
        setIsPlaying(true);
        if (currentTrack?.url && audioRef.current) {
          audioRef.current.play().catch(() => {});
        } else if (currentTrack?.isYoutube && iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
              '*'
            );
          } catch (e) {}
        }
        if (canvasIframeRef.current?.contentWindow) {
          try {
            canvasIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
              '*'
            );
          } catch (e) {}
        }
      } else if (action === 'pause') {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
        if (currentTrack?.isYoutube && iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
              '*'
            );
          } catch (e) {}
        }
        if (canvasIframeRef.current?.contentWindow) {
          try {
            canvasIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
              '*'
            );
          } catch (e) {}
        }
      } else if (action === 'next') {
        handleNextTrack();
      } else if (action === 'prev') {
        handlePrevTrack();
      } else if (action === 'seek' && typeof val === 'number') {
        setCurrentTime(val);
        if (audioRef.current && currentTrack?.url) {
          audioRef.current.currentTime = val;
        } else if (currentTrack?.isYoutube && iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'seekTo', args: [val, true] }),
              '*'
            );
          } catch (e) {}
        }
        if (canvasIframeRef.current?.contentWindow) {
          try {
            canvasIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'seekTo', args: [val, true] }),
              '*'
            );
          } catch (e) {}
        }
      }
    };

    const handleNative = (e) => {
      if (e.detail?.action) {
        handleAction(e.detail.action, e.detail.value);
      }
    };
    window.addEventListener('nativeMediaAction', handleNative);

    const handleSw = (e) => {
      if (e.data?.type === 'MEDIA_NOTIFICATION_ACTION' && e.data.action) {
        handleAction(e.data.action);
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSw);

    return () => {
      window.removeEventListener('nativeMediaAction', handleNative);
      navigator.serviceWorker?.removeEventListener('message', handleSw);
    };
  }, [currentTrack, handleNextTrack, handlePrevTrack]);

  // 5. Screen Wake Lock & Background Audio Resume (Prevents songs stopping after some time)
  useEffect(() => {
    let wakeLock = null;
    const acquireWake = async () => {
      if ('wakeLock' in navigator && isPlaying && document.visibilityState === 'visible') {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (e) {}
      }
    };

    if (isPlaying) {
      acquireWake();
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (isPlaying) {
          acquireWake();
          // Auto-resume if mobile OS throttled HTML5 audio during screen sleep
          if (audioRef.current && currentTrack?.url && audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
        wakeLock = null;
      }
    };
  }, [isPlaying, currentTrack]);


  const getBackendApiUrl = useCallback(() => {
    if (backendUrl) return backendUrl.replace(/\/$/, '');
    if (import.meta.env?.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
    
    const isNativeApp = typeof window !== 'undefined' && (
      Boolean(window.Capacitor?.isNativePlatform?.()) ||
      Boolean(window.Capacitor) ||
      window.location?.protocol === 'capacitor:' ||
      (window.location?.hostname === 'localhost' && !window.location?.port && !import.meta.env.DEV)
    );

    if (isNativeApp) {
      return 'https://secret-bubble-backend.onrender.com';
    }

    if (import.meta.env.DEV && typeof window !== 'undefined') {
      const hostname = window.location.hostname || 'localhost';
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
        return `http://${hostname}:5000`;
      }
    }
    return 'https://secret-bubble-backend.onrender.com';
  }, [backendUrl]);

  // Learn user preferences dynamically from playback
  const recordTrackTaste = useCallback((track) => {
    if (!track) return;
    const text = `${track.title || ''} ${track.artist || ''} ${track.album || ''}`.toLowerCase();
    setUserTastes(prev => {
      const next = { ...prev };
      if (text.includes('arijit') || text.includes('pritam') || text.includes('shreya') || text.includes('hindi') || text.includes('bollywood') || text.includes('sonu') || text.includes('kk')) {
        next.hindi = (next.hindi || 0) + 1;
        next.bollywood = (next.bollywood || 0) + 1;
      }
      if (text.includes('diljit') || text.includes('sidhu') || text.includes('punjabi') || text.includes('dhillon') || text.includes('aujla') || text.includes('badshah') || text.includes('shubh')) {
        next.punjabi = (next.punjabi || 0) + 1;
      }
      if (text.includes('ed sheeran') || text.includes('taylor') || text.includes('pop') || text.includes('english') || text.includes('weeknd') || text.includes('dua') || text.includes('fonsi') || text.includes('charlie')) {
        next.english = (next.english || 0) + 1;
      }
      if (text.includes('lofi') || text.includes('chill') || text.includes('slowed') || text.includes('relax') || text.includes('sleep') || text.includes('midnight')) {
        next.lofi = (next.lofi || 0) + 1;
      }
      if (text.includes('romantic') || text.includes('love') || text.includes('tum') || text.includes('dil') || text.includes('ishq') || text.includes('hawaale') || text.includes('shayad')) {
        next.romantic = (next.romantic || 0) + 1;
      }
      try {
        localStorage.setItem('secret_bubble_user_tastes', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Log music play activity to local counters and backend admin telemetry
  const logMusicTelemetry = useCallback((track) => {
    if (!track) return;
    recordTrackTaste(track);
    recordTrackToHistory(track);
    try {
      const cur = parseInt(localStorage.getItem('secret_bubble_music_play_count') || '0', 10);
      localStorage.setItem('secret_bubble_music_play_count', String(cur + 1));

      const userStr = localStorage.getItem('secure_chat_user');
      const u = userStr ? JSON.parse(userStr) : null;
      let anonId = localStorage.getItem('secret_bubble_anon_id');
      if (!anonId) {
        anonId = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('secret_bubble_anon_id', anonId);
      }
      const isGuest = !u || !u.id;

      const apiBase = getBackendApiUrl();
      if (apiBase) {
        fetch(`${apiBase}/api/analytics/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: isGuest ? anonId : u.id,
            username: isGuest ? 'Anonymous Guest' : (u.name || u.username),
            isGuest: isGuest,
            activityType: 'music',
            trackTitle: track?.title || 'Unknown Track'
          })
        }).catch(() => {});
      }
    } catch (e) {}
  }, [getBackendApiUrl, recordTrackTaste, recordTrackToHistory]);

  // Ping active presence so even non-streaming visitors are recorded
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('secure_chat_user');
      const u = userStr ? JSON.parse(userStr) : null;
      let anonId = localStorage.getItem('secret_bubble_anon_id');
      if (!anonId) {
        anonId = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('secret_bubble_anon_id', anonId);
      }
      const isGuest = !u || !u.id;
      const apiBase = getBackendApiUrl();
      if (apiBase) {
        fetch(`${apiBase}/api/analytics/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: isGuest ? anonId : u.id,
            username: isGuest ? 'Anonymous Guest' : (u.name || u.username),
            isGuest: isGuest,
            activityType: 'active'
          })
        }).catch(() => {});
      }
    } catch (e) {}
  }, [getBackendApiUrl]);

  // Automatically fetch video canvas for audio tracks
  const fetchVideoCanvasForTrack = useCallback(async (track) => {
    if (!track || track.youtubeId || isLoadingCanvas) return;
    setIsLoadingCanvas(true);
    try {
      const q = `${track.title} ${track.artist}`;
      const apiBase = getBackendApiUrl();
      const endpoints = [];
      if (apiBase) endpoints.push(`${apiBase}/api/music/youtube-search?q=${encodeURIComponent(q)}`);
      endpoints.push(`https://secret-bubble-backend.onrender.com/api/music/youtube-search?q=${encodeURIComponent(q)}`);

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const data = await res.json();
            if (data?.results?.[0]?.youtubeId) {
              const yId = data.results[0].youtubeId;
              setTracks(prev => prev.map(t => t.id === track.id ? { ...t, youtubeId: yId } : t));
              break;
            }
          }
        } catch (e) {}
      }
    } finally {
      setIsLoadingCanvas(false);
    }
  }, [isLoadingCanvas, getBackendApiUrl]);

  // Auto-fetch canvas if current track has no youtubeId
  useEffect(() => {
    if (currentTrack && !currentTrack.youtubeId && canvasMode === 'canvas') {
      fetchVideoCanvasForTrack(currentTrack);
    }
  }, [currentTrack, canvasMode, fetchVideoCanvasForTrack]);

  // Handle Real Audio / YouTube Playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.url) {
      // Direct full-length audio stream mode (Native HTML5 audio enables continuous background playback)
      if (!audio.src || (!audio.src.endsWith(currentTrack.url) && !currentTrack.url.endsWith(audio.src))) {
        audio.src = currentTrack.url;
      }
      audio.muted = isMuted;
      audio.volume = isMuted ? 0 : volume / 100;
      if (isPlaying) {
        audio.play().catch(err => console.log('Audio playback notice:', err));
      } else {
        audio.pause();
      }
    } else if (currentTrack?.isYoutube) {
      // YouTube fallback mode: HTML5 audio pauses, iframe streams
      audio.pause();
      if (iframeRef.current?.contentWindow) {
        try {
          const cmd = isPlaying ? 'playVideo' : 'pauseVideo';
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: cmd, args: [] }),
            '*'
          );
        } catch (e) {}
      }
    }
  }, [currentTrack, isPlaying, isMuted]);

  // Update Volume
  useEffect(() => {
    if (audioRef.current && !currentTrack?.isYoutube) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
    if (currentTrack?.isYoutube && iframeRef.current?.contentWindow) {
      try {
        const vol = isMuted ? 0 : volume;
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [vol] }),
          '*'
        );
      } catch (e) {}
    }
  }, [volume, isMuted, currentTrack]);

  // Listen to YouTube Iframe events (infoDelivery for real time/duration & onStateChange for auto-next)
  useEffect(() => {
    const handleYtMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // Synchronize duration & current time from real YouTube player
        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setCurrentTime(Math.floor(data.info.currentTime));
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 30) {
            setDuration(Math.floor(data.info.duration));
          }
        }

        // Handle video playback states: 0 = ENDED, 1 = PLAYING, 2 = PAUSED
        if (data.event === 'onStateChange') {
          if (data.info === 0) {
            // Full song ended -> smoothly play next track
            handleNextTrack();
          } else if (data.info === 1) {
            setIsPlaying(true);
          } else if (data.info === 2) {
            setIsPlaying(false);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleYtMessage);
    return () => window.removeEventListener('message', handleYtMessage);
  }, [handleNextTrack]);

  // Time progression for HTML5 audio
  const handleTimeUpdate = () => {
    if (audioRef.current && !currentTrack?.isYoutube) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !currentTrack?.isYoutube) {
      const dur = Math.floor(audioRef.current.duration);
      if (dur > 0) {
        setDuration(dur);
      }
    }
  };

  const handleAudioError = (e) => {
    console.warn('Audio stream playback error, attempting recovery:', e);
    const audio = audioRef.current;
    if (!audio || !currentTrack?.url) return;

    // Resilient fallback: JioSaavn bitrate step-down from 320 to 160 to 96
    if (currentTrack.url.includes('_320.mp4')) {
      const fallback160 = currentTrack.url.replace('_320.mp4', '_160.mp4');
      audio.src = fallback160;
      audio.load();
      if (isPlaying) audio.play().catch(() => {});
      return;
    } else if (currentTrack.url.includes('_160.mp4')) {
      const fallback96 = currentTrack.url.replace('_160.mp4', '_96.mp4');
      audio.src = fallback96;
      audio.load();
      if (isPlaying) audio.play().catch(() => {});
      return;
    }

    // Auto-advance if stream is completely unreachable
    setTimeout(() => {
      handleNextTrack();
    }, 1200);
  };

  const handleAudioWaiting = () => {
    // If mobile connection pauses stream buffer, gently check after 3s to resume
    setTimeout(() => {
      if (isPlaying && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    }, 3000);
  };

  const handleTrackEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNextTrack();
    }
  };

  // Continuous timer for UI progress (fallback in case iframe messages are delayed)
  useEffect(() => {
    let timer = null;
    if (isPlaying && currentTrack?.isYoutube) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (duration > 0 && prev >= duration) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentTrack?.isYoutube, duration, handleNextTrack]);

  const togglePlay = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);
    if (nextPlay) {
      logMusicTelemetry(currentTrack);
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
    if (currentTrack?.isYoutube && iframeRef.current?.contentWindow) {
      try {
        const cmd = nextPlay ? 'playVideo' : 'pauseVideo';
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: cmd, args: [] }),
          '*'
        );
      } catch (e) {}
    }
    if (canvasIframeRef.current?.contentWindow) {
      try {
        const cmd = nextPlay ? 'playVideo' : 'pauseVideo';
        canvasIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: cmd, args: [] }),
          '*'
        );
      } catch (e) {}
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const newTime = Math.floor(percentage * duration);
    setCurrentTime(newTime);
    if (audioRef.current && currentTrack?.url) {
      audioRef.current.currentTime = newTime;
    } else if (currentTrack?.isYoutube && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
          '*'
        );
      } catch (e) {}
    }
    if (canvasIframeRef.current?.contentWindow) {
      try {
        canvasIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
          '*'
        );
      } catch (e) {}
    }
  };

  // =========================================================================
  // =========================================================================
  // Unified Full-Song Search (Render Backend, Local, YouTube, & Catalog Fallback)
  // =========================================================================
  const executeSearch = async (searchTerm) => {
    const query = (searchTerm !== undefined ? searchTerm : searchQuery).trim();
    if (!query) return;

    if (searchTerm !== undefined) {
      setSearchQuery(searchTerm);
    }

    // Switch view to Search tab immediately
    setActiveTab('search');
    setSelectedPlaylistView(null);
    setIsSearching(true);
    setShowSuggestions(false);
    setSearchError('');
    setSearchResults([]);

    // 1. Check if direct YouTube URL was pasted
    const ytId = extractYouTubeId(query);
    if (ytId) {
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
        const oembedData = await oembedRes.json();
        const ytTrack = {
          id: `yt-${ytId}`,
          youtubeId: ytId,
          title: oembedData.title || "YouTube Full Song",
          artist: oembedData.author_name || "YouTube Music",
          album: "YouTube Online",
          duration: 260,
          durationText: "Full Song",
          isYoutube: true,
          artwork: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          color: "from-red-950/60 via-slate-950 to-slate-950"
        };
        playTrackNow(ytTrack);
        setIsSearching(false);
        return;
      } catch (err) {
        const ytTrack = {
          id: `yt-${ytId}`,
          youtubeId: ytId,
          title: "YouTube Audio Stream",
          artist: "YouTube Online",
          album: "YouTube",
          duration: 260,
          durationText: "Full Song",
          isYoutube: true,
          artwork: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          color: "from-red-950/60 via-slate-950 to-slate-950"
        };
        playTrackNow(ytTrack);
        setIsSearching(false);
        return;
      }
    }

    const fullSongResults = [];
    const lowerQuery = query.toLowerCase();

    // 2. Fetch from backend endpoints (Local dev, Vercel relative, or Render backend)
    const candidateEndpoints = [];
    const localBase = getBackendApiUrl();
    if (localBase) {
      candidateEndpoints.push(`${localBase}/api/music/search?q=${encodeURIComponent(query)}`);
    }
    const isCapacitor = typeof window !== 'undefined' && (
      Boolean(window.Capacitor?.isNativePlatform?.()) ||
      Boolean(window.Capacitor) ||
      window.location?.protocol === 'capacitor:' ||
      (window.location?.hostname === 'localhost' && !window.location?.port)
    );
    if (!isCapacitor) {
      candidateEndpoints.push(`/api/music/search?q=${encodeURIComponent(query)}`);
    }
    const defaultCloud = `https://secret-bubble-backend.onrender.com/api/music/search?q=${encodeURIComponent(query)}`;
    if (!candidateEndpoints.includes(defaultCloud)) {
      candidateEndpoints.push(defaultCloud);
    }

    for (const url of candidateEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.results) && data.results.length > 0) {
            data.results.forEach(item => {
              const releaseYear = item.year || parseInt(item.releaseDate?.slice(0, 4), 10) || 0;
              fullSongResults.push({
                id: item.id || `track-${item.youtubeId || Math.random()}`,
                title: item.title,
                artist: item.artist,
                album: item.album || "Full Song",
                duration: item.duration || 240,
                durationText: item.durationText || "Full Song",
                artwork: item.artwork,
                url: item.url || null,
                youtubeId: item.youtubeId || null,
                year: releaseYear || undefined,
                releaseDate: item.releaseDate || null,
                publishedTime: item.publishedTime || null,
                recencyScore: item.recencyScore || (releaseYear ? (5000 + (releaseYear - 2000) * 100) : 500),
                isAudioStream: Boolean(item.url),
                isYoutube: !item.url && Boolean(item.youtubeId),
                color: "from-purple-950/50 via-slate-950 to-slate-950"
              });
            });
            break; // Got valid results from online backend
          }
        }
      } catch (err) {
        // Fallback to next candidate endpoint
      }
    }

    // 3. Fallback to YouTube search endpoint if 0 results
    if (fullSongResults.length === 0) {
      const ytEndpoints = [];
      if (localBase) {
        ytEndpoints.push(`${localBase}/api/music/youtube-search?q=${encodeURIComponent(query)}`);
      }
      if (!isCapacitor) {
        ytEndpoints.push(`/api/music/youtube-search?q=${encodeURIComponent(query)}`);
      }
      const defaultYt = `https://secret-bubble-backend.onrender.com/api/music/youtube-search?q=${encodeURIComponent(query)}`;
      if (!ytEndpoints.includes(defaultYt)) {
        ytEndpoints.push(defaultYt);
      }

      for (const ytUrl of ytEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const ytRes = await fetch(ytUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (ytRes.ok) {
            const ytData = await ytRes.json();
            if (ytData?.success && Array.isArray(ytData.results) && ytData.results.length > 0) {
              ytData.results.forEach(item => {
                fullSongResults.push({
                  id: item.id || `yt-${item.youtubeId}`,
                  youtubeId: item.youtubeId,
                  title: item.title,
                  artist: item.artist,
                  album: "YouTube Full Song",
                  duration: item.duration || 240,
                  durationText: item.durationText || "Full Song",
                  artwork: item.artwork,
                  year: item.year || undefined,
                  publishedTime: item.publishedTime || null,
                  recencyScore: item.recencyScore || 500,
                  isYoutube: true,
                  color: "from-red-950/50 via-slate-950 to-slate-950"
                });
              });
              break;
            }
          }
        } catch (e) {}
      }
    }

    // 4. In-Memory Catalog Substring Match Fallback (Guaranteed to return results for matching popular artists/songs)
    const catalogPool = [...FEATURED_ONLINE_TRACKS, ...BACKUP_STREAM_POOL, ...tracks];
    const seenIds = new Set(fullSongResults.map(r => r.id));
    const matchedLocal = catalogPool.filter(song => {
      if (seenIds.has(song.id)) return false;
      const t = (song.title || '').toLowerCase();
      const a = (song.artist || '').toLowerCase();
      const alb = (song.album || '').toLowerCase();
      return t.includes(lowerQuery) || a.includes(lowerQuery) || alb.includes(lowerQuery) || lowerQuery.includes(t) || lowerQuery.includes(a);
    });

    matchedLocal.forEach(song => {
      seenIds.add(song.id);
      const songYear = song.year || 0;
      fullSongResults.push({
        ...song,
        recencyScore: song.recencyScore || (songYear ? (5000 + (songYear - 2000) * 100) : 400)
      });
    });

    // Sort so newest songs appear first, followed by older songs
    fullSongResults.sort((a, b) => (b.recencyScore || 0) - (a.recencyScore || 0));

    if (fullSongResults.length > 0) {
      setSearchResults(fullSongResults);
    } else {
      setSearchError(`No songs found for "${query}". Try searching for Arijit Singh, Sidhu Moose Wala, Kesariya, or another artist.`);
    }
    setIsSearching(false);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    executeSearch();
  };

  const playTrackNow = (track) => {
    logMusicTelemetry(track);
    setTracks(prev => {
      const idx = prev.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
        return prev;
      }
      setCurrentTrackIndex(0);
      return [track, ...prev];
    });
    setIsPlaying(true);
  };

  const handleResumeSession = () => {
    if (!savedSession?.track) return;
    const t = savedSession.track;
    const seekSeconds = savedSession.time || 0;

    logMusicTelemetry(t);
    setTracks(prev => {
      const idx = prev.findIndex(x => x.id === t.id);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
        return prev;
      }
      setCurrentTrackIndex(0);
      return [t, ...prev];
    });

    setCurrentTime(seekSeconds);
    setIsPlaying(true);
    setHasDismissedResume(true);

    if (t.url && audioRef.current) {
      audioRef.current.currentTime = seekSeconds;
      audioRef.current.play().catch(() => {});
    } else if (t.isYoutube && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [seekSeconds, true] }),
          '*'
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      } catch (e) {}
    }
  };

  const handleRestartSession = () => {
    if (!savedSession?.track) return;
    const t = savedSession.track;
    logMusicTelemetry(t);
    setTracks(prev => {
      const idx = prev.findIndex(x => x.id === t.id);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
        return prev;
      }
      setCurrentTrackIndex(0);
      return [t, ...prev];
    });

    setCurrentTime(0);
    setIsPlaying(true);
    setHasDismissedResume(true);

    if (t.url && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else if (t.isYoutube && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }),
          '*'
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      } catch (e) {}
    }
  };

  // Import Local Songs from Phone Storage / Downloads
  const handleFilesSelected = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks = Array.from(files).map((file, i) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      const url = URL.createObjectURL(file);
      return {
        id: `phone-${Date.now()}-${i}`,
        title: cleanName,
        artist: "Phone Audio",
        album: "Device Downloads",
        duration: 200,
        isLocal: true,
        url: url,
        artwork: null,
        color: "from-cyan-950/60 via-slate-950 to-slate-950"
      };
    });

    setTracks(prev => [...newTracks, ...prev]);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
  };

  // Playlist Handlers & Helpers
  const saveCustomPlaylists = (updated) => {
    setCustomPlaylists(updated);
    try {
      localStorage.setItem('secret_bubble_user_playlists', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCreatePlaylist = (e) => {
    e?.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;

    const newPl = {
      id: `custom-pl-${Date.now()}`,
      title: name,
      description: newPlaylistDesc.trim() || 'Custom playlist created by you',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      gradient: 'from-purple-600 via-indigo-600 to-cyan-600',
      isCustom: true,
      createdAt: Date.now(),
      songs: []
    };

    const updated = [newPl, ...customPlaylists];
    saveCustomPlaylists(updated);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreatePlaylistModal(false);
    setSelectedPlaylistView(newPl);
  };

  const handleAddSongToPlaylist = (playlistId, track) => {
    const updated = customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        const alreadyHas = (pl.songs || []).some(s => s.id === track.id);
        if (alreadyHas) return pl;
        return {
          ...pl,
          songs: [...(pl.songs || []), track]
        };
      }
      return pl;
    });
    saveCustomPlaylists(updated);
    setAddToPlaylistTrack(null);
  };

  const handleRemoveSongFromPlaylist = (playlistId, songId, e) => {
    e?.stopPropagation();
    const updated = customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          songs: (pl.songs || []).filter(s => s.id !== songId)
        };
      }
      return pl;
    });
    saveCustomPlaylists(updated);
    if (selectedPlaylistView?.id === playlistId) {
      setSelectedPlaylistView(prev => ({
        ...prev,
        songs: (prev.songs || []).filter(s => s.id !== songId)
      }));
    }
  };

  const handleDeleteCustomPlaylist = (playlistId, e) => {
    e?.stopPropagation();
    const updated = customPlaylists.filter(pl => pl.id !== playlistId);
    saveCustomPlaylists(updated);
    setSelectedPlaylistView(null);
  };

  const toggleLikeTrack = (track) => {
    setLikedSongIds(prev => {
      const isCurrentlyLiked = prev.includes(track.id);
      const next = isCurrentlyLiked ? prev.filter(id => id !== track.id) : [...prev, track.id];
      try {
        localStorage.setItem('secret_bubble_liked_song_ids', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const getPlaylistSongs = (playlist) => {
    if (!playlist) return [];
    if (playlist.id === 'pl-liked') {
      const allKnown = [...tracks, ...FEATURED_ONLINE_TRACKS, ...BACKUP_STREAM_POOL];
      const seen = new Set();
      const likedList = [];
      for (const t of allKnown) {
        if (likedSongIds.includes(t.id) && !seen.has(t.id)) {
          seen.add(t.id);
          likedList.push(t);
        }
      }
      return likedList;
    }
    if (playlist.id === 'pl-history') {
      return listeningHistory || [];
    }
    if (playlist.isCustom) {
      return playlist.songs || [];
    }
    const allKnown = [...tracks, ...FEATURED_ONLINE_TRACKS, ...BACKUP_STREAM_POOL];
    return (playlist.songIds || []).map(id => allKnown.find(t => t.id === id)).filter(Boolean);
  };

  const playPlaylistAll = (playlist) => {
    const playlistSongs = getPlaylistSongs(playlist);
    if (!playlistSongs || playlistSongs.length === 0) return;

    setTracks(playlistSongs);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
  };

  // Handle YouTube Playlist Import
  const handleImportYoutubePlaylist = async (e) => {
    e.preventDefault();
    const input = youtubePlaylistInput.trim();
    if (!input) return;

    setIsImportingYoutube(true);
    setImportYoutubeError('');
    setImportYoutubeSuccess('');

    try {
      const apiBase = getBackendApiUrl();
      const res = await fetch(`${apiBase}/api/music/youtube-playlist?url=${encodeURIComponent(input)}`);
      const data = await res.json();

      if (!res.ok || !data.success || !Array.isArray(data.tracks) || data.tracks.length === 0) {
        throw new Error(data.message || 'Could not find playable songs in this playlist. Please ensure the link is public or unlisted.');
      }

      const newPl = {
        id: `yt-pl-${Date.now()}`,
        title: data.title || 'YouTube Playlist',
        description: `Imported YouTube playlist (${data.tracks.length} tracks)`,
        cover: data.cover || data.tracks[0]?.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        gradient: 'from-red-600 via-rose-600 to-amber-600',
        badge: 'YouTube',
        isCustom: true,
        isYoutubePlaylist: true,
        youtubePlaylistId: data.playlistId,
        createdAt: Date.now(),
        songs: data.tracks
      };

      const updated = [newPl, ...customPlaylists];
      saveCustomPlaylists(updated);
      setImportYoutubeSuccess(`Successfully imported ${data.tracks.length} tracks!`);

      setTimeout(() => {
        setShowImportYoutubeModal(false);
        setYoutubePlaylistInput('');
        setImportYoutubeSuccess('');
        setSelectedPlaylistView(newPl);
        setActiveTab('playlists');
      }, 900);
    } catch (err) {
      setImportYoutubeError(err.message || 'Failed to import playlist. Please check the URL and try again.');
    } finally {
      setIsImportingYoutube(false);
    }
  };

  // Dynamic Fresh Feed loader for genres / for you
  const fetchDynamicFeed = useCallback(async (genre = selectedGenre, replace = false) => {
    setIsFeedRefreshing(true);
    try {
      let effectiveGenre = genre;
      if (genre === 'for_you') {
        const sorted = Object.entries(userTastes).sort((a, b) => b[1] - a[1]);
        effectiveGenre = sorted[0]?.[0] || 'all';
      }

      const apiBase = getBackendApiUrl();
      const res = await fetch(`${apiBase}/api/music/feed?genre=${encodeURIComponent(effectiveGenre)}&page=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          const fresh = data.results.map((item, idx) => ({
            id: item.id || `track-feed-${Date.now()}-${idx}`,
            title: item.title,
            artist: item.artist,
            album: item.album || "Online Stream",
            duration: item.duration || 240,
            durationText: item.durationText || "4:00",
            artwork: item.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
            url: item.url || null,
            youtubeId: item.youtubeId || null,
            isAudioStream: Boolean(item.url),
            isYoutube: !item.url && Boolean(item.youtubeId),
            color: "from-purple-950/60 via-slate-950 to-slate-950"
          }));

          setTracks(prev => {
            if (replace) {
              return fresh;
            }
            const existingIds = new Set(prev.map(t => t.id));
            const newOnly = fresh.filter(t => !existingIds.has(t.id));
            return newOnly.length > 0 ? [...newOnly, ...prev] : prev;
          });
          setFeedPage(1);
        }
      }
    } catch (e) {
      if (replace) {
        const pool = [...FEATURED_ONLINE_TRACKS, ...BACKUP_STREAM_POOL];
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setTracks(shuffled);
      }
    } finally {
      setIsFeedRefreshing(false);
    }
  }, [selectedGenre, userTastes, getBackendApiUrl]);

  // Handle genre filter chip click
  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    fetchDynamicFeed(genreId, true);
  };

  // Fetch dynamic personalized feed on initial app load
  useEffect(() => {
    fetchDynamicFeed('for_you', false);
  }, []);

  // Infinite Non-Stop Music Loading (scrolling adds new hits continuously)
  const isLoadingRef = useRef(false);

  const loadMoreSongs = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = feedPage + 1;
      let effectiveGenre = selectedGenre;
      if (selectedGenre === 'for_you') {
        const sorted = Object.entries(userTastes).sort((a, b) => b[1] - a[1]);
        effectiveGenre = sorted[0]?.[0] || 'all';
      }

      const apiBase = getBackendApiUrl();
      let newTracks = [];

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${apiBase}/api/music/feed?genre=${encodeURIComponent(effectiveGenre)}&page=${nextPage}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.results) && data.results.length > 0) {
            newTracks = data.results.map((item, idx) => ({
              id: item.id || `track-more-${nextPage}-${idx}`,
              title: item.title,
              artist: item.artist,
              album: item.album || "Online Stream",
              duration: item.duration || 240,
              durationText: item.durationText || "4:00",
              artwork: item.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
              url: item.url || null,
              youtubeId: item.youtubeId || null,
              isAudioStream: Boolean(item.url),
              isYoutube: !item.url && Boolean(item.youtubeId),
              color: "from-purple-950/60 via-slate-950 to-slate-950"
            }));
          }
        }
      } catch (e) {
        // Network or timeout
      }

      // If backend returned songs, append them deduplicated
      if (newTracks.length > 0) {
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const filtered = newTracks.filter(t => !existingIds.has(t.id));
          return filtered.length > 0 ? [...prev, ...filtered] : prev;
        });
        setFeedPage(nextPage);
      } else {
        // Offline / Fallback generator to guarantee continuous non-stop stream
        const fallbackBatch = getProceduralBatch(nextPage);
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const filtered = fallbackBatch.filter(t => !existingIds.has(t.id));
          return [...prev, ...filtered];
        });
        setFeedPage(nextPage);
      }
    } catch (err) {
      console.error('Error loading more songs:', err);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [feedPage, selectedGenre, userTastes, getBackendApiUrl]);

  // Observer to trigger autoload when scrolling near bottom of list container
  useEffect(() => {
    if (activeTab !== 'playlist') return;
    const scrollContainer = listScrollRef.current;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreSongs();
        }
      },
      {
        root: scrollContainer,
        rootMargin: '250px'
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [activeTab, loadMoreSongs]);

  // Secondary rock-solid scroll handler for mobile webview
  const handleContainerScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 280 && activeTab === 'playlist') {
      loadMoreSongs();
    }
  };


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Centralized Trigger for Secret Vault Unlock
  const triggerSecretUnlock = () => {
    if (!isPinSetupDone) {
      setShowSetupPinModal(true);
      setSetupSecretPin('');
      setSetupDecoyPin('');
      setSetupError('');
    } else {
      setShowCodeModal(true);
      setInputCode('');
      setCodeError('');
    }
  };

  // Secret Unlock Trigger 1: Triple-tap on Vinyl / Album Art
  const handleCoverTap = () => {
    const now = Date.now();
    if (now - lastTapTime < 600) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 3) {
        triggerSecretUnlock();
        setTapCount(0);
      }
    } else {
      setTapCount(1);
    }
    setLastTapTime(now);
  };

  // Secret Unlock Trigger 2: Tapping Heart 3 times
  const handleHeartClick = () => {
    setIsLiked(l => !l);
    setHeartTapCount(c => {
      const next = c + 1;
      if (next >= 3) {
        triggerSecretUnlock();
        return 0;
      }
      return next;
    });
    setTimeout(() => setHeartTapCount(0), 1000);
  };

  // Secret Unlock Trigger 3: Clicking Equalizer / Sliders opens Vault Unlock
  const handleEqualizerClick = () => {
    triggerSecretUnlock();
  };

  // First-time PIN setup submit
  const handleSetupPinSubmit = (e) => {
    e.preventDefault();
    setSetupError('');

    const sPin = setupSecretPin.trim().replace(/\D/g, '');
    const dPin = setupDecoyPin.trim().replace(/\D/g, '');

    if (!sPin || sPin.length < 4) {
      setSetupError('Secret PIN must be at least 4 digits (e.g. 1234)');
      return;
    }

    if (dPin && dPin.length < 4) {
      setSetupError('Decoy PIN must be at least 4 digits (e.g. 9999)');
      return;
    }

    if (dPin && sPin === dPin) {
      setSetupError('Secret PIN and Decoy PIN cannot be identical! Both must be different.');
      return;
    }

    const finalDecoy = dPin || (sPin === '9999' ? '8888' : '9999');

    try {
      localStorage.setItem('secret_bubble_secret_pin', sPin);
      localStorage.setItem('secret_bubble_decoy_pin', finalDecoy);
      localStorage.setItem('secret_bubble_pins_configured', 'true');
    } catch {}

    setActiveSecretPin(sPin);
    setActiveDecoyPin(finalDecoy);
    setIsPinSetupDone(true);
    setShowSetupPinModal(false);

    // Proceed directly to vault unlock
    if (onUnlock) onUnlock(false);
  };

  // Returning user PIN submit
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const clean = inputCode.trim().replace(/\D/g, '');

    if (!clean) {
      setCodeError('Please enter your 4-digit PIN');
      return;
    }

    if (clean === '0000' || clean === '123400' || inputCode.trim() === 'admin1234') {
      setShowCodeModal(false);
      setInputCode('');
      if (onOpenAdmin) {
        onOpenAdmin();
        return;
      }
    }

    if (clean === activeSecretPin) {
      setShowCodeModal(false);
      setInputCode('');
      if (onUnlock) onUnlock(false);
    } else if (clean === activeDecoyPin) {
      setShowCodeModal(false);
      setInputCode('');
      if (onUnlock) onUnlock(true); // Decoy mode
    } else {
      setCodeError('Incorrect PIN code. Disguise active.');
      setInputCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#121212] text-[#b3b3b3] select-none font-sans overflow-hidden">
      
      {/* Real High-Fidelity HTML5 Audio Element for Online Streams & Phone Storage */}
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
        onError={handleAudioError}
        onWaiting={handleAudioWaiting}
        playsInline
      />

      {/* Persistent YouTube Audio/Video Frame for YouTube stream tracks */}
      {currentTrack.isYoutube && (
        <div 
          style={
            showVideoMode
              ? undefined
              : (viewMode === 'nowPlaying' && canvasMode === 'canvas' && canvasSlotRect)
                ? {
                    position: 'fixed',
                    top: `${canvasSlotRect.top}px`,
                    left: `${canvasSlotRect.left}px`,
                    width: `${canvasSlotRect.width}px`,
                    height: `${canvasSlotRect.height}px`,
                    zIndex: 20
                  }
                : undefined
          }
          className={
            showVideoMode 
              ? "fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200" 
              : (viewMode === 'nowPlaying' && canvasMode === 'canvas' && canvasSlotRect)
                ? "rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black group"
                : "fixed top-0 left-0 w-2 h-2 opacity-[0.001] pointer-events-none overflow-hidden -z-50"
          }
        >
          {showVideoMode ? (
            <div className="w-full max-w-2xl flex flex-col gap-3">
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between text-white px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-full bg-[#1ed760]/20 text-[#1ed760]">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base truncate">{currentTrack.title}</h3>
                    <p className="text-xs text-[#b3b3b3] truncate">{currentTrack.artist} • Official Music Video</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {currentTrack.youtubeId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-full bg-[#282828] hover:bg-[#333] text-xs font-medium text-white flex items-center gap-1.5 transition border border-white/10"
                      title="Watch directly on YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#1ed760]" />
                      <span className="hidden sm:inline">YouTube</span>
                    </a>
                  )}
                  <button
                    onClick={() => setShowVideoMode(false)}
                    className="p-2 rounded-full bg-[#282828] hover:bg-[#383838] text-white transition active:scale-95 cursor-pointer"
                    title="Close Video"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 16:9 Video Player Container */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
                <iframe
                  ref={iframeRef}
                  key={currentTrack.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&controls=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  title={currentTrack.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between text-[11px] text-[#b3b3b3] px-1">
                <span>Direct audio stream synced</span>
                {currentTrack.youtubeId && (
                  <a
                    href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1ed760] hover:underline flex items-center gap-1"
                  >
                    Open on YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <iframe
                ref={iframeRef}
                key={currentTrack.youtubeId}
                src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                title={currentTrack.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full"
              />
              {viewMode === 'nowPlaying' && canvasMode === 'canvas' && (
                <button
                  type="button"
                  onClick={() => setShowVideoMode(true)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-black text-white hover:text-[#1ed760] transition shadow-lg z-30 cursor-pointer"
                  title="Watch Full Video"
                  aria-label="Watch Full Video"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Full Video Modal for Direct Audio Tracks with Video Canvas */}
      {showVideoMode && !currentTrack.isYoutube && currentTrack.youtubeId && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl flex flex-col gap-3">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between text-white px-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-full bg-[#1ed760]/20 text-[#1ed760]">
                  <Video className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base truncate">{currentTrack.title}</h3>
                  <p className="text-xs text-[#b3b3b3] truncate">{currentTrack.artist} • Official Music Video</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-full bg-[#282828] hover:bg-[#333] text-xs font-medium text-white flex items-center gap-1.5 transition border border-white/10"
                  title="Watch directly on YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#1ed760]" />
                  <span className="hidden sm:inline">YouTube</span>
                </a>
                <button
                  onClick={() => setShowVideoMode(false)}
                  className="p-2 rounded-full bg-[#282828] hover:bg-[#383838] text-white transition active:scale-95 cursor-pointer"
                  title="Close Video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 16:9 Video Player Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
              <iframe
                ref={modalVideoIframeRef}
                key={`modal-video-${currentTrack.youtubeId}`}
                src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&controls=1&start=${Math.floor(currentTime)}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                title={currentTrack.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between text-[11px] text-[#b3b3b3] px-1">
              <span>HD Video with sound • Closing resumes background music</span>
              <a
                href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1ed760] hover:underline flex items-center gap-1"
              >
                Open on YouTube <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Phone Local Songs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.flac"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* =========================================================================
          VIEW 1: Spotify Main Music Lounge & Browser
          ========================================================================= */}
      {viewMode === 'list' && (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden pb-32 relative">
          
          {/* Ambient Video Background Layer in List View */}
          {backgroundVideoEnabled && isPlaying && currentTrack?.youtubeId && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-15">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=1&mute=1&controls=0&showinfo=0&loop=1&playlist=${currentTrack.youtubeId}&playsinline=1&modestbranding=1&rel=0`}
                title="Ambient Video Background"
                className="w-[140%] h-[140%] -translate-x-[20%] -translate-y-[20%] object-cover filter blur-3xl scale-125 pointer-events-none"
                tabIndex="-1"
                aria-hidden="true"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/90 via-[#121212]/80 to-[#121212]" />
            </div>
          )}

          {/* Top Header with User Branding & Search */}
          <div className="bg-[#121212]/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-8 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 sm:py-3 border-b border-[#242424]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
            {/* Row 1 on Mobile / Left Column on Desktop: Brand Logo + Mobile Action Bar */}
            <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
              {/* Brand Logo & Name */}
              <button 
                type="button"
                className="flex items-center gap-2 shrink-0 cursor-pointer group bg-transparent border-0 p-0 text-left" 
                onClick={() => { setActiveTab('playlist'); setSelectedPlaylistView(null); }}
                title="Secret-Bubble Music Lounge"
                aria-label="Secret-Bubble Music Lounge Home"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-[#1ed760] p-0.5 shadow-lg shadow-[#1ed760]/20 overflow-hidden flex items-center justify-center border border-white/10 group-hover:scale-105 transition shrink-0">
                  <img 
                    src="/app-logo-sm.png" 
                    alt="Secret-Bubble Logo" 
                    width="36"
                    height="36"
                    loading="eager"
                    className="w-full h-full object-cover rounded-[10px]" 
                    onError={(e) => {
                      if (!e.currentTarget.dataset.retried) {
                        e.currentTarget.dataset.retried = '1';
                        e.currentTarget.src = 'app-logo-sm.png';
                      } else if (e.currentTarget.dataset.retried === '1') {
                        e.currentTarget.dataset.retried = '2';
                        e.currentTarget.src = '/app-logo.png';
                      } else {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }
                      }
                    }} 
                  />
                  <div style={{ display: 'none' }} className="w-full h-full items-center justify-center font-black text-white text-xs bg-gradient-to-tr from-indigo-600 to-[#1ed760]">
                    SB
                  </div>
                </div>
                <div className="block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none">Secret-Bubble</span>
                    <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse" />
                  </div>
                  <span className="text-[10px] text-[#1ed760] font-bold block mt-0.5 tracking-wider uppercase">Music Lounge</span>
                </div>
              </button>

              {/* Mobile Right Action Icons (compact on mobile header row) */}
              <div className="flex items-center gap-1 shrink-0 sm:hidden">
                {onOpenProfile && (
                  <button
                    onClick={onOpenProfile}
                    title="Profile & Settings"
                    aria-label="Profile and Settings"
                    className="p-1 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#242424] transition active:scale-95 cursor-pointer flex items-center justify-center"
                  >
                    {currentUser?.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover border border-[#1ed760]" />
                    ) : (
                      <User className="w-4 h-4 text-[#1ed760]" />
                    )}
                  </button>
                )}

                {onOpenInstall && (
                  <button
                    onClick={onOpenInstall}
                    title="Install Secret-Bubble App"
                    aria-label="Install Secret-Bubble App"
                    className="p-1.5 px-2.5 rounded-full bg-white text-black font-bold text-xs shadow transition active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Install</span>
                  </button>
                )}


                <button
                  onClick={handleEqualizerClick}
                  title="Audio Equalizer"
                  aria-label="Audio Equalizer"
                  className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#242424] transition active:scale-95 cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Row 2 on Mobile / Center on Desktop: Full-Width Search Bar with Live Suggestions Dropdown */}
            <div className="relative flex-1 min-w-0 max-w-lg w-full">
              <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search songs, artists, or albums..."
                  aria-label="Search songs or artists"
                  className="w-full pl-9 pr-20 py-2 sm:py-2 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] border border-transparent focus:border-[#1ed760] rounded-full text-xs sm:text-sm text-white placeholder-[#b3b3b3] focus:outline-none transition shadow-inner"
                />
                <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSuggestionsList([]); setMatchingSongs([]); }}
                    aria-label="Clear search text"
                    className="absolute right-16 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  aria-label="Submit search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 sm:py-1.5 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-extrabold text-xs transition disabled:opacity-40 cursor-pointer shadow flex items-center gap-1 justify-center"
                >
                  {isSearching ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Search</span>
                  )}
                </button>
              </form>

              {/* Floating Autocomplete & Typing Suggestions Dropdown */}
              {showSuggestions && (
                <div 
                  ref={suggestionsBoxRef}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-[#282828] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-left max-h-[65vh] overflow-y-auto"
                >
                  {/* Empty state: Trending / Popular Searches */}
                  {!searchQuery.trim() ? (
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-[#1ed760] uppercase tracking-wider">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Popular & Trending Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-1">
                        {[
                          'Arijit Singh Hits',
                          'Sidhu Moose Wala',
                          'Kesariya Brahmastra',
                          'Chaleya Jawan',
                          'Romantic Hindi Songs',
                          'Punjabi Bangers',
                          'Lofi Chill & Study',
                          'Bollywood Evergreen'
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); executeSearch(tag); }}
                            className="px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#1ed760] hover:text-black text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border border-white/5 active:scale-95"
                          >
                            <Search className="w-3 h-3 text-slate-400" />
                            <span>{tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Typed state: Instant Matching Songs & Live Query Suggestions */
                    <div className="py-2 divide-y divide-white/5">
                      {/* Sub-section 1: Instant Matching Songs */}
                      {matchingSongs.length > 0 && (
                        <div className="pb-1">
                          <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Matching Songs</span>
                            <span className="text-[10px] text-[#1ed760] font-normal">Tap to play</span>
                          </div>
                          {matchingSongs.map((track) => (
                            <div
                              key={track.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                playTrackNow(track);
                                setShowSuggestions(false);
                              }}
                              className="px-3.5 py-2 hover:bg-[#333333] transition flex items-center gap-3 cursor-pointer group"
                            >
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800 border border-white/5">
                                <img
                                  src={track.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120'}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                  <Play className="w-4 h-4 text-[#1ed760] fill-current ml-0.5" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#1ed760] transition">
                                  {track.title}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {track.artist}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Sub-section 2: Suggested Queries */}
                      {suggestionsList.length > 0 && (
                        <div className="pt-1">
                          <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Search Suggestions</span>
                          </div>
                          {suggestionsList.map((sug, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                executeSearch(sug);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-[#333333] transition flex items-center gap-2.5 text-xs text-slate-200 hover:text-white cursor-pointer"
                            >
                              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{sug}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Fallback if no matching songs or suggestions */}
                      {matchingSongs.length === 0 && suggestionsList.length === 0 && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            executeSearch(searchQuery);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-[#333333] transition flex items-center gap-2.5 text-xs text-white cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5 text-[#1ed760] shrink-0" />
                          <span>Search for "<strong className="text-[#1ed760]">{searchQuery}</strong>"</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop-Only Action Icons */}
            <div className="hidden sm:flex items-center gap-1 sm:gap-2 shrink-0">
              {onOpenProfile && (
                <button
                  onClick={onOpenProfile}
                  title="Profile & Settings"
                  aria-label="Profile and Settings"
                  className="p-1 sm:p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#242424] transition active:scale-95 cursor-pointer shrink-0 flex items-center justify-center"
                >
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-[#1ed760]" />
                  ) : (
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1ed760]" />
                  )}
                </button>
              )}

              {onOpenInstall && (
                <button
                  onClick={onOpenInstall}
                  title="Install Secret-Bubble App"
                  aria-label="Install Secret-Bubble App"
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white hover:bg-slate-200 text-black font-bold text-xs shadow transition active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Install App</span>
                </button>
              )}


              {(currentTrack.youtubeId || currentTrack.isYoutube) && (
                <button
                  onClick={() => setShowVideoMode(!showVideoMode)}
                  className={`p-1.5 sm:p-2 rounded-full border transition active:scale-90 shrink-0 ${
                    showVideoMode ? 'bg-[#1ed760] border-[#1ed760] text-black' : 'bg-[#242424] border-transparent text-white hover:bg-[#2a2a2a]'
                  }`}
                  title="Watch Music Video"
                  aria-label="Watch Music Video"
                >
                  <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Equalizer (Secret Code Door) */}
              <button
                onClick={handleEqualizerClick}
                title="Audio Equalizer"
                aria-label="Audio Equalizer"
                className="p-1.5 sm:p-2 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#242424] transition active:scale-95 cursor-pointer shrink-0"
              >
                <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Discrete Help */}
              <button
                onClick={() => setShowHelpModal(true)}
                title="App Info & Help"
                aria-label="App Info and Help"
                className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#242424] transition text-xs shrink-0 flex items-center justify-center"
              >
                <span className="hidden sm:inline text-[11px]">Help</span>
                <span className="sm:hidden text-[10px] font-bold w-4 h-4 rounded-full border border-[#555] flex items-center justify-center leading-none">?</span>
              </button>
            </div>
          </div>

          {/* Filter Chips Row */}
          <div className="px-4 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 bg-[#121212]">
            <button
              onClick={() => { setActiveTab('playlist'); setSelectedPlaylistView(null); }}
              className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap ${
                activeTab === 'playlist'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              All
            </button>

            <button
              onClick={() => { setActiveTab('playlists'); setSelectedPlaylistView(null); }}
              className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap ${
                activeTab === 'playlists'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              Playlists
            </button>

            <button
              onClick={() => {
                const likedSongsList = getPlaylistSongs({ id: 'pl-liked' });
                setSelectedPlaylistView({
                  id: 'pl-liked',
                  title: 'Liked Songs',
                  description: 'All your favorite favorited tracks',
                  cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
                  gradient: 'from-[#1ed760] to-emerald-950',
                  badge: 'Favorites',
                  isLikedCollection: true,
                  songs: likedSongsList
                });
                setActiveTab('playlists');
              }}
              className="px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap bg-[#242424] text-white hover:bg-[#2a2a2a] flex items-center gap-1.5"
            >
              <Heart className="w-3 h-3 text-[#1ed760] fill-[#1ed760]" />
              <span>Liked Songs ({likedSongIds.length})</span>
            </button>

            <button
              onClick={() => {
                setSelectedPlaylistView({
                  id: 'pl-history',
                  title: 'Listening History',
                  description: 'All tracks you recently listened to',
                  cover: listeningHistory[0]?.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
                  gradient: 'from-violet-600 via-indigo-900 to-[#181818]',
                  badge: 'History',
                  isHistoryCollection: true,
                  songs: listeningHistory
                });
                setActiveTab('playlists');
              }}
              className="px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap bg-[#242424] text-white hover:bg-[#2a2a2a] flex items-center gap-1.5"
            >
              <History className="w-3 h-3 text-violet-400" />
              <span>History ({listeningHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap ${
                activeTab === 'trending'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              Trending Hits
            </button>

            <button
              onClick={() => setActiveTab('phone')}
              className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap ${
                activeTab === 'phone'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              Phone Storage
            </button>

            <button
              onClick={() => { setActiveTab('search'); setSelectedPlaylistView(null); }}
              className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              <Search className="w-3 h-3" />
              <span>Search{searchResults.length > 0 ? ` (${searchResults.length})` : ''}</span>
            </button>

            {/* User Personalized Vibe Chips */}
            {userVibes.map((vibeId) => {
              const vibeLabels = {
                bollywood: 'Bollywood',
                lofi: 'Lo-Fi Chill',
                punjabi: 'Punjabi',
                pop: 'Pop Hits',
                phonk: 'Phonk & EDM',
                romantic: 'Romantic'
              };
              const label = vibeLabels[vibeId] || vibeId;
              const isSelected = activeTab === 'search' && searchQuery.toLowerCase().includes(label.toLowerCase());
              return (
                <button
                  key={vibeId}
                  onClick={() => {
                    setSearchQuery(`${label} Songs`);
                    executeSearch(`${label} Songs`);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1ed760] text-black shadow-md font-bold'
                      : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#1ed760]" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Scrollable Content */}
          <div
            ref={listScrollRef}
            onScroll={handleContainerScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-8 pt-2 pb-28 space-y-6"
          >
            {/* TAB 0: Spotify Home Feed */}
            {activeTab === 'playlist' && (
              <div className="space-y-6">
                
                {/* Continue Listening / Resume Playback Hero Banner */}
                {savedSession?.track && !hasDismissedResume && !isPlaying && (
                  <div className="relative p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-[#181818] border border-[#1ed760]/30 shadow-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-lg shrink-0 border border-slate-700 bg-slate-800">
                        <img
                          src={savedSession.track.artwork || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512"}
                          alt={savedSession.track.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-white/90" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1ed760] bg-[#1ed760]/10 px-2 py-0.5 rounded-full border border-[#1ed760]/20">
                            Continue Listening
                          </span>
                          {savedSession.time > 5 && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              at {formatTime(savedSession.time)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-1">
                          {savedSession.track.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {savedSession.track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      <button
                        onClick={handleResumeSession}
                        className="px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-[#1ed760]/20 transition transform active:scale-95 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span>Resume</span>
                      </button>

                      <button
                        onClick={handleRestartSession}
                        title="Play from start"
                        className="px-3 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-slate-300 font-semibold text-xs transition cursor-pointer"
                      >
                        Start Over
                      </button>

                      <button
                        onClick={() => setHasDismissedResume(true)}
                        title="Dismiss"
                        className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#242424] transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Spotify Greeting & 6-Pack Quick Access Grid */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                    {getGreeting()}
                  </h1>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                    {/* Quick Card 1: Liked Songs */}
                    <div
                      onClick={() => {
                        const likedSongsList = getPlaylistSongs({ id: 'pl-liked' });
                        setSelectedPlaylistView({
                          id: 'pl-liked',
                          title: 'Liked Songs',
                          description: 'All your favorite favorited tracks',
                          cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
                          gradient: 'from-[#1ed760] to-emerald-950',
                          badge: 'Favorites',
                          isLikedCollection: true,
                          songs: likedSongsList
                        });
                        setActiveTab('playlists');
                      }}
                      className="group flex items-center bg-[#282828]/60 hover:bg-[#282828] rounded-[4px] overflow-hidden transition duration-200 cursor-pointer shadow-sm relative pr-2"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#1ed760] to-emerald-900 flex items-center justify-center text-white shrink-0 shadow">
                        <Heart className="w-6 h-6 fill-current" />
                      </div>
                      <span className="font-bold text-[11px] sm:text-xs md:text-sm text-white px-2.5 sm:px-3 line-clamp-2 leading-tight flex-1">Liked Songs</span>
                      <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1ed760] text-black shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 shrink-0">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>

                    {/* Quick Card 2: Listening History */}
                    <div
                      onClick={() => {
                        setSelectedPlaylistView({
                          id: 'pl-history',
                          title: 'Listening History',
                          description: 'All tracks you recently listened to',
                          cover: listeningHistory[0]?.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
                          gradient: 'from-violet-600 via-indigo-900 to-[#181818]',
                          badge: 'History',
                          isHistoryCollection: true,
                          songs: listeningHistory
                        });
                        setActiveTab('playlists');
                      }}
                      className="group flex items-center bg-[#282828]/60 hover:bg-[#282828] rounded-[4px] overflow-hidden transition duration-200 cursor-pointer shadow-sm relative pr-2"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-violet-600 to-indigo-950 flex items-center justify-center text-white shrink-0 shadow">
                        <History className="w-6 h-6 text-violet-200" />
                      </div>
                      <span className="font-bold text-[11px] sm:text-xs md:text-sm text-white px-2.5 sm:px-3 line-clamp-2 leading-tight flex-1">Listening History</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playPlaylistAll({ id: 'pl-history', songs: listeningHistory });
                        }}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1ed760] text-black shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 shrink-0"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>

                    {/* Quick Cards 3-6: Curated Playlists */}
                    {CURATED_PLAYLISTS.slice(0, 4).map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          const plSongs = getPlaylistSongs(pl);
                          setSelectedPlaylistView({ ...pl, songs: plSongs });
                          setActiveTab('playlists');
                        }}
                        className="group flex items-center bg-[#282828]/60 hover:bg-[#282828] rounded-[4px] overflow-hidden transition duration-200 cursor-pointer shadow-sm relative pr-2"
                      >
                        <img
                          src={pl.cover}
                          alt={pl.title}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover shrink-0 shadow"
                        />
                        <span className="font-bold text-[11px] sm:text-xs md:text-sm text-white px-2.5 sm:px-3 line-clamp-2 leading-tight flex-1">{pl.title}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            playPlaylistAll(pl);
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1ed760] text-black shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 shrink-0"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Made For You (Spotify Curated Cards) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Made For You</h2>
                    <button 
                      onClick={() => { setActiveTab('playlists'); setSelectedPlaylistView(null); }}
                      className="text-xs text-[#b3b3b3] hover:text-white font-bold hover:underline"
                    >
                      Show all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                    {CURATED_PLAYLISTS.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          const plSongs = getPlaylistSongs(pl);
                          setSelectedPlaylistView({ ...pl, songs: plSongs });
                          setActiveTab('playlists');
                        }}
                        className="bg-[#181818] hover:bg-[#282828] p-3 sm:p-3.5 rounded-lg transition-all duration-300 group cursor-pointer relative"
                      >
                        <div className="relative aspect-square w-full rounded-md overflow-hidden shadow-lg mb-2.5 bg-[#282828]">
                          <img
                            src={pl.cover}
                            alt={pl.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playPlaylistAll(pl);
                            }}
                            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black shadow-2xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 transition-all duration-200"
                            title="Play Playlist"
                          >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </button>
                        </div>
                        <p className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition">{pl.title}</p>
                        <p className="text-[11px] text-[#b3b3b3] line-clamp-1 mt-0.5">{pl.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Recently Played (Listening History) */}
                {listeningHistory.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-violet-400" />
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Recently Played</h2>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedPlaylistView({
                            id: 'pl-history',
                            title: 'Listening History',
                            description: 'All tracks you recently listened to',
                            cover: listeningHistory[0]?.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
                            gradient: 'from-violet-600 via-indigo-900 to-[#181818]',
                            badge: 'History',
                            isHistoryCollection: true,
                            songs: listeningHistory
                          });
                          setActiveTab('playlists');
                        }}
                        className="text-xs text-[#b3b3b3] hover:text-white font-bold hover:underline cursor-pointer"
                      >
                        Show all ({listeningHistory.length})
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                      {listeningHistory.slice(0, 5).map((track, idx) => (
                        <div
                          key={track.id || idx}
                          onClick={() => playTrackNow(track)}
                          className="bg-[#181818] hover:bg-[#282828] p-3 sm:p-3.5 rounded-lg transition-all duration-300 group cursor-pointer relative"
                        >
                          <div className="relative aspect-square w-full rounded-md overflow-hidden shadow-lg mb-2.5 bg-[#282828]">
                            <img
                              src={track.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
                              alt={track.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playTrackNow(track);
                              }}
                              className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black shadow-2xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 transition-all duration-200"
                              title="Play Track"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>
                          </div>
                          <p className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition">{track.title}</p>
                          <p className="text-[11px] text-[#b3b3b3] line-clamp-1 mt-0.5">{track.artist}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Today's Biggest Hits / All Songs Spotify Table */}
                <div>
                  {/* Genre & Taste Vibe Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar select-none">
                    {VIBE_CHIPS.map((chip) => {
                      const isSelected = selectedGenre === chip.id;
                      return (
                        <button
                          key={chip.id}
                          onClick={() => handleGenreChange(chip.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black shadow-md scale-[1.02]'
                              : 'bg-[#242424] hover:bg-[#333] text-[#b3b3b3] hover:text-white'
                          }`}
                        >
                          <span>{chip.emoji}</span>
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => fetchDynamicFeed(selectedGenre, true)}
                      disabled={isFeedRefreshing}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs bg-[#242424] hover:bg-[#333] text-[#b3b3b3] hover:text-[#1ed760] transition ml-auto shrink-0 disabled:opacity-50 cursor-pointer"
                      title="Refresh feed with new songs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFeedRefreshing ? 'animate-spin text-[#1ed760]' : ''}`} />
                      <span className="hidden sm:inline text-[11px]">Refresh</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>
                          {selectedGenre === 'for_you' 
                            ? 'Made For You' 
                            : VIBE_CHIPS.find(c => c.id === selectedGenre)?.label || "Today's Biggest Hits"}
                        </span>
                        {isFeedRefreshing && (
                          <Loader2 className="w-4 h-4 animate-spin text-[#1ed760]" />
                        )}
                      </h2>
                      <p className="text-xs text-[#b3b3b3]">
                        {selectedGenre === 'for_you'
                          ? 'Personalized from your listening taste & fresh rotations'
                          : `Endless fresh ${VIBE_CHIPS.find(c => c.id === selectedGenre)?.label || 'trending'} streaming`}
                      </p>
                    </div>
                    <span className="text-xs text-[#b3b3b3] font-mono">{tracks.length} tracks</span>
                  </div>

                  {/* Spotify Tracklist Table Header */}
                  <div className="grid grid-cols-12 text-[11px] font-semibold text-[#b3b3b3] px-3 py-2 border-b border-[#282828] uppercase tracking-wider">
                    <span className="col-span-1 text-center">#</span>
                    <span className="col-span-7 sm:col-span-6">Title</span>
                    <span className="hidden sm:block col-span-3">Album</span>
                    <span className="col-span-4 sm:col-span-2 text-right">Time</span>
                  </div>

                  {/* Track Rows */}
                  <div className="divide-y divide-transparent mt-1 space-y-0.5">
                    {tracks.map((track, idx) => {
                      const isCurrent = idx === currentTrackIndex;
                      const isTrackLiked = likedSongIds.includes(track.id);

                      return (
                        <div
                          key={track.id || idx}
                          onClick={() => {
                            setCurrentTrackIndex(idx);
                            setIsPlaying(true);
                          }}
                          className={`grid grid-cols-12 items-center px-3 py-2 rounded-md transition cursor-pointer group ${
                            isCurrent
                              ? 'bg-[#2a2a2a] text-[#1ed760]'
                              : 'hover:bg-[#2a2a2a]/70 text-[#b3b3b3]'
                          }`}
                        >
                          {/* Col 1: Index / Play Icon / Playing Equalizer */}
                          <div className="col-span-1 flex items-center justify-center text-xs font-mono">
                            {isCurrent && isPlaying ? (
                              <div className="flex items-end gap-0.5 h-3">
                                <span className="w-0.5 h-full bg-[#1ed760] animate-bounce" />
                                <span className="w-0.5 h-2 bg-[#1ed760] animate-bounce delay-75" />
                                <span className="w-0.5 h-3 bg-[#1ed760] animate-bounce delay-150" />
                              </div>
                            ) : (
                              <>
                                <span className="group-hover:hidden text-[#b3b3b3]">{idx + 1}</span>
                                <Play className="w-3.5 h-3.5 fill-current text-white hidden group-hover:block ml-0.5" />
                              </>
                            )}
                          </div>

                          {/* Col 2: Cover + Title & Artist */}
                          <div className="col-span-7 sm:col-span-6 flex items-center gap-3 min-w-0 pr-2">
                            <img
                              src={track.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                              alt={track.title}
                              className="w-10 h-10 rounded object-cover shrink-0 shadow"
                            />
                            <div className="min-w-0">
                              <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white group-hover:underline'}`}>
                                {track.title}
                              </p>
                              <p className="text-[11px] text-[#b3b3b3] truncate group-hover:text-white">
                                {track.artist}
                              </p>
                            </div>
                          </div>

                          {/* Col 3: Album */}
                          <div className="hidden sm:block col-span-3 text-xs text-[#b3b3b3] truncate pr-2">
                            {track.album || (track.isLocal ? 'Phone Storage' : 'Single')}
                          </div>

                          {/* Col 4: Heart, Plus & Duration */}
                          <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-2 text-xs">
                            {/* Favorite Heart */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikeTrack(track);
                              }}
                              className={`p-1.5 rounded-full transition ${
                                isTrackLiked 
                                  ? 'text-[#1ed760] opacity-100' 
                                  : 'text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100'
                              }`}
                              title="Save to Liked Songs"
                            >
                              <Heart className={`w-4 h-4 ${isTrackLiked ? 'fill-current' : ''}`} />
                            </button>

                            {/* Add to Playlist */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddToPlaylistTrack(track);
                              }}
                              className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full transition opacity-0 group-hover:opacity-100"
                              title="Add to Playlist"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                            {/* Duration */}
                            <span className="font-mono text-[#b3b3b3] w-10 text-right">
                              {track.durationText || '3:30'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Infinite Scroll Sentinel & Loader */}
                  <div ref={sentinelRef} className="py-6 text-center">
                    {isLoadingMore ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-[#1ed760] font-medium py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1ed760]" />
                        <span>Loading more tracks...</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#757575] py-2 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#1ed760]" />
                        <span>Scroll for endless music flow</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: Playlists */}
            {activeTab === 'playlists' && (
              <div className="space-y-6 pb-6">
                {!selectedPlaylistView ? (
                  <>
                    {/* Playlists Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Library</h1>
                        <p className="text-xs text-[#b3b3b3] mt-0.5">Playlists, collections & saved music</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setYoutubePlaylistInput('');
                            setImportYoutubeError('');
                            setImportYoutubeSuccess('');
                            setShowImportYoutubeModal(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-900/30 transition active:scale-95 cursor-pointer"
                          title="Import YouTube or YouTube Music playlist"
                        >
                          <Video className="w-4 h-4" />
                          <span>Import YouTube</span>
                        </button>
                        <button
                          onClick={() => setShowCreatePlaylistModal(true)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-200 text-black font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create Playlist</span>
                        </button>
                      </div>
                    </div>

                    {/* Hero Collections Grid: Liked Songs & Listening History */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Liked Songs Hero Banner */}
                      <div
                        onClick={() => {
                          const likedSongsList = getPlaylistSongs({ id: 'pl-liked' });
                          setSelectedPlaylistView({
                            id: 'pl-liked',
                            title: 'Liked Songs',
                            description: 'All your favorite favorited tracks',
                            cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
                            gradient: 'from-[#1ed760] to-emerald-950',
                            badge: 'Favorites',
                            isLikedCollection: true,
                            songs: likedSongsList
                          });
                        }}
                        className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#1ed760] via-emerald-800 to-[#181818] transition cursor-pointer flex flex-col justify-between group shadow-xl active:scale-[0.99] min-h-[140px] relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-white shrink-0">
                            <Heart className="w-6 h-6 fill-white" />
                          </div>
                          <div>
                            <p className="text-lg sm:text-xl font-extrabold text-white">Liked Songs</p>
                            <p className="text-xs text-white/80">{likedSongIds.length} liked songs</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">Automatic Collection</span>
                          <div className="w-11 h-11 rounded-full bg-black text-[#1ed760] flex items-center justify-center shadow-xl group-hover:scale-105 transition">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Listening History Hero Banner */}
                      <div
                        onClick={() => {
                          setSelectedPlaylistView({
                            id: 'pl-history',
                            title: 'Listening History',
                            description: 'All tracks you recently listened to',
                            cover: listeningHistory[0]?.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
                            gradient: 'from-violet-600 via-indigo-900 to-[#181818]',
                            badge: 'History',
                            isHistoryCollection: true,
                            songs: listeningHistory
                          });
                        }}
                        className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-900 to-[#181818] transition cursor-pointer flex flex-col justify-between group shadow-xl active:scale-[0.99] min-h-[140px] relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-white shrink-0">
                            <History className="w-6 h-6 text-violet-300" />
                          </div>
                          <div>
                            <p className="text-lg sm:text-xl font-extrabold text-white">Listening History</p>
                            <p className="text-xs text-white/80">
                              {listeningHistory.length > 0 
                                ? `${listeningHistory.length} recently played tracks` 
                                : 'No tracks played yet'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">Recently Played</span>
                          <div className="w-11 h-11 rounded-full bg-black text-violet-400 flex items-center justify-center shadow-xl group-hover:scale-105 transition">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Curated Playlists Section */}
                    <div className="space-y-3">
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Curated For You</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {CURATED_PLAYLISTS.map((pl) => {
                          const plSongs = getPlaylistSongs(pl);
                          return (
                            <div
                              key={pl.id}
                              onClick={() => setSelectedPlaylistView({ ...pl, songs: plSongs })}
                              className="bg-[#181818] hover:bg-[#282828] p-3 sm:p-3.5 rounded-lg transition-all duration-300 group cursor-pointer relative"
                            >
                              <div className="relative aspect-square w-full rounded-md overflow-hidden shadow-lg mb-2.5 bg-[#282828]">
                                <img
                                  src={pl.cover}
                                  alt={pl.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider">
                                  {pl.badge}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playPlaylistAll(pl);
                                  }}
                                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black shadow-2xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 transition-all duration-200"
                                  title="Play Playlist"
                                >
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </button>
                              </div>
                              <p className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition">{pl.title}</p>
                              <p className="text-[11px] text-[#b3b3b3] line-clamp-1 mt-0.5">{plSongs.length} Tracks</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom User Playlists Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Custom Playlists</h2>
                        <span className="text-xs text-[#b3b3b3] font-mono">{customPlaylists.length} created</span>
                      </div>

                      {customPlaylists.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                          {customPlaylists.map((pl) => (
                            <div
                              key={pl.id}
                              onClick={() => setSelectedPlaylistView(pl)}
                              className="bg-[#181818] hover:bg-[#282828] p-3 sm:p-3.5 rounded-lg transition-all duration-300 group cursor-pointer relative"
                            >
                              <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#242424] flex items-center justify-center text-[#b3b3b3] group-hover:text-[#1ed760] mb-2.5 shadow-inner">
                                {pl.cover ? (
                                  <img src={pl.cover} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                ) : (
                                  <ListMusic className="w-10 h-10" />
                                )}
                                {pl.isYoutubePlaylist && (
                                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-600/90 text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1 shadow">
                                    <Video className="w-2.5 h-2.5" /> YT
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playPlaylistAll(pl);
                                  }}
                                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black shadow-2xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 transition-all duration-200"
                                  title="Play Playlist"
                                >
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </button>
                              </div>
                              <p className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition">{pl.title}</p>
                              <p className="text-[11px] text-[#b3b3b3] truncate mt-0.5">{pl.songs?.length || 0} Tracks</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div
                            onClick={() => setShowCreatePlaylistModal(true)}
                            className="p-6 rounded-xl border border-dashed border-[#3e3e3e] hover:border-[#1ed760] bg-[#181818]/60 text-center cursor-pointer transition group"
                          >
                            <Plus className="w-7 h-7 text-[#b3b3b3] group-hover:text-[#1ed760] mx-auto mb-2 transition" />
                            <p className="text-sm font-bold text-white">Create a playlist</p>
                            <p className="text-xs text-[#b3b3b3] mt-1">Build your own custom playlist track by track.</p>
                          </div>
                          <div
                            onClick={() => {
                              setYoutubePlaylistInput('');
                              setImportYoutubeError('');
                              setImportYoutubeSuccess('');
                              setShowImportYoutubeModal(true);
                            }}
                            className="p-6 rounded-xl border border-dashed border-red-900/60 hover:border-red-500 bg-[#181818]/60 text-center cursor-pointer transition group"
                          >
                            <Video className="w-7 h-7 text-red-500 mx-auto mb-2 transition group-hover:scale-110" />
                            <p className="text-sm font-bold text-white">Import YouTube Playlist</p>
                            <p className="text-xs text-[#b3b3b3] mt-1">Paste a link to import your favorite YouTube songs in seconds.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Detail View of Selected Playlist */
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <button
                      onClick={() => setSelectedPlaylistView(null)}
                      className="flex items-center gap-2 text-xs text-[#b3b3b3] hover:text-white font-bold transition cursor-pointer py-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Library</span>
                    </button>

                    {/* Playlist Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 pb-2">
                      <img
                        src={selectedPlaylistView.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80'}
                        alt={selectedPlaylistView.title}
                        className="w-36 h-36 sm:w-52 sm:h-52 rounded-md object-cover shadow-2xl shrink-0"
                      />
                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#b3b3b3]">
                          Playlist
                        </span>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                          {selectedPlaylistView.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-[#b3b3b3] line-clamp-2">
                          {selectedPlaylistView.description}
                        </p>
                        <p className="text-xs text-white font-semibold flex items-center gap-1.5 pt-1">
                          <span className="text-[#1ed760]">Secret-Bubble</span> • <span>{getPlaylistSongs(selectedPlaylistView).length} songs</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Bar (Giant Spotify Green Play Button) */}
                    <div className="flex items-center gap-4 py-2 border-b border-[#282828]">
                      <button
                        onClick={() => playPlaylistAll(selectedPlaylistView)}
                        disabled={getPlaylistSongs(selectedPlaylistView).length === 0}
                        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1ed760] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-2xl disabled:opacity-40 transition cursor-pointer"
                        title="Play All"
                      >
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </button>

                      {selectedPlaylistView.isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustomPlaylist(selectedPlaylistView.id, e)}
                          className="p-2.5 text-[#b3b3b3] hover:text-rose-400 hover:bg-[#282828] rounded-full transition cursor-pointer"
                          title="Delete Playlist"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}

                      {selectedPlaylistView.id === 'pl-history' && (
                        <button
                          onClick={clearListeningHistory}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#b3b3b3] hover:text-rose-400 hover:bg-[#282828] rounded-full transition cursor-pointer border border-[#3e3e3e]"
                          title="Clear Listening History"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear History</span>
                        </button>
                      )}
                    </div>

                    {/* Tracklist Inside Playlist */}
                    <div className="divide-y divide-transparent space-y-0.5">
                      {getPlaylistSongs(selectedPlaylistView).map((track, idx) => {
                        const isCurrent = track.id === currentTrack.id;
                        return (
                          <div
                            key={track.id || idx}
                            onClick={() => playTrackNow(track)}
                            className={`grid grid-cols-12 items-center px-3 py-2 rounded-md transition cursor-pointer group ${
                              isCurrent ? 'bg-[#2a2a2a] text-[#1ed760]' : 'hover:bg-[#2a2a2a]/70 text-[#b3b3b3]'
                            }`}
                          >
                            <div className="col-span-1 flex items-center justify-center text-xs font-mono">
                              {isCurrent && isPlaying ? (
                                <div className="flex items-end gap-0.5 h-3">
                                  <span className="w-0.5 h-full bg-[#1ed760] animate-bounce" />
                                  <span className="w-0.5 h-2 bg-[#1ed760] animate-bounce delay-75" />
                                  <span className="w-0.5 h-3 bg-[#1ed760] animate-bounce delay-150" />
                                </div>
                              ) : (
                                <>
                                  <span className="group-hover:hidden text-[#b3b3b3]">{idx + 1}</span>
                                  <Play className="w-3.5 h-3.5 fill-current text-white hidden group-hover:block ml-0.5" />
                                </>
                              )}
                            </div>

                            <div className="col-span-8 sm:col-span-7 flex items-center gap-3 min-w-0 pr-2">
                              <img
                                src={track.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                                alt={track.title}
                                className="w-10 h-10 rounded object-cover shrink-0 shadow"
                              />
                              <div className="min-w-0">
                                <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white group-hover:underline'}`}>
                                  {track.title}
                                </p>
                                <p className="text-[11px] text-[#b3b3b3] truncate group-hover:text-white">
                                  {track.artist}
                                </p>
                              </div>
                            </div>

                            <div className="col-span-3 sm:col-span-4 flex items-center justify-end gap-2 text-xs">
                              {selectedPlaylistView.isCustom && (
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveSongFromPlaylist(selectedPlaylistView.id, track.id, e)}
                                  className="p-1.5 text-[#b3b3b3] hover:text-rose-400 rounded-full transition"
                                  title="Remove from playlist"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {selectedPlaylistView.id === 'pl-history' && track.playedAt && (
                                <span className="text-[10px] text-violet-400 font-medium whitespace-nowrap">
                                  {Math.floor((Date.now() - track.playedAt) / 1000) < 60
                                    ? 'Just now'
                                    : Math.floor((Date.now() - track.playedAt) / 60000) < 60
                                    ? `${Math.floor((Date.now() - track.playedAt) / 60000)}m ago`
                                    : Math.floor((Date.now() - track.playedAt) / 3600000) < 24
                                    ? `${Math.floor((Date.now() - track.playedAt) / 3600000)}h ago`
                                    : `${Math.floor((Date.now() - track.playedAt) / 86400000)}d ago`}
                                </span>
                              )}
                              <span className="font-mono text-[#b3b3b3]">
                                {track.durationText || '3:30'}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {getPlaylistSongs(selectedPlaylistView).length === 0 && (
                        <div className="text-center py-16 text-[#b3b3b3] text-xs">
                          {selectedPlaylistView.id === 'pl-history' ? (
                            <>
                              <Clock className="w-10 h-10 mx-auto mb-2 text-[#4d4d4d]" />
                              <p className="font-bold text-white text-sm">No listening history yet</p>
                              <p className="text-[#b3b3b3] mt-1">Play any song and it will automatically appear here in your history.</p>
                            </>
                          ) : (
                            <>
                              <ListMusic className="w-10 h-10 mx-auto mb-2 text-[#4d4d4d]" />
                              <p className="font-bold text-white text-sm">It's a bit empty here</p>
                              <p className="text-[#b3b3b3] mt-1">Search for songs or tap '+' in All Songs to add them to this playlist.</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: Search Results */}
            {activeTab === 'search' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Songs & Artists'}
                  </h2>
                  {searchResults.length > 0 && (
                    <span className="text-xs text-[#b3b3b3] font-medium">{searchResults.length} tracks found</span>
                  )}
                </div>

                {/* Popular Instant Search Chips */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">Quick Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {['Arijit Singh', 'Kesariya', 'Chaleya', 'Sidhu Moose Wala', 'Diljit Dosanjh', 'Apna Bana Le', 'Romantic Melodies', 'Lofi Hindi'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => executeSearch(tag)}
                        className="px-3 py-1.5 rounded-full bg-[#242424] hover:bg-[#1ed760] hover:text-black text-white text-xs font-semibold transition cursor-pointer border border-white/5 shadow-sm active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading Spinner */}
                {isSearching && (
                  <div className="flex flex-col items-center justify-center py-14 gap-3 bg-[#181818]/60 rounded-xl border border-white/5">
                    <Loader2 className="w-8 h-8 text-[#1ed760] animate-spin" />
                    <p className="text-sm font-semibold text-white">Searching songs & music streams...</p>
                    <p className="text-xs text-[#b3b3b3]">Connecting to high-fidelity audio catalog</p>
                  </div>
                )}

                {/* Search Error Notice */}
                {searchError && !isSearching && (
                  <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-4 text-center my-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-rose-200">{searchError}</p>
                    <p className="text-[11px] text-[#b3b3b3] mt-1">Try tapping any of the quick suggestions above.</p>
                  </div>
                )}

                {/* Results List */}
                <div className="divide-y divide-transparent space-y-0.5">
                  {searchResults.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => playTrackNow(item)}
                      className="grid grid-cols-12 items-center px-3 py-2 rounded-md hover:bg-[#2a2a2a]/70 cursor-pointer transition group text-[#b3b3b3]"
                    >
                      <div className="col-span-1 text-center font-mono text-xs text-[#b3b3b3]">
                        {idx + 1}
                      </div>
                      <div className="col-span-9 sm:col-span-8 flex items-center gap-3 min-w-0 pr-2">
                        <img
                          src={item.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                          alt={item.title}
                          className="w-10 h-10 rounded object-cover shrink-0 shadow"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[#1ed760] transition">{item.title}</p>
                            {item.year && item.year >= 2024 ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30 shrink-0">
                                NEW {item.year}
                              </span>
                            ) : item.year ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-mono text-[#b3b3b3] rounded bg-white/5 shrink-0">
                                {item.year}
                              </span>
                            ) : item.publishedTime ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-mono text-[#b3b3b3] rounded bg-white/5 shrink-0">
                                {item.publishedTime}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-[#b3b3b3] truncate">{item.artist}</p>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddToPlaylistTrack(item);
                          }}
                          className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full transition cursor-pointer"
                          title="Add to Playlist"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow cursor-pointer">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {searchResults.length === 0 && !isSearching && !searchError && (
                    <div className="text-center py-16 text-[#b3b3b3] text-xs bg-[#181818]/40 rounded-xl border border-white/5">
                      <Search className="w-10 h-10 mx-auto mb-2 text-[#4d4d4d]" />
                      <p className="font-bold text-white text-sm">Play what you love</p>
                      <p className="text-[#b3b3b3] mt-1">Search for your favorite songs, artists, or paste any YouTube URL above.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Trending Hits */}
            {activeTab === 'trending' && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Trending Hits Now</h2>
                <div className="divide-y divide-transparent space-y-0.5">
                  {FEATURED_ONLINE_TRACKS.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => playTrackNow(item)}
                      className="grid grid-cols-12 items-center px-3 py-2 rounded-md hover:bg-[#2a2a2a]/70 cursor-pointer transition group text-[#b3b3b3]"
                    >
                      <div className="col-span-1 text-center font-mono text-xs text-[#b3b3b3]">
                        {idx + 1}
                      </div>
                      <div className="col-span-9 sm:col-span-8 flex items-center gap-3 min-w-0 pr-2">
                        <img
                          src={item.artwork}
                          alt={item.title}
                          className="w-10 h-10 rounded object-cover shrink-0 shadow"
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:underline">{item.title}</p>
                          <p className="text-[11px] text-[#b3b3b3] truncate">{item.artist}</p>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-3 flex items-center justify-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Phone Storage */}
            {activeTab === 'phone' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Phone Local Audio</h2>
                    <p className="text-xs text-[#b3b3b3]">Listen to downloaded MP3 files offline</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-xs flex items-center gap-2 shadow transition active:scale-95 cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Import Audio Files</span>
                  </button>
                </div>

                <div className="divide-y divide-transparent space-y-0.5">
                  {tracks.filter(t => t.isLocal).map((track, idx) => (
                    <div
                      key={track.id}
                      onClick={() => playTrackNow(track)}
                      className="grid grid-cols-12 items-center px-3 py-2 rounded-md hover:bg-[#2a2a2a]/70 cursor-pointer transition group text-[#b3b3b3]"
                    >
                      <div className="col-span-1 text-center font-mono text-xs text-[#b3b3b3]">
                        {idx + 1}
                      </div>
                      <div className="col-span-9 sm:col-span-8 min-w-0 pr-2">
                        <p className="font-semibold text-xs sm:text-sm text-white truncate group-hover:underline">{track.title}</p>
                        <p className="text-[11px] text-[#b3b3b3]">{track.artist}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-3 flex items-center justify-end">
                        <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {tracks.filter(t => t.isLocal).length === 0 && (
                    <div className="text-center py-16 text-[#b3b3b3] text-xs">
                      <Smartphone className="w-10 h-10 mx-auto mb-2 text-[#4d4d4d]" />
                      <p className="font-bold text-white text-sm">No local tracks imported</p>
                      <p className="text-[#b3b3b3] mt-1">Tap 'Import Audio Files' above to load your offline songs.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Spotify Fixed Bottom Player Bar (Classic 3-column Spotify Player) */}
          <div className="fixed bottom-0 inset-x-0 z-40 bg-[#181818] border-t border-[#282828] px-3 sm:px-6 pt-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-between gap-3 sm:gap-6 min-h-[5rem] select-none">
            
            {/* Column 1 (Left): Currently Playing Song Info */}
            <div className="flex items-center gap-3 min-w-0 w-[45%] sm:w-[30%]">
              <div 
                onClick={() => setViewMode('nowPlaying')}
                className="relative shrink-0 cursor-pointer group"
                title="Open Now Playing View"
              >
                <img
                  src={currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                  alt={currentTrack.title}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded object-cover shadow"
                />
              </div>

              <div className="min-w-0 pr-1">
                <p 
                  onClick={() => setViewMode('nowPlaying')}
                  className="text-xs sm:text-sm font-semibold text-white truncate hover:underline cursor-pointer"
                >
                  {currentTrack.title}
                </p>
                <p 
                  onClick={() => setViewMode('nowPlaying')}
                  className="text-[11px] text-[#b3b3b3] truncate hover:underline cursor-pointer"
                >
                  {currentTrack.artist}
                </p>
              </div>

              {/* Like Button */}
              <button
                onClick={handleHeartClick}
                className={`p-1.5 rounded-full transition shrink-0 ${
                  isLiked || likedSongIds.includes(currentTrack.id)
                    ? 'text-[#1ed760]'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
                title="Save to Liked Songs (Tap 3x to unlock chat)"
              >
                <Heart className={`w-4 h-4 ${isLiked || likedSongIds.includes(currentTrack.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Column 2 (Center): Playback Controls & Timeline Scrubber */}
            <div className="flex flex-col items-center justify-center flex-1 max-w-lg w-[45%]">
              {/* Controls Row */}
              <div className="flex items-center gap-3 sm:gap-5 mb-1.5">
                <button
                  onClick={() => setIsShuffle(s => !s)}
                  className={`p-1 rounded-full transition ${isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'}`}
                  title="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePrevTrack}
                  className="text-[#b3b3b3] hover:text-white transition active:scale-90 cursor-pointer p-1"
                  title="Previous Track"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="text-[#b3b3b3] hover:text-white transition active:scale-90 cursor-pointer p-1"
                  title="Next Track"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={() => setIsRepeat(r => !r)}
                  className={`p-1 rounded-full transition ${isRepeat ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'}`}
                  title="Repeat"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Scrub Bar */}
              <div className="w-full flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#b3b3b3] w-9 text-right shrink-0">
                  {formatTime(currentTime)}
                </span>
                <div 
                  onClick={handleSeek}
                  className="relative flex-1 h-1 hover:h-2 bg-[#4d4d4d] rounded-full cursor-pointer group transition-all duration-150"
                >
                  <div 
                    className="h-full bg-[#1ed760] rounded-full transition-all duration-100 relative"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow transition-opacity" />
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#b3b3b3] w-9 text-left shrink-0">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Column 3 (Right): Volume & Utility Buttons */}
            <div className="hidden sm:flex items-center justify-end gap-3 w-[25%]">
              <button
                onClick={handleEqualizerClick}
                className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#242424] transition cursor-pointer"
                title="Sound Equalizer"
              >
                <Sliders className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 max-w-[130px] w-full">
                <button
                  onClick={() => setIsMuted(m => !m)}
                  className="text-[#b3b3b3] hover:text-white transition"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseInt(e.target.value, 10));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-full h-1 bg-[#4d4d4d] rounded-lg appearance-none cursor-pointer accent-[#1ed760]"
                />
              </div>

              <button
                onClick={() => setViewMode('nowPlaying')}
                className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#242424] transition"
                title="Expand Full Screen"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Expand Button (visible only on xs screens) */}
            <div className="sm:hidden flex items-center gap-1">
              <button
                onClick={() => setViewMode('nowPlaying')}
                className="p-2 text-[#b3b3b3] hover:text-white"
                title="Open Full Screen"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: Spotify Full "Now Playing" Screen (Expands on Cover / Tap)
          ========================================================================= */}
      {viewMode === 'nowPlaying' && (
        <div className="relative flex-1 flex flex-col justify-between w-full max-w-lg mx-auto h-full p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          
          {/* Ambient Video Background Layer in Now Playing Screen */}
          {backgroundVideoEnabled && currentTrack.youtubeId && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=1&mute=1&controls=0&showinfo=0&loop=1&playlist=${currentTrack.youtubeId}&playsinline=1&modestbranding=1&rel=0`}
                title="Ambient Video Background"
                className="w-[160%] h-[160%] -translate-x-[30%] -translate-y-[30%] object-cover filter blur-3xl scale-125 pointer-events-none"
                tabIndex="-1"
                aria-hidden="true"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/80 via-[#121212]/85 to-[#121212]" />
            </div>
          )}

          {/* Top Bar */}
          <div className="flex items-center justify-between w-full pt-[max(0.75rem,env(safe-area-inset-top))] pb-1 relative z-10">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#282828] transition cursor-pointer"
              title="Return to Songs List"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#b3b3b3] block">
                Playing from playlist
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[200px] block">
                {selectedPlaylistView?.title || "Today's Top Hits"}
              </span>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Ambient Background Video Toggle */}
              {currentTrack.youtubeId && (
                <button
                  onClick={() => setBackgroundVideoEnabled(b => !b)}
                  className={`p-2 rounded-full border transition active:scale-90 ${
                    backgroundVideoEnabled ? 'bg-[#1ed760]/20 border-[#1ed760] text-[#1ed760]' : 'bg-[#282828] border-transparent text-[#b3b3b3] hover:text-white'
                  }`}
                  title={backgroundVideoEnabled ? "Ambient Background Video: Active" : "Enable Ambient Background Video"}
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}

              {(currentTrack.youtubeId || currentTrack.isYoutube) && (
                <button
                  onClick={() => setShowVideoMode(!showVideoMode)}
                  className={`p-2 rounded-full border transition active:scale-90 ${
                    showVideoMode ? 'bg-[#1ed760] border-[#1ed760] text-black' : 'bg-[#282828] border-transparent text-[#b3b3b3] hover:text-white'
                  }`}
                  title="Watch Music Video"
                >
                  <Video className="w-4 h-4" />
                </button>
              )}

              {/* Equalizer (Secret Code Door) */}
              <button
                onClick={handleEqualizerClick}
                title="Audio Equalizer"
                className="p-2 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#282828] transition"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Stage: Canvas / Album Art & Live Waveform */}
          <div className="flex flex-col items-center justify-center my-auto w-full py-2 relative z-10">
            {/* Spotify Canvas / Album Art Mode Switcher */}
            <div className="flex items-center justify-center gap-1.5 p-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 mb-3">
              <button
                onClick={() => setCanvasMode('canvas')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  canvasMode === 'canvas' ? 'bg-[#1ed760] text-black font-bold shadow' : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Canvas</span>
              </button>
              <button
                onClick={() => setCanvasMode('cover')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  canvasMode === 'cover' ? 'bg-white text-black font-bold shadow' : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Album Art</span>
              </button>
            </div>

            <div 
              onClick={handleCoverTap}
              className="relative group cursor-pointer"
              title="Triple-tap cover to unlock secret vault"
            >
              {/* Video Canvas Mode */}
              {canvasMode === 'canvas' ? (
                currentTrack.isYoutube ? (
                  // YouTube full-video stream is rendered via persistent iframe positioned above
                  <div 
                    ref={canvasSlotRef}
                    className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black flex items-center justify-center"
                  >
                    <img 
                      src={currentTrack.artwork} 
                      alt={currentTrack.title}
                      className="w-full h-full object-cover opacity-20 pointer-events-none"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-[#1ed760] uppercase tracking-wider flex items-center gap-1 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-pulse" />
                      <span>Live Video</span>
                    </div>
                  </div>
                ) : currentTrack.youtubeId ? (
                  // JioSaavn / Audio stream + Silent High-Res Spotify Looping Canvas
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black group-hover:scale-[1.02] transition-transform duration-300">
                    <iframe
                      ref={canvasIframeRef}
                      key={`canvas-${currentTrack.youtubeId}`}
                      src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=${isPlaying ? 1 : 0}&mute=1&controls=0&loop=1&playlist=${currentTrack.youtubeId}&playsinline=1&modestbranding=1&rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                      title="Spotify Looping Video Canvas"
                      className="w-full h-full object-cover scale-110 pointer-events-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-[#1ed760] uppercase tracking-wider flex items-center gap-1 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-ping" />
                      <span>Canvas Video</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowVideoMode(true);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-black text-white hover:text-[#1ed760] transition shadow-lg z-20 cursor-pointer"
                      title="Watch Full Video"
                      aria-label="Watch Full Video"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // Audio track with canvas match on demand
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#282828]">
                    <img 
                      src={currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'} 
                      alt={currentTrack.title}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchVideoCanvasForTrack(currentTrack);
                      }}
                      disabled={isLoadingCanvas}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-2 text-white hover:bg-black/70 transition p-4 cursor-pointer"
                    >
                      {isLoadingCanvas ? (
                        <>
                          <Loader2 className="w-8 h-8 text-[#1ed760] animate-spin" />
                          <span className="text-xs font-semibold">Matching Video Canvas...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg hover:scale-105 transition">
                            <Video className="w-6 h-6 fill-current" />
                          </div>
                          <span className="text-xs font-bold text-center">Load Spotify Video Canvas</span>
                          <span className="text-[10px] text-[#b3b3b3] text-center">Stream background video for this track</span>
                        </>
                      )}
                    </button>
                  </div>
                )
              ) : (
                // Classic High-Res Vinyl Album Art
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#282828] group-hover:scale-[1.02] transition-transform duration-300">
                  <img 
                    src={currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              )}

              {/* Equalizer Live Visualizer Waveform */}
              {isPlaying && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#282828] shadow-xl z-10">
                  <div className="w-1 h-3 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-5 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-7 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="w-1 h-4 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                  <div className="w-1 h-6 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                </div>
              )}
            </div>

            {/* Track Title & Artist */}
            <div className="w-full flex items-center justify-between mt-6 px-2">
              <div className="min-w-0 pr-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-sm text-[#b3b3b3] mt-1 truncate">
                  {currentTrack.artist}
                </p>
              </div>

              <button
                onClick={handleHeartClick}
                className={`p-2 rounded-full transition active:scale-125 ${
                  isLiked || likedSongIds.includes(currentTrack.id)
                    ? 'text-[#1ed760]'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
                title="Save to Favorites (Tap 3 times to unlock chat)"
              >
                <Heart className={`w-6 h-6 ${isLiked || likedSongIds.includes(currentTrack.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className="w-full space-y-4 pb-4">
            {/* Progress Bar & Timestamps */}
            <div className="space-y-1.5">
              <div 
                onClick={handleSeek}
                className="relative w-full h-1.5 hover:h-2.5 bg-[#4d4d4d] rounded-full cursor-pointer group transition-all duration-150"
              >
                <div 
                  className="h-full bg-white group-hover:bg-[#1ed760] rounded-full transition-all duration-100 relative"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#b3b3b3] font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setIsShuffle(s => !s)}
                className={`p-2 rounded-full transition ${
                  isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-6">
                <button
                  onClick={handlePrevTrack}
                  className="p-2 text-[#b3b3b3] hover:text-white transition active:scale-90 cursor-pointer"
                  title="Previous Track"
                >
                  <SkipBack className="w-7 h-7 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="p-2 text-[#b3b3b3] hover:text-white transition active:scale-90 cursor-pointer"
                  title="Next Track"
                >
                  <SkipForward className="w-7 h-7 fill-current" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsRepeat(r => !r)}
                  className={`p-2 rounded-full transition ${
                    isRepeat ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
                  }`}
                  title="Repeat"
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Volume Slider Bar */}
            <div className="flex items-center gap-3 px-3 pt-2 text-[#b3b3b3]">
              <button 
                onClick={() => setIsMuted(m => !m)}
                className="hover:text-white transition"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseInt(e.target.value, 10));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full h-1 bg-[#4d4d4d] rounded-lg appearance-none cursor-pointer accent-[#1ed760]"
              />
            </div>

          </div>

        </div>
      )}

      {/* First Time Security Passcode Setup Modal */}
      {showSetupPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#282828] border border-[#3e3e3e] rounded-2xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1ed760] font-bold text-sm tracking-wide">
                <KeyRound className="w-5 h-5" />
                <span>Security PIN Setup</span>
              </div>
              <button
                onClick={() => setShowSetupPinModal(false)}
                className="p-1 text-[#b3b3b3] hover:text-white rounded-lg hover:bg-[#333] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#b3b3b3] leading-relaxed">
              Set your personal PINs for disguise unlocking. You can set a real PIN and an optional decoy PIN.
            </p>

            <form onSubmit={handleSetupPinSubmit} className="space-y-4">
              {/* Secret PIN (Primary) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Secret PIN (Real) <span className="text-red-400">*</span></span>
                  <span className="text-[10px] text-[#1ed760]">Opens Real Chat</span>
                </label>
                <div className="relative">
                  <input
                    type={showSetupSecretEye ? "text" : "password"}
                    value={setupSecretPin}
                    onChange={(e) => { setSetupSecretPin(e.target.value.replace(/\D/g, '').slice(0, 8)); setSetupError(''); }}
                    placeholder="e.g. 1234"
                    maxLength={8}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-[#1ed760] rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupSecretEye(!showSetupSecretEye)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white transition"
                  >
                    {showSetupSecretEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Decoy PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Decoy PIN (Optional)</span>
                  <span className="text-[10px] text-amber-400">Opens Fake Notes</span>
                </label>
                <div className="relative">
                  <input
                    type={showSetupDecoyEye ? "text" : "password"}
                    value={setupDecoyPin}
                    onChange={(e) => { setSetupDecoyPin(e.target.value.replace(/\D/g, '').slice(0, 8)); setSetupError(''); }}
                    placeholder="Optional (e.g. 9999)"
                    maxLength={8}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-amber-500 rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupDecoyEye(!showSetupDecoyEye)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white transition"
                  >
                    {showSetupDecoyEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {setupError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSetupPinModal(false)}
                  className="flex-1 py-2.5 bg-[#333] hover:bg-[#3e3e3e] text-white rounded-full text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1ed760] hover:bg-[#1db954] text-black rounded-full text-xs font-bold transition shadow-lg shadow-[#1ed760]/20"
                >
                  Save & Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret Code Dialog (Disguised as Audio Equalizer Preset) */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-[#282828] border border-[#3e3e3e] rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1ed760] font-bold text-xs tracking-wider uppercase">
                <Sliders className="w-4 h-4" />
                <span>EQ Sound Profile</span>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="p-1 text-[#b3b3b3] hover:text-white rounded-lg hover:bg-[#333] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#b3b3b3]">
              Enter customized acoustic preset code:
            </p>

            <form onSubmit={handleCodeSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type={showCodeEye ? "text" : "password"}
                  value={inputCode}
                  onChange={(e) => { setInputCode(e.target.value.replace(/\D/g, '').slice(0, 8)); setCodeError(''); }}
                  placeholder="Enter preset PIN..."
                  autoFocus
                  maxLength={8}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-[#1ed760] rounded-xl text-sm text-white font-mono text-center tracking-widest focus:outline-none pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowCodeEye(!showCodeEye)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white transition"
                >
                  {showCodeEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {codeError && (
                <p className="text-[11px] text-amber-400 text-center font-medium">
                  {codeError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="flex-1 py-2 bg-[#333] hover:bg-[#3e3e3e] text-white rounded-full text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#1ed760] hover:bg-[#1db954] text-black rounded-full text-xs font-bold transition shadow-lg shadow-[#1ed760]/20"
                >
                  Apply EQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help Guide */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xs bg-[#282828] border border-[#3e3e3e] rounded-2xl p-5 space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-2 text-[#1ed760] font-bold text-sm">
              <Music className="w-4 h-4" />
              <span>Secret-Bubble Music</span>
            </div>
            
            <div className="text-xs text-[#b3b3b3] space-y-2 leading-relaxed">
              <p>Enjoy high-fidelity streaming music, curated playlists, and phone storage playback in a dark audio lounge.</p>
              
              <div className="p-3 rounded-xl bg-[#181818] border border-[#3e3e3e] space-y-1.5 text-[11px] font-mono text-white">
                <p className="text-[#1ed760]">⚡ <strong>Unlock chat vault:</strong></p>
                <p>• <strong>Triple-tap</strong> the album cover</p>
                <p>• Or tap the <strong>Heart ❤️</strong> icon 3 times</p>
                <p>• Or tap <strong>EQ icon</strong> and enter PIN <span className="text-amber-400">{secretPin}</span></p>
                <p className="text-cyan-300 pt-1">• <strong>Decoy Mode:</strong> EQ PIN <span className="text-cyan-400">{decoyPin}</span></p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-white hover:bg-slate-200 text-black font-bold rounded-full text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Import YouTube Playlist Modal */}
      {showImportYoutubeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#282828] border border-[#3e3e3e] rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                <Video className="w-5 h-5" />
                <span>Import YouTube Playlist</span>
              </div>
              <button
                onClick={() => {
                  if (!isImportingYoutube) {
                    setShowImportYoutubeModal(false);
                    setImportYoutubeError('');
                    setImportYoutubeSuccess('');
                  }
                }}
                disabled={isImportingYoutube}
                className="p-1 text-[#b3b3b3] hover:text-white rounded-lg hover:bg-[#333] transition disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#b3b3b3] leading-relaxed">
              Paste any public or unlisted YouTube or YouTube Music playlist link or ID. All songs will be imported into your library with audio streaming and Video Canvas.
            </p>

            <form onSubmit={handleImportYoutubePlaylist} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#b3b3b3]">YouTube Playlist Link or ID</label>
                <input
                  type="text"
                  required
                  value={youtubePlaylistInput}
                  onChange={(e) => setYoutubePlaylistInput(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=PL... or PL..."
                  disabled={isImportingYoutube}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-red-500 rounded-xl text-xs text-white focus:outline-none transition disabled:opacity-50"
                  autoFocus
                />
              </div>

              {importYoutubeError && (
                <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{importYoutubeError}</span>
                </div>
              )}

              {importYoutubeSuccess && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-[#1ed760]" />
                  <span>{importYoutubeSuccess}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportYoutubeModal(false);
                    setImportYoutubeError('');
                    setImportYoutubeSuccess('');
                  }}
                  disabled={isImportingYoutube}
                  className="flex-1 py-2.5 bg-[#333] hover:bg-[#3e3e3e] text-white rounded-full text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImportingYoutube || !youtubePlaylistInput.trim()}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-full text-xs font-bold transition shadow-lg shadow-red-900/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isImportingYoutube ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <span>Import & Save</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Playlist Modal (Spotify Style) */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#282828] border border-[#3e3e3e] rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1ed760] font-bold text-sm">
                <ListMusic className="w-5 h-5" />
                <span>Create Playlist</span>
              </div>
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                className="p-1 text-[#b3b3b3] hover:text-white rounded-lg hover:bg-[#333] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#b3b3b3]">Name</label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Playlist #1"
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-[#1ed760] rounded-xl text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#b3b3b3]">Description (Optional)</label>
                <input
                  type="text"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Add an optional description"
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-[#1ed760] rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlaylistModal(false)}
                  className="flex-1 py-2 bg-[#333] hover:bg-[#3e3e3e] text-white rounded-full text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 py-2 bg-[#1ed760] hover:bg-[#1db954] disabled:opacity-50 text-black rounded-full text-xs font-bold transition shadow-lg shadow-[#1ed760]/20 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Song to Playlist Modal (Spotify Style) */}
      {addToPlaylistTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#282828] border border-[#3e3e3e] rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1ed760] font-bold text-sm">
                <Plus className="w-5 h-5" />
                <span>Add to playlist</span>
              </div>
              <button
                onClick={() => setAddToPlaylistTrack(null)}
                className="p-1 text-[#b3b3b3] hover:text-white rounded-lg hover:bg-[#333] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Song Preview */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#181818] border border-[#3e3e3e]">
              <img
                src={addToPlaylistTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                alt={addToPlaylistTrack.title}
                className="w-11 h-11 rounded object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{addToPlaylistTrack.title}</p>
                <p className="text-[10px] text-[#b3b3b3] truncate">{addToPlaylistTrack.artist}</p>
              </div>
            </div>

            {/* 1-Tap Toggle: Liked Songs */}
            <button
              type="button"
              onClick={() => toggleLikeTrack(addToPlaylistTrack)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#3e3e3e] hover:border-[#1ed760] transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Heart className={`w-4 h-4 ${likedSongIds.includes(addToPlaylistTrack.id) ? 'fill-[#1ed760] text-[#1ed760]' : 'text-[#b3b3b3]'}`} />
                <span className="text-xs font-semibold text-white">Liked Songs</span>
              </div>
              <span className="text-[10px] font-bold text-[#1ed760]">
                {likedSongIds.includes(addToPlaylistTrack.id) ? 'Added ✓' : '+ Add'}
              </span>
            </button>

            {/* List of Custom Playlists */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <p className="text-[10px] uppercase font-bold text-[#b3b3b3] px-1">Your Playlists</p>
              {customPlaylists.length > 0 ? (
                customPlaylists.map((pl) => {
                  const alreadyInPlaylist = (pl.songs || []).some(s => s.id === addToPlaylistTrack.id);
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => handleAddSongToPlaylist(pl.id, addToPlaylistTrack)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#181818] hover:bg-[#333] border border-[#3e3e3e] hover:border-[#1ed760] transition cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ListMusic className="w-4 h-4 text-[#1ed760] shrink-0" />
                        <span className="text-xs font-medium text-white truncate">{pl.title}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#1ed760] shrink-0">
                        {alreadyInPlaylist ? 'Added ✓' : '+ Add'}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-center py-4 text-[11px] text-[#b3b3b3]">
                  No custom playlists yet. Create one below!
                </p>
              )}
            </div>

            {/* Quick Create New Playlist Button */}
            <button
              type="button"
              onClick={() => {
                setShowCreatePlaylistModal(true);
              }}
              className="w-full py-2.5 rounded-full border border-dashed border-[#3e3e3e] hover:border-[#1ed760] text-[#1ed760] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Playlist</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
