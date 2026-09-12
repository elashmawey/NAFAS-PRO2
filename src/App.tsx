import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BreathingPattern, Language, Phase, SceneType } from './types';
import { audioEngine } from './services/audioEngine';
import { voiceGuide } from './services/voiceGuide';
import { healthConnect } from './services/healthConnect';
import { BreathingOrb } from './components/BreathingOrb';
import { SoundMixerModal } from './components/SoundMixerModal';
import { HealthSyncModal } from './components/HealthSyncModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { PulseCheckModal } from './components/PulseCheckModal';
import { InsomniaClinicModal } from './components/InsomniaClinicModal';
import { SleepJourneyOverlay } from './components/SleepJourneyOverlay';
import { CameraBiofeedbackModal } from './components/CameraBiofeedbackModal';
import { LungDetoxModal } from './components/LungDetoxModal';
import { MilestonesModal } from './components/MilestonesModal';
import { SceneSelectorModal } from './components/SceneSelectorModal';
import { SceneBackground } from './components/SceneBackground';
import { streakTracker } from './services/streakTracker';
import {
  Mic,
  Activity,
  Music,
  Moon,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  Camera,
  Heart,
  Globe,
  Vibrate,
  ShieldCheck,
  Play,
  RotateCcw,
  Wind,
  Flame,
  Image as ImageIcon
} from 'lucide-react';

const PATTERNS: Record<string, BreathingPattern> = {
  insomnia: {
    id: 'insomnia',
    nameKey: 'insomnia',
    cycles: 30,
    phases: [
      { k: 'in', s: 4 },
      { k: 'hold', s: 7 },
      { k: 'out', s: 8 }
    ],
    descriptionKey: '4-7-8 deep sleep protocol',
    accentColor: '#f2cd96',
    hue: -125
  },
  calm: {
    id: 'calm',
    nameKey: 'calm',
    cycles: 4,
    phases: [
      { k: 'in', s: 4 },
      { k: 'hold', s: 7 },
      { k: 'out', s: 8 }
    ],
    descriptionKey: 'Sleep & deep calm 4-7-8',
    accentColor: '#86e6cf',
    hue: 0
  },
  box: {
    id: 'box',
    nameKey: 'box',
    cycles: 5,
    phases: [
      { k: 'in', s: 4 },
      { k: 'hold', s: 4 },
      { k: 'out', s: 4 },
      { k: 'hold', s: 4 }
    ],
    descriptionKey: 'Equanimity & focus 4-4-4-4',
    accentColor: '#7e94ff',
    hue: 35
  },
  coherent: {
    id: 'coherent',
    nameKey: 'coherent',
    cycles: 6,
    phases: [
      { k: 'in', s: 5.5 },
      { k: 'out', s: 5.5 }
    ],
    descriptionKey: 'Resonant coherence 5.5-5.5',
    accentColor: '#a7f3d0',
    hue: 95
  },
  sigh: {
    id: 'sigh',
    nameKey: 'sigh',
    cycles: 5,
    phases: [
      { k: 'in', s: 3 },
      { k: 'in', s: 1 },
      { k: 'out', s: 7 }
    ],
    descriptionKey: 'Instant neural reset 3+1-7',
    accentColor: '#f472b6',
    hue: -55
  },
  energy: {
    id: 'energy',
    nameKey: 'energy',
    cycles: 8,
    phases: [
      { k: 'in', s: 5 },
      { k: 'hold', s: 1 },
      { k: 'out', s: 2 }
    ],
    descriptionKey: 'Alertness & oxygen boost 5-1-2',
    accentColor: '#fbbf24',
    hue: -145
  },
  detox_acbt: {
    id: 'detox_acbt',
    nameKey: 'detox_acbt',
    cycles: 6,
    phases: [
      { k: 'in', s: 4 },
      { k: 'hold', s: 3 },
      { k: 'out', s: 5 }
    ],
    descriptionKey: 'ACBT pulmonary mucus clearance 4-3-5',
    accentColor: '#38bdf8',
    hue: 195
  },
  pursed_lip: {
    id: 'pursed_lip',
    nameKey: 'pursed_lip',
    cycles: 8,
    phases: [
      { k: 'in', s: 2 },
      { k: 'out', s: 5 }
    ],
    descriptionKey: 'Pursed-lip airway backpressure 2-5',
    accentColor: '#2dd4bf',
    hue: 175
  }
};

const PATTERN_TITLES: Record<string, { ar: string; en: string; badge: string }> = {
  detox_acbt: { ar: 'تنقية الرئة والبلغم', en: 'Lung Detox & Mucus', badge: '4·3·5 ×6' },
  pursed_lip: { ar: 'الشفاه المضمومة للمدخنين', en: 'Pursed-Lip', badge: '2·5 ×8' },
  insomnia: { ar: 'طرد الأرق', en: 'Insomnia Relief', badge: '4·7·8 ×30' },
  calm: { ar: 'هدوء وسكينة', en: 'Deep Calm', badge: '4·7·8 ×4' },
  box: { ar: 'توازن وتركيز', en: 'Box Focus', badge: '4·4·4·4 ×5' },
  coherent: { ar: 'تناغم القلب', en: 'Heart Coherence', badge: '5.5·5.5 ×6' },
  sigh: { ar: 'تنهيدة فسيولوجية', en: 'Physiological Sigh', badge: '3+1·7 ×5' },
  energy: { ar: 'طاقة ويقظة', en: 'Morning Energy', badge: '5·1·2 ×8' }
};

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [currentPatternId, setCurrentPatternId] = useState<string>('calm');
  const [appState, setAppState] = useState<'idle' | 'in' | 'hold' | 'out' | 'paused' | 'done'>('idle');
  const [phaseProgress, setPhaseProgress] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(4);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [orbScale, setOrbScale] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHaptic, setIsHaptic] = useState<boolean>(true);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [scene, setScene] = useState<SceneType>('default');
  const [todayBreaths, setTodayBreaths] = useState<number>(0);

  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isMixerModalOpen, setIsMixerModalOpen] = useState(false);
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);
  const [isInsomniaModalOpen, setIsInsomniaModalOpen] = useState(false);
  const [isLungModalOpen, setIsLungModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isSleepJourneyOpen, setIsSleepJourneyOpen] = useState(false);
  const [isMilestonesModalOpen, setIsMilestonesModalOpen] = useState(false);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  const [streakStats, setStreakStats] = useState(streakTracker.getStats());
  const [healthSyncToast, setHealthSyncToast] = useState<string | null>(null);

  // Animation & Timing refs
  const pattern = PATTERNS[currentPatternId] || PATTERNS.calm;
  const phaseIndexRef = useRef<number>(0);
  const phaseTimerRef = useRef<number>(0);
  const cycleCountRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Update HTML dir and lang
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Read saved today breaths count
  useEffect(() => {
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem('nafas_today_breaths_' + todayKey);
      if (saved) setTodayBreaths(parseInt(saved, 10));
    } catch {}
  }, []);

  const triggerHaptic = useCallback(
    (patternArr: number[]) => {
      if (isHaptic && 'vibrate' in navigator) {
        try {
          navigator.vibrate(patternArr);
        } catch {}
      }
    },
    [isHaptic]
  );

  // Phase change cues: Human Voice + Tone + Haptics
  const cuePhase = useCallback(
    (ph: Phase) => {
      // 1. Spoken Human Voice guidance
      voiceGuide.speakPhasePrompt(ph.k, lang);

      // 2. Harmonic audio chimes
      if (ph.k === 'in') {
        audioEngine.playCueTone(220, 330, ph.s * 0.9);
        triggerHaptic([45, 50, 45]);
      } else if (ph.k === 'out') {
        audioEngine.playCueTone(330, 196, ph.s * 0.9);
        triggerHaptic([75]);
      } else {
        audioEngine.playCueTone(261.63, 261.63, 0.7);
        triggerHaptic([35]);
      }

      // 3. Periodic mindful body reminder (e.g. every 2 cycles)
      if (ph.k === 'in' && cycleCountRef.current > 0 && cycleCountRef.current % 2 === 0) {
        setTimeout(() => {
          voiceGuide.speakMindfulReminder(lang);
        }, 1200);
      }
    },
    [lang, triggerHaptic]
  );

  const finishSession = useCallback(() => {
    setAppState('done');
    audioEngine.playCompletionHarmonic();
    triggerHaptic([80, 50, 100, 50, 150]);

    const sessionDurationSeconds = Math.max(15, Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));
    const completedBreaths = cycleCountRef.current + 1;

    // Automatic Apple Health & Google Health Connect sync!
    const recorded = healthConnect.recordSession({
      durationSeconds: sessionDurationSeconds,
      breathsCount: completedBreaths,
      patternId: pattern.id,
      patternName: pattern.id.toUpperCase() + ' Breathing'
    });

    // Record Streak and Milestones
    const { newlyUnlockedBadge } = streakTracker.recordSession(recorded.durationMinutes, pattern.id);
    setStreakStats(streakTracker.getStats());

    // Update local counter
    const newTotal = todayBreaths + completedBreaths;
    setTodayBreaths(newTotal);
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem('nafas_today_breaths_' + todayKey, String(newTotal));
    } catch {}

    // Show Health & Streak Sync Confirmation Toast
    const badgeNotice = newlyUnlockedBadge
      ? (lang === 'ar' ? ` 🏆 وسام جديد: ${newlyUnlockedBadge.title.ar}!` : ` 🏆 New Badge: ${newlyUnlockedBadge.title.en}!`)
      : '';
    setHealthSyncToast(
      lang === 'ar'
        ? `✓ تم تسجيل ${recorded.durationMinutes} دقيقة يقظة ومزامنتها مع Apple Health!${badgeNotice}`
        : `✓ Synced ${recorded.durationMinutes} mindful minutes to Apple Health!${badgeNotice}`
    );
    setTimeout(() => setHealthSyncToast(null), 5500);

    setTimeout(() => {
      setAppState('idle');
      setOrbScale(0.8);
    }, 2800);
  }, [todayBreaths, pattern, lang, triggerHaptic]);

  // Main Breathing Animation Tick
  const tick = useCallback(
    (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min(50, now - lastTimeRef.current);
      lastTimeRef.current = now;

      if (appState === 'in' || appState === 'hold' || appState === 'out') {
        phaseTimerRef.current += dt / 1000;
        const ph = pattern.phases[phaseIndexRef.current];

        if (phaseTimerRef.current >= ph.s) {
          phaseTimerRef.current -= ph.s;
          phaseIndexRef.current++;

          if (phaseIndexRef.current >= pattern.phases.length) {
            phaseIndexRef.current = 0;
            cycleCountRef.current++;
            setCurrentCycle(cycleCountRef.current);

            if (cycleCountRef.current >= pattern.cycles) {
              finishSession();
              return;
            }
          }

          const nextPhase = pattern.phases[phaseIndexRef.current];
          setAppState(nextPhase.k);
          cuePhase(nextPhase);
        }

        const currentPh = pattern.phases[phaseIndexRef.current];
        const progress = Math.min(1, phaseTimerRef.current / currentPh.s);
        setPhaseProgress(progress);
        setRemainingSeconds(Math.ceil(currentPh.s - phaseTimerRef.current));

        // Ease in out orb scaling
        const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
        if (currentPh.k === 'in') {
          setOrbScale(0.65 + 0.35 * ease);
        } else if (currentPh.k === 'out') {
          setOrbScale(1.0 - 0.35 * ease);
        } else {
          setOrbScale(1.0 + 0.02 * Math.sin(progress * Math.PI));
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    },
    [appState, pattern, cuePhase, finishSession]
  );

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [tick]);

  const toggleBreathing = () => {
    if (appState === 'idle' || appState === 'done') {
      phaseIndexRef.current = 0;
      phaseTimerRef.current = 0;
      cycleCountRef.current = 0;
      sessionStartTimeRef.current = Date.now();
      setCurrentCycle(0);
      const firstPhase = pattern.phases[0];
      setAppState(firstPhase.k);
      cuePhase(firstPhase);
    } else if (appState === 'paused') {
      const currentPh = pattern.phases[phaseIndexRef.current];
      setAppState(currentPh.k);
      cuePhase(currentPh);
    } else {
      setAppState('paused');
      voiceGuide.cancel();
    }
  };

  const selectPattern = (id: string) => {
    if (id === currentPatternId) return;
    setAppState('idle');
    setOrbScale(0.8);
    voiceGuide.cancel();
    setCurrentPatternId(id);
    setCurrentCycle(0);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.setMuted(next);
  };

  const toggleHaptic = () => {
    setIsHaptic(!isHaptic);
    if (!isHaptic && 'vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch {}
    }
  };

  const weeklyMindfulMinutes = healthConnect.getWeeklyMinutes();

  return (
    <div
      className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden ${
        isNightMode ? 'bg-[#020408]' : 'bg-[#060a13]'
      }`}
    >
      {/* Dynamic Procedural Background & Stars */}
      <SceneBackground scene={scene} accentHue={pattern.hue} />

      {/* Top Navigation & Controls */}
      <header className="relative z-10 w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-[#060a13]/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              نَفَس<span className="text-[#86e6cf]">.</span>
            </span>
            <span className="hidden sm:inline-block rounded-full bg-[#86e6cf]/10 border border-[#86e6cf]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#86e6cf]">
              {lang === 'ar' ? 'صوت بشري + Health Connect' : 'Human Voice + HealthKit'}
            </span>
          </div>
        </div>

        {/* Quick Tools Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Daily Streak & Milestones Button */}
          <button
            onClick={() => setIsMilestonesModalOpen(true)}
            title={lang === 'ar' ? 'سلسلة الأيام المتتالية والأوسمة' : 'Daily Streak & Badges'}
            className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>
              {streakStats.currentStreak} {lang === 'ar' ? 'يوم' : 'd'}
            </span>
          </button>

          {/* Lung Detox Clinic Button */}
          <button
            onClick={() => setIsLungModalOpen(true)}
            title={lang === 'ar' ? 'عيادة تنقية الرئة ومجرى التنفّس للمدخنين' : 'Pulmonary Detox & Smoker Clinic'}
            className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          >
            <Wind className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden lg:inline">{lang === 'ar' ? 'تنقية الرئة' : 'Lung Detox'}</span>
          </button>

          {/* Human Voice Over Settings Button */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            title={lang === 'ar' ? 'صوت بشري دافئ وتوجيه صوتي' : 'Human Voice & Audio Guidance'}
            className="flex items-center gap-1.5 rounded-full border border-[#86e6cf]/30 bg-[#86e6cf]/10 px-3 py-1.5 text-xs font-bold text-[#86e6cf] hover:bg-[#86e6cf]/20 transition-all shadow-[0_0_12px_rgba(134,230,207,0.15)]"
          >
            <Mic className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{lang === 'ar' ? 'صوت بشري دافئ' : 'Human Voice'}</span>
          </button>

          {/* Apple Health & Google Health Connect Sync Button */}
          <button
            onClick={() => setIsHealthModalOpen(true)}
            title={lang === 'ar' ? 'تكامل Apple Health & Google Health Connect' : 'Apple Health & Health Connect'}
            className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all"
          >
            <Activity className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden md:inline">
              {weeklyMindfulMinutes} {lang === 'ar' ? 'دقيقة صحة' : 'min'}
            </span>
          </button>

          {/* Sleep Sound Mixer */}
          <button
            onClick={() => setIsMixerModalOpen(true)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            title={lang === 'ar' ? 'خلاط أصوات النوم والموسيقى الأثيرية' : 'Ambient Music & Sound Mixer'}
          >
            <Music className="h-4 w-4" />
          </button>

          {/* Scene Background Studio */}
          <button
            onClick={() => setIsSceneModalOpen(true)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            title={lang === 'ar' ? 'استوديو المشاهد البصرية' : 'Visual Scenes Studio'}
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          {/* Pulse Tap Check */}
          <button
            onClick={() => setIsPulseModalOpen(true)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            title={lang === 'ar' ? 'فاحص النبض' : 'Pulse Check'}
          >
            <Heart className="h-4 w-4" />
          </button>

          {/* Camera Biofeedback */}
          <button
            onClick={() => setIsCameraModalOpen(true)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            title={lang === 'ar' ? 'مراقبة التنفس بالكاميرا' : 'Camera Biofeedback'}
          >
            <Camera className="h-4 w-4" />
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`rounded-full border p-2 transition-all ${
              isMuted
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Night Mode */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`rounded-full border p-2 transition-all ${
              isNightMode
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
            }`}
            title={lang === 'ar' ? 'وضع النوم الليلي' : 'Night Mode'}
          >
            <Moon className="h-4 w-4" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-white hover:bg-white/10 transition-all"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-4xl mx-auto w-full">
        {/* Health Sync Alert Toast */}
        {healthSyncToast && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 backdrop-blur-md px-4 py-2.5 text-xs text-emerald-200 shadow-xl transition-all animate-bounce">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{healthSyncToast}</span>
          </div>
        )}

        {/* Hero Intent Selection Cards */}
        <div className="w-full max-w-xl mb-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">
            {lang === 'ar' ? 'ماذا تحتاج في هذه اللحظة؟' : 'What do you need right now?'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <button
              onClick={() => {
                selectPattern('insomnia');
                setIsInsomniaModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/15 transition-all"
            >
              <span>😴</span>
              <span>{lang === 'ar' ? 'أريد النوم' : 'Need Sleep'}</span>
            </button>
            <button
              onClick={() => {
                selectPattern('detox_acbt');
                setIsLungModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)] col-span-2 sm:col-span-1"
            >
              <span>🫁</span>
              <span>{lang === 'ar' ? 'تنظيف الرئة' : 'Lung Detox'}</span>
            </button>
            <button
              onClick={() => selectPattern('calm')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#86e6cf]/20 bg-[#86e6cf]/5 p-2.5 text-xs font-semibold text-[#86e6cf] hover:bg-[#86e6cf]/15 transition-all"
            >
              <span>😌</span>
              <span>{lang === 'ar' ? 'أريد أن أهدأ' : 'Need Calm'}</span>
            </button>
            <button
              onClick={() => selectPattern('box')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#7e94ff]/20 bg-[#7e94ff]/5 p-2.5 text-xs font-semibold text-[#7e94ff] hover:bg-[#7e94ff]/15 transition-all"
            >
              <span>🧠</span>
              <span>{lang === 'ar' ? 'أريد التركيز' : 'Focus'}</span>
            </button>
            <button
              onClick={() => selectPattern('coherent')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/15 transition-all"
            >
              <span>🌿</span>
              <span>{lang === 'ar' ? 'استرخاء متزن' : 'Relax'}</span>
            </button>
          </div>
        </div>

        {/* The Core Breathing Orb */}
        <div className="my-2 flex flex-col items-center justify-center">
          <BreathingOrb
            phase={appState}
            phaseProgress={phaseProgress}
            remainingSeconds={remainingSeconds}
            scale={orbScale}
            lang={lang}
            onToggle={toggleBreathing}
            accentHue={pattern.hue}
          />

          {/* Cycle & Status Info */}
          <div className="mt-4 flex flex-col items-center text-center">
            {appState !== 'idle' && appState !== 'done' && (
              <span className="text-xs font-medium text-slate-400 font-mono">
                {lang === 'ar'
                  ? `نفَسة ${currentCycle + 1} من ${pattern.cycles}`
                  : `Breath ${currentCycle + 1} of ${pattern.cycles}`}
              </span>
            )}
            <p className="mt-1 text-xs text-slate-300 font-light max-w-sm">
              {pattern.descriptionKey}
            </p>
          </div>
        </div>

        {/* Pattern Chips Selector */}
        <div className="w-full max-w-2xl mt-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Object.keys(PATTERNS).map((k) => {
              const p = PATTERNS[k];
              const titleObj = PATTERN_TITLES[k];
              const isSelected = currentPatternId === k;

              return (
                <button
                  key={k}
                  onClick={() => selectPattern(k)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? 'border border-[#86e6cf] bg-[#86e6cf]/15 text-[#86e6cf] shadow-[0_0_15px_rgba(134,230,207,0.2)]'
                      : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{lang === 'ar' ? titleObj.ar : titleObj.en}</span>
                  <span className="text-[10.5px] opacity-60 font-mono">{titleObj.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Launch Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => setIsSleepJourneyOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 px-4 py-2 text-xs font-bold text-amber-200 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,192,86,0.2)] transition-all"
          >
            <Moon className="h-4 w-4 text-amber-300" />
            <span>
              {lang === 'ar'
                ? '🎧 رحلة النَفَس نحو النوم العميق (٦ دقائق)'
                : '🎧 Guided Deep Sleep Journey (6 Min)'}
            </span>
          </button>

          <button
            onClick={() => setIsLungModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-cyan-500/20 to-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-200 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
          >
            <Wind className="h-4 w-4 text-cyan-400" />
            <span>
              {lang === 'ar'
                ? '🫁 تنقية الرئة وإذابة البلغم للمدخنين (ACBT)'
                : '🫁 Smoker Lung Detox & Mucus (ACBT)'}
            </span>
          </button>
        </div>
      </main>

      {/* Footer & Health Status Bar */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#060a13]/60 backdrop-blur-md px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[#86e6cf]" />
            <span>
              {todayBreaths} {lang === 'ar' ? 'نَفَسة اليوم' : 'breaths today'}
            </span>
          </div>
          <span className="text-white/20">·</span>
          <div
            onClick={() => setIsHealthModalOpen(true)}
            className="cursor-pointer flex items-center gap-1.5 text-slate-300 hover:text-[#86e6cf] transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {lang === 'ar'
                ? 'Apple Health & Google Health Connect متزامنان'
                : 'Apple Health & Health Connect Ready'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" />
          <span>{lang === 'ar' ? 'خصوصيتك أولاً · معالجة محلية' : 'Zero Tracking · Local Health Data'}</span>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        lang={lang}
      />

      <HealthSyncModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        lang={lang}
      />

      <SoundMixerModal
        isOpen={isMixerModalOpen}
        onClose={() => setIsMixerModalOpen(false)}
        lang={lang}
      />

      <PulseCheckModal
        isOpen={isPulseModalOpen}
        onClose={() => setIsPulseModalOpen(false)}
        lang={lang}
        onSaveAndStart={(suggested, bpm) => {
          selectPattern(suggested);
          toggleBreathing();
        }}
      />

      <InsomniaClinicModal
        isOpen={isInsomniaModalOpen}
        onClose={() => setIsInsomniaModalOpen(false)}
        lang={lang}
        onStart478={() => {
          selectPattern('insomnia');
          toggleBreathing();
        }}
        onStartSleepJourney={() => setIsSleepJourneyOpen(true)}
      />

      <CameraBiofeedbackModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        lang={lang}
      />

      <SleepJourneyOverlay
        isOpen={isSleepJourneyOpen}
        onClose={() => setIsSleepJourneyOpen(false)}
        lang={lang}
      />

      <LungDetoxModal
        isOpen={isLungModalOpen}
        onClose={() => setIsLungModalOpen(false)}
        lang={lang}
        onStartInMainOrb={(patternId) => {
          selectPattern(patternId);
          toggleBreathing();
        }}
      />

      <MilestonesModal
        isOpen={isMilestonesModalOpen}
        onClose={() => setIsMilestonesModalOpen(false)}
        lang={lang}
      />

      <SceneSelectorModal
        isOpen={isSceneModalOpen}
        onClose={() => setIsSceneModalOpen(false)}
        currentScene={scene}
        onSelectScene={(newScene) => setScene(newScene)}
        lang={lang}
      />
    </div>
  );
}
