import { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { HeroSection } from './components/HeroSection';
import { MusicPillPlayer } from './components/MusicPillPlayer';
import { PlaylistDrawer } from './components/PlaylistDrawer';
import { AdminPanel } from './components/AdminPanel';
import { THEMES, PRESET_PLAYLISTS, DEFAULT_GIFT_CONFIG } from './presets';
import type { Playlist, Theme, GiftConfig, PlaylistItem, ThemeId } from './types';
import { YouTubePlayerService } from './services/YouTubePlayer';
import { Eye, EyeOff, Video } from 'lucide-react';

export function App() {
  // LocalStorage keys
  const LS_THEME_KEY = 'vibestream_theme_id';
  const LS_GIFT_KEY = 'vibestream_gift_config';
  const LS_CUSTOM_PLAYLISTS_KEY = 'vibestream_custom_playlists';

  // Secret Admin Page Check (#admin or ?admin=true)
  const [isAdminPage, setIsAdminPage] = useState<boolean>(() => {
    return (
      window.location.hash === '#admin' ||
      window.location.search.includes('admin=true') ||
      window.location.search.includes('admin')
    );
  });

  // Listen to hash change for #admin
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminPage(
        window.location.hash === '#admin' ||
        window.location.search.includes('admin=true') ||
        window.location.search.includes('admin')
      );
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard shortcut to toggle secret admin (Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        setIsAdminPage((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Video Toggle State
  const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false);

  // Load persistent state & parse URL query params if present (e.g. ?to=Simran&msg=...)
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(LS_THEME_KEY);
    return saved && THEMES[saved] ? THEMES[saved] : THEMES.princess;
  });

  const [giftConfig, setGiftConfig] = useState<GiftConfig>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFriend = params.get('to');
    const urlMsg = params.get('msg');
    const urlHindi = params.get('hindi');
    const urlTitle = params.get('title');

    if (urlFriend || urlMsg) {
      const urlConfig: GiftConfig = {
        friendName: urlFriend || DEFAULT_GIFT_CONFIG.friendName,
        tagline: DEFAULT_GIFT_CONFIG.tagline,
        message: urlMsg || DEFAULT_GIFT_CONFIG.message,
        customTitle: urlTitle || DEFAULT_GIFT_CONFIG.customTitle,
        hindiTitle: urlHindi || DEFAULT_GIFT_CONFIG.hindiTitle,
        isGiftMode: true,
      };
      localStorage.setItem(LS_GIFT_KEY, JSON.stringify(urlConfig));
      return urlConfig;
    }

    const saved = localStorage.getItem(LS_GIFT_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_GIFT_CONFIG;
  });

  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem(LS_CUSTOM_PLAYLISTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const allPlaylists = [...PRESET_PLAYLISTS, ...customPlaylists];

  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>(allPlaylists[0]);
  const [tracks, setTracks] = useState<PlaylistItem[]>(allPlaylists[0].items || []);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [currentTrack, setCurrentTrack] = useState<PlaylistItem | null>(
    allPlaylists[0].items && allPlaylists[0].items[0] ? allPlaylists[0].items[0] : null
  );

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(90);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  // Drawer State
  const [isPlaylistDrawerOpen, setIsPlaylistDrawerOpen] = useState<boolean>(false);

  // YouTube Player instance ref
  const ytServiceRef = useRef<YouTubePlayerService | null>(null);

  // Initialize YouTube Player Service
  useEffect(() => {
    if (isAdminPage) return;

    const ytService = new YouTubePlayerService('yt-player-host');
    ytServiceRef.current = ytService;

    ytService.init().then(() => {
      ytService.onStateChange(({ isPlaying, isBuffering }) => {
        setIsPlaying(isPlaying);
        setIsBuffering(isBuffering);
      });

      ytService.onTimeUpdate(({ currentTime, duration }) => {
        setCurrentTime(currentTime);
        if (duration > 0) setDuration(duration);
      });

      ytService.onTrackChange(({ index, videoId, meta }) => {
        setCurrentTrackIndex(index);
        if (meta) {
          const newTrackItem = {
            id: videoId,
            title: meta.title,
            artist: meta.artist,
            thumbnail: meta.thumbnail,
          };
          setCurrentTrack(newTrackItem);

          setTracks((prev) => {
            const exists = prev.some((t) => t.id === videoId);
            if (!exists) return [...prev, newTrackItem];
            return prev;
          });
        }
      });

      if (currentPlaylist.youtubeListId) {
        ytService.loadPlaylist(currentPlaylist.youtubeListId, 0);
      }
    });

    return () => {
      ytService.destroy();
    };
  }, [isAdminPage]);

  // Theme & Gift persistence handlers
  const handleSelectTheme = (themeId: ThemeId) => {
    if (THEMES[themeId]) {
      setCurrentTheme(THEMES[themeId]);
      localStorage.setItem(LS_THEME_KEY, themeId);
    }
  };

  const handleSaveGiftConfig = (newConfig: GiftConfig) => {
    setGiftConfig(newConfig);
    localStorage.setItem(LS_GIFT_KEY, JSON.stringify(newConfig));
  };

  const handleAddPlaylist = (newPlaylist: Playlist) => {
    const updated = [newPlaylist, ...customPlaylists];
    setCustomPlaylists(updated);
    localStorage.setItem(LS_CUSTOM_PLAYLISTS_KEY, JSON.stringify(updated));
  };

  const handleDeletePlaylist = (playlistId: string) => {
    const updated = customPlaylists.filter((p) => p.id !== playlistId);
    setCustomPlaylists(updated);
    localStorage.setItem(LS_CUSTOM_PLAYLISTS_KEY, JSON.stringify(updated));
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
    setTracks(playlist.items || []);
    setCurrentTrackIndex(0);
    setCurrentTime(0);

    if (playlist.items && playlist.items[0]) {
      setCurrentTrack(playlist.items[0]);
    }

    if (ytServiceRef.current) {
      if (playlist.youtubeListId) {
        ytServiceRef.current.loadPlaylist(playlist.youtubeListId, 0);
        ytServiceRef.current.play();
      }
    }
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    if (tracks[index]) {
      setCurrentTrack(tracks[index]);
    }
    if (ytServiceRef.current) {
      ytServiceRef.current.playTrackAt(index);
    }
  };

  // Playback Controls
  const handlePlayPause = () => {
    if (!ytServiceRef.current) return;
    if (isPlaying) {
      ytServiceRef.current.pause();
    } else {
      if (!currentTrack && currentPlaylist.youtubeListId) {
        ytServiceRef.current.loadPlaylist(currentPlaylist.youtubeListId, 0);
      }
      ytServiceRef.current.play();
    }
  };

  const handleNextTrack = () => {
    if (ytServiceRef.current) {
      ytServiceRef.current.nextTrack();
    }
  };

  const handlePrevTrack = () => {
    if (ytServiceRef.current) {
      ytServiceRef.current.previousTrack();
    }
  };

  const handleSeek = (seconds: number) => {
    if (ytServiceRef.current) {
      ytServiceRef.current.seekTo(seconds);
      setCurrentTime(seconds);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (ytServiceRef.current) {
      ytServiceRef.current.setVolume(newVolume);
    }
  };

  const handleToggleMute = () => {
    if (!ytServiceRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      ytServiceRef.current.unMute();
    } else {
      setIsMuted(true);
      ytServiceRef.current.mute();
    }
  };

  const handleToggleShuffle = () => {
    const nextShuffle = !isShuffle;
    setIsShuffle(nextShuffle);
    if (ytServiceRef.current) {
      ytServiceRef.current.setShuffle(nextShuffle);
    }
  };

  const handleToggleRepeat = () => {
    const nextRepeat = !isRepeat;
    setIsRepeat(nextRepeat);
    if (ytServiceRef.current) {
      ytServiceRef.current.setLoop(nextRepeat);
    }
  };

  // RENDER SECRET ADMIN DASHBOARD PAGE
  if (isAdminPage) {
    return (
      <AdminPanel
        giftConfig={giftConfig}
        onSaveGiftConfig={handleSaveGiftConfig}
        playlists={allPlaylists}
        onAddPlaylist={handleAddPlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        onBackToViewer={() => {
          window.location.hash = '';
          setIsAdminPage(false);
        }}
      />
    );
  }

  // RENDER CLEAN VISITOR MAIN PAGE
  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-b ${currentTheme.bgGradient} transition-all duration-1000 flex flex-col justify-between relative overflow-x-hidden text-white`}
    >
      {/* Top Bar Header */}
      <TopBar
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        onOpenPlaylistDrawer={() => setIsPlaylistDrawerOpen(true)}
        playlistCount={allPlaylists.length}
      />

      {/* Main Hero Section with BIG Animated Dedication Banner */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <HeroSection
          theme={currentTheme}
          giftConfig={giftConfig}
          currentPlaylistName={currentPlaylist.name}
          isPlaying={isPlaying}
        />
      </main>

      {/* Floating Video Preview Toggle Box */}
      <div className="fixed bottom-24 right-4 sm:right-8 z-30 flex flex-col items-end">
        <button
          onClick={() => setShowVideoPlayer(!showVideoPlayer)}
          className="px-3.5 py-1.5 rounded-full bg-black/50 border border-white/20 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md cursor-pointer transition-all hover:scale-105"
        >
          <Video className="w-3.5 h-3.5 text-pink-400" />
          <span>{showVideoPlayer ? 'Hide Video' : 'View Video'}</span>
          {showVideoPlayer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>

        <div
          className={`mt-2 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black transition-all duration-300 ${
            showVideoPlayer ? 'w-64 sm:w-80 h-36 sm:h-44 opacity-100' : 'w-1 h-1 opacity-0 pointer-events-none'
          }`}
        >
          <div id="yt-player-host" className="w-full h-full"></div>
        </div>
      </div>

      {/* Floating Music Pill Player Dock */}
      <MusicPillPlayer
        theme={currentTheme}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        onPlayPause={handlePlayPause}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onOpenPlaylistDrawer={() => setIsPlaylistDrawerOpen(true)}
      />

      {/* Playlist Drawer */}
      <PlaylistDrawer
        isOpen={isPlaylistDrawerOpen}
        onClose={() => setIsPlaylistDrawerOpen(false)}
        playlists={allPlaylists}
        currentPlaylistId={currentPlaylist.id}
        onSelectPlaylist={handleSelectPlaylist}
        currentTrackIndex={currentTrackIndex}
        currentTracks={tracks}
        onSelectTrack={handleSelectTrack}
      />
    </div>
  );
}

export default App;
