import React, { useState, useEffect } from 'react';
import { audioEngine } from '../services/audioEngine';
import { Language, ProceduralTrackId, SoundTrackInfo } from '../types';
import { Volume2, VolumeX, Moon, X, Sliders, Music } from 'lucide-react';

interface SoundMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const TRACKS_LIST: SoundTrackInfo[] = [
  { id: 'harp', nameKey: 'harp', freqLabel: 'Pentatonic Harmony', isPro: true },
  { id: 'tibetan', nameKey: 'tibetan', freqLabel: '216/432 Hz Bowl', isPro: true },
  { id: 'rain', nameKey: 'rain', freqLabel: 'Acoustic White' },
  { id: 'ocean', nameKey: 'ocean', freqLabel: 'Tidal Swell' },
  { id: 'wind', nameKey: 'wind', freqLabel: 'Forest Gusts' },
  { id: 'brown', nameKey: 'brown', freqLabel: 'Deep Shield' },
  { id: 'om', nameKey: 'om', freqLabel: '136.1 Hz' },
  { id: 'theta', nameKey: 'theta', freqLabel: 'Binaural 6 Hz' },
  { id: 'solfeggio', nameKey: 'solfeggio', freqLabel: '528 Hz Peace' },
  { id: 'fire', nameKey: 'fire', freqLabel: 'Warm Hearth' },
  { id: 'delta', nameKey: 'delta', freqLabel: 'Binaural 2 Hz' },
  { id: 'pure432', nameKey: 'pure432', freqLabel: '432 Hz Pure' }
];

const TRACK_NAMES: Record<string, { ar: string; en: string }> = {
  harp: { ar: 'أنغام قيثارة الهارب الأثيرية', en: 'Ethereal Harp Arpeggios' },
  tibetan: { ar: 'رنين الأوعية التبتية المقدسة', en: 'Tibetan Singing Bowls' },
  rain: { ar: 'مطر هادئ وقطرات واقعية', en: 'Gentle Atmospheric Rain' },
  ocean: { ar: 'أمواج بحر ليلية', en: 'Midnight Ocean Waves' },
  wind: { ar: 'رياح الغابة وحفيف الأشجار', en: 'Whispering Forest Wind' },
  brown: { ar: 'ضجيج بني عازل للأفكار', en: 'Deep Brown Noise Shield' },
  om: { ar: 'رنين أوم الكوني (136.1Hz)', en: 'Cosmic Om Drone (136.1Hz)' },
  theta: { ar: 'موجات ثيتا ثنائية الأذن (6Hz)', en: 'Theta Binaural Waves (6Hz)' },
  solfeggio: { ar: 'تردد السكينة والشفاء (528Hz)', en: 'Solfeggio Harmony (528Hz)' },
  fire: { ar: 'موقد نار دافئ وفرقعة حطب', en: 'Cozy Fireplace Crackle' },
  delta: { ar: 'موجات دلتا للنوم العميق (2Hz)', en: 'Deep Sleep Delta (2Hz)' },
  pure432: { ar: 'رنين نقي متوافق حيوياً (432Hz)', en: 'Pure Biophilic Tone (432Hz)' }
};

export const SoundMixerModal: React.FC<SoundMixerModalProps> = ({ isOpen, onClose, lang }) => {
  const [playingTracks, setPlayingTracks] = useState<Record<ProceduralTrackId, boolean>>({
    harp: false,
    tibetan: false,
    rain: false,
    ocean: false,
    wind: false,
    brown: false,
    om: false,
    theta: false,
    solfeggio: false,
    fire: false,
    delta: false,
    pure432: false
  });

  const [volumes, setVolumes] = useState<Record<ProceduralTrackId, number>>({
    harp: 55,
    tibetan: 50,
    rain: 70,
    ocean: 65,
    wind: 45,
    brown: 60,
    om: 50,
    theta: 45,
    solfeggio: 40,
    fire: 45,
    delta: 35,
    pure432: 40
  });

  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(0);
  const [timerRemaining, setTimerRemaining] = useState<string | null>(null);

  useEffect(() => {
    // Sync current playing state
    const current: Record<string, boolean> = {};
    TRACKS_LIST.forEach((t) => {
      current[t.id] = audioEngine.isTrackPlaying(t.id);
    });
    setPlayingTracks(current as Record<ProceduralTrackId, boolean>);
  }, [isOpen]);

  const handleToggle = (id: ProceduralTrackId) => {
    const isNowPlaying = audioEngine.toggleTrack(id, volumes[id]);
    setPlayingTracks((prev) => ({ ...prev, [id]: isNowPlaying }));
  };

  const handleVolumeChange = (id: ProceduralTrackId, val: number) => {
    setVolumes((prev) => ({ ...prev, [id]: val }));
    audioEngine.setTrackVolume(id, val);
  };

  const handleStopAll = () => {
    audioEngine.stopAllTracks();
    const stopped: Record<string, boolean> = {};
    TRACKS_LIST.forEach((t) => {
      stopped[t.id] = false;
    });
    setPlayingTracks(stopped as Record<ProceduralTrackId, boolean>);
    setSleepTimerMinutes(0);
    setTimerRemaining(null);
  };

  const handleTimerChange = (minutes: number) => {
    setSleepTimerMinutes(minutes);
    if (minutes > 0) {
      setTimerRemaining(lang === 'ar' ? `مؤقت: ${minutes} دقيقة` : `Timer: ${minutes} min`);
      setTimeout(() => {
        handleStopAll();
      }, minutes * 60 * 1000);
    } else {
      setTimerRemaining(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="sound-mixer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d1220]/95 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#86e6cf]/10 text-[#86e6cf] border border-[#86e6cf]/20">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'ar' ? 'خلاط أصوات النوم والموجات الدماغية' : 'Sleep Sounds & Brainwave Mixer'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'أصوات طبيعية وترددات متزامنة مع الأذنين مولدة كودياً بنقاء تام'
                  : 'Procedural zero-bandwidth soundscapes & binaural beats'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {TRACKS_LIST.map((track) => {
            const isPlaying = playingTracks[track.id];
            const name = TRACK_NAMES[track.id] ? (lang === 'ar' ? TRACK_NAMES[track.id].ar : TRACK_NAMES[track.id].en) : track.id;

            return (
              <div
                key={track.id}
                className={`rounded-xl border p-3 transition-all ${
                  isPlaying
                    ? 'border-[#86e6cf]/60 bg-[#86e6cf]/10 shadow-[0_0_15px_rgba(134,230,207,0.1)]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-white block">{name}</span>
                    <span className="text-[10px] text-slate-400">{track.freqLabel}</span>
                  </div>
                  <button
                    onClick={() => handleToggle(track.id)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      isPlaying
                        ? 'bg-[#86e6cf] text-[#060a13]'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {isPlaying ? (lang === 'ar' ? 'إيقاف' : 'Mute') : (lang === 'ar' ? 'تشغيل' : 'Play')}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes[track.id]}
                  onChange={(e) => handleVolumeChange(track.id, parseInt(e.target.value))}
                  className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#86e6cf]"
                />
              </div>
            );
          })}
        </div>

        {/* Bottom controls: Timer and Mute All */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-[#7e94ff]" />
            <span className="text-xs text-slate-300">
              {lang === 'ar' ? 'مؤقت الإيقاف التلقائي للنوم:' : 'Sleep Timer:'}
            </span>
            <select
              value={sleepTimerMinutes}
              onChange={(e) => handleTimerChange(parseInt(e.target.value))}
              className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#86e6cf]"
            >
              <option value="0" className="bg-[#0d1220]">{lang === 'ar' ? 'بدون مؤقت' : 'Off'}</option>
              <option value="15" className="bg-[#0d1220]">{lang === 'ar' ? '15 دقيقة' : '15 min'}</option>
              <option value="30" className="bg-[#0d1220]">{lang === 'ar' ? '30 دقيقة' : '30 min'}</option>
              <option value="45" className="bg-[#0d1220]">{lang === 'ar' ? '45 دقيقة' : '45 min'}</option>
              <option value="60" className="bg-[#0d1220]">{lang === 'ar' ? '60 دقيقة (ساعة)' : '60 min (1 hr)'}</option>
              <option value="120" className="bg-[#0d1220]">{lang === 'ar' ? 'ساعتان' : '2 hours'}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStopAll}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <VolumeX className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'إيقاف الكل' : 'Mute All'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
