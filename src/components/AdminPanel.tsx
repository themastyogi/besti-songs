import React, { useState } from 'react';
import { Gift, Plus, Trash2, Video, Sparkles, ArrowLeft, Save, Check, Music, MessageSquare, Link, Copy } from 'lucide-react';
import type { GiftConfig, Playlist } from '../types';
import { GIRL_TAGLINES } from '../presets';

interface AdminPanelProps {
  giftConfig: GiftConfig;
  onSaveGiftConfig: (newConfig: GiftConfig) => void;
  playlists: Playlist[];
  onAddPlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onBackToViewer: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  giftConfig,
  onSaveGiftConfig,
  playlists,
  onAddPlaylist,
  onDeletePlaylist,
  onBackToViewer,
}) => {
  const [activeTab, setActiveTab] = useState<'gift' | 'playlists' | 'quotes'>('gift');

  // Gift Config Form State
  const [friendName, setFriendName] = useState<string>(giftConfig.friendName);
  const [hindiTitle, setHindiTitle] = useState<string>(giftConfig.hindiTitle);
  const [customTitle, setCustomTitle] = useState<string>(giftConfig.customTitle);
  const [message, setMessage] = useState<string>(giftConfig.message);
  const [tagline, setTagline] = useState<string>(giftConfig.tagline);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedLinkSuccess, setCopiedLinkSuccess] = useState<boolean>(false);

  // Add Playlist Form State
  const [urlInput, setUrlInput] = useState<string>('');
  const [playlistTitle, setPlaylistTitle] = useState<string>('');
  const [playlistDesc, setPlaylistDesc] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('🌸');
  const [playlistError, setPlaylistError] = useState<string>('');

  // Quotes State
  const [quotesList, setQuotesList] = useState<string[]>(GIRL_TAGLINES);
  const [newQuote, setNewQuote] = useState<string>('');

  const EMOJI_OPTIONS = ['🌸', '💖', '🎀', '✨', '⚡', '🚛', '🌌', '🌶️', '🎶', '🔥', '🍯', '👑'];

  // Handle Save Gift Configuration
  const handleSaveGift = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGiftConfig({
      friendName: friendName.trim() || 'My Bestie 🌸',
      hindiTitle: hindiTitle.trim() || 'मेरी पसंदीदा',
      customTitle: customTitle.trim() || 'Music',
      message: message.trim() || 'Crafted with love.',
      tagline: tagline.trim() || 'Drive Safe, Sparkle Always ✨',
      isGiftMode: true,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Copy Direct Shareable Visitor Link with custom name & note
  const handleCopyVisitorLink = () => {
    const origin = window.location.origin + window.location.pathname;
    const shareUrl = `${origin}?to=${encodeURIComponent(friendName)}&msg=${encodeURIComponent(message)}&title=${encodeURIComponent(customTitle)}&hindi=${encodeURIComponent(hindiTitle)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLinkSuccess(true);
      setTimeout(() => setCopiedLinkSuccess(false), 4000);
    });
  };

  // Handle Add YouTube Playlist
  const handleAddPlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPlaylistError('');

    const input = urlInput.trim();
    if (!input) {
      setPlaylistError('Please paste a YouTube playlist link or playlist ID.');
      return;
    }

    let listId = '';
    if (input.includes('list=')) {
      const match = input.match(/list=([a-zA-Z0-9_-]+)/);
      if (match) listId = match[1];
    } else if (input.length >= 8) {
      listId = input;
    }

    if (!listId) {
      setPlaylistError('Invalid YouTube playlist URL or ID.');
      return;
    }

    const newPlaylistItem: Playlist = {
      id: `custom-${Date.now()}`,
      name: playlistTitle.trim() || 'Custom Playlist',
      description: playlistDesc.trim() || 'Added via Admin Panel',
      category: 'custom',
      icon: selectedIcon,
      youtubeListId: listId,
      isCustom: true,
    };

    onAddPlaylist(newPlaylistItem);
    setUrlInput('');
    setPlaylistTitle('');
    setPlaylistDesc('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Handle Add New Quote
  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.trim()) return;
    setQuotesList([newQuote.trim(), ...quotesList]);
    setNewQuote('');
  };

  const handleDeleteQuote = (index: number) => {
    setQuotesList(quotesList.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#160b1e] via-[#24102c] to-[#0c0612] text-white p-4 sm:p-8 flex flex-col items-center select-none font-outfit">
      {/* Admin Panel Header */}
      <div className="w-full max-w-4xl flex items-center justify-between py-4 mb-6 border-b border-white/10">
        <button
          onClick={onBackToViewer}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-pink-300" />
          <span>View Site as Visitor</span>
        </button>

        <div className="flex items-center gap-2 text-pink-300">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <h1 className="text-lg sm:text-xl font-bold tracking-wide">Secret Admin Dashboard</h1>
        </div>
      </div>

      {/* Main Admin Box */}
      <div className="w-full max-w-4xl glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        {/* Navigation Tabs */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 mb-8">
          <button
            onClick={() => setActiveTab('gift')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'gift'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Dedicated Gift & Titles</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'playlists'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>YouTube Playlists ({playlists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'quotes'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Shayaris & Quotes</span>
          </button>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>Changes saved successfully! Your local view is updated.</span>
          </div>
        )}

        {/* Copied Link Success Alert */}
        {copiedLinkSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-pink-500/20 border border-pink-500/40 text-pink-200 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
            <Copy className="w-5 h-5 text-pink-400" />
            <span>Customized visitor link copied to clipboard! Share this link with your friend.</span>
          </div>
        )}

        {/* TAB 1: GIFT CONFIGURATION */}
        {activeTab === 'gift' && (
          <form onSubmit={handleSaveGift} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-2">
                Friend's Name (Hero Dedicated Banner)
              </label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="e.g. Simran ✨"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 focus:border-pink-400 focus:outline-none text-sm text-white placeholder-white/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                  Hindi Header Title
                </label>
                <input
                  type="text"
                  value={hindiTitle}
                  onChange={(e) => setHindiTitle(e.target.value)}
                  placeholder="e.g. मेरी पसंदीदा"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 focus:border-pink-400 focus:outline-none text-sm text-white placeholder-white/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                  English Sub-Header
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Music / Playlist"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 focus:border-pink-400 focus:outline-none text-sm text-white placeholder-white/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                Dedicated Gift Note / Message
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a sweet message for your friend..."
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 focus:border-pink-400 focus:outline-none text-sm text-white placeholder-white/40 resize-none"
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyVisitorLink}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-semibold text-pink-200 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Link className="w-4 h-4 text-pink-300" />
                <span>Copy Customized Visitor Link for Bestie</span>
              </button>

              <button
                type="submit"
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 font-bold text-sm text-white shadow-xl shadow-pink-500/30 flex items-center gap-2 cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Locally</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: YOUTUBE PLAYLISTS */}
        {activeTab === 'playlists' && (
          <div className="space-y-6">
            <form onSubmit={handleAddPlaylistSubmit} className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-pink-300 flex items-center gap-2">
                <Plus className="w-4 h-4 text-pink-400" />
                <span>Add YouTube Playlist</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  YouTube Playlist Link or ID
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=PLgObA3p..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-pink-400 focus:outline-none text-xs text-white placeholder-white/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Playlist Title
                  </label>
                  <input
                    type="text"
                    value={playlistTitle}
                    onChange={(e) => setPlaylistTitle(e.target.value)}
                    placeholder="e.g. Simran's Favorites 🎀"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-pink-400 focus:outline-none text-xs text-white placeholder-white/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Icon Emoji
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setSelectedIcon(emoji)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                          selectedIcon === emoji
                            ? 'bg-pink-500/40 border border-pink-400 scale-110'
                            : 'bg-white/5 border border-white/10 hover:bg-white/15'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {playlistError && (
                <p className="text-xs text-rose-400 font-semibold">{playlistError}</p>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-xs font-bold text-white shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Playlist</span>
              </button>
            </form>

            <div>
              <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-3">
                Current Playlists ({playlists.length})
              </h4>

              <div className="space-y-2.5">
                {playlists.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-black/40 border border-white/10">
                        {p.icon}
                      </span>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-white">{p.name}</h5>
                        <p className="text-[11px] text-white/60">{p.description}</p>
                      </div>
                    </div>

                    {p.isCustom && (
                      <button
                        onClick={() => onDeletePlaylist(p.id)}
                        className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors cursor-pointer"
                        title="Delete Playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUOTES & SHAYARIS */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <form onSubmit={handleAddQuote} className="flex gap-2">
              <input
                type="text"
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                placeholder="Add a new quote or shayari..."
                className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/15 focus:border-pink-400 focus:outline-none text-sm text-white placeholder-white/40"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-xs font-bold text-white shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Quote</span>
              </button>
            </form>

            <div className="space-y-2">
              {quotesList.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs sm:text-sm text-white/90"
                >
                  <span className="italic">"{q}"</span>
                  <button
                    onClick={() => handleDeleteQuote(idx)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
