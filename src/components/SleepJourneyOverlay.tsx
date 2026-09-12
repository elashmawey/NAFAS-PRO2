import React, { useState, useEffect, useRef } from 'react';
import { voiceGuide } from '../services/voiceGuide';
import { audioEngine } from '../services/audioEngine';
import { Language } from '../types';
import { Moon, X } from 'lucide-react';

interface SleepJourneyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const SLEEP_JOURNEY_DATA = {
  phases: [
    { t: 0, ar: 'التهيئة والاستقرار', en: 'Settling In' },
    { t: 60, ar: 'مسح الجسد وإسقاط الشد', en: 'Body Scan & Tension Release' },
    { t: 150, ar: 'إيقاع التنفس 4-7-8 للنعاس', en: '4-7-8 Deep Sleep Rhythm' },
    { t: 270, ar: 'ثقل الهدوء والتلاشي', en: 'Sinking In & Fading to Sleep' }
  ],
  lines: [
    { t: 2, ar: 'أغلق عينيك برفق...', en: 'Close your eyes gently...' },
    { t: 8, ar: 'اجعل جسدك يستقر في مكانه دافئاً وآمناً...', en: 'Let your body settle into its place, warm and safe...' },
    { t: 17, ar: 'ليس عليك أن تفعل أي شيء الآن... ليس عليك أن تفكر في أي شيء...', en: 'You do not have to do anything now... you do not have to think about anything...' },
    { t: 28, ar: 'اليوم انتهى بكل ما فيه... وما قادم غداً ينتظر غداً...', en: 'The day is over with all it held... and tomorrow can wait until tomorrow...' },
    { t: 38, ar: 'الآن... هذا الوقت ملك لنفَسك فقط.', en: 'Now... this time belongs to your breath alone.' },
    { t: 62, ar: 'وجه انتباهك برفق إلى عضلات وجهك...', en: 'Gently bring your awareness to the muscles of your face...' },
    { t: 70, ar: 'أرخِ جبهتك... دع حاجبيك يتباعدان...', en: 'Soften your forehead... let your eyebrows drift apart...' },
    { t: 80, ar: 'انتبه إلى الفك... دع الفك السفلي يسترخي قليلاً... ويستقر بعيداً عن الأعلى...', en: 'Notice your jaw... let the lower jaw soften and drop away...' },
    { t: 92, ar: 'دع لسانك يستريح في قاع فمك...', en: 'Let your tongue rest at the base of your mouth...' },
    { t: 102, ar: 'الآن... اترك كتفيك ينزلان إلى الأسفل... بعيداً عن أذنيك...', en: 'Now... let your shoulders slide down, completely away from your ears...' },
    { t: 114, ar: 'كأن كلاً منهما يذوب بدفء داخل فراشك...', en: 'As if each one is melting warmly into your bed...' },
    { t: 125, ar: 'ذراعاك ثقيلتان... يداك مسترخيتان تماماً.', en: 'Your arms are heavy... your hands completely relaxed.' },
    { t: 152, ar: 'الآن سنجعل أنفاسنا هي الدليل الهادئ نحو النوم...', en: 'Now we let the breath be our gentle guide...' },
    { t: 160, ar: 'شهيق هادئ من الأنف... 1... 2... 3... 4...', en: 'Gentle inhale through the nose... 1... 2... 3... 4...' },
    { t: 172, ar: 'احبس النَفَس برفق... 1... 2... 3... 4... 5... 6... 7...', en: 'Hold softly... 1... 2... 3... 4... 5... 6... 7...' },
    { t: 186, ar: 'زفير بطيء ولطيف من الفم... 1... 2... 3... 4... 5... 6... 7... 8...', en: 'Slow, peaceful exhale... 1... 2... 3... 4... 5... 6... 7... 8...' },
    { t: 202, ar: 'شهيق هادئ... 1... 2... 3... 4...', en: 'Gentle inhale... 1... 2... 3... 4...' },
    { t: 214, ar: 'احبس برفق... 1... 2... 3... 4... 5... 6... 7...', en: 'Hold softly... 1... 2... 3... 4... 5... 6... 7...' },
    { t: 228, ar: 'زفير بطيء... 1... 2... 3... 4... 5... 6... 7... 8...', en: 'Slow release... 1... 2... 3... 4... 5... 6... 7... 8...' },
    { t: 245, ar: 'مع كل زفير... يخرج ما تبقى من توتر اليوم...', en: 'With every exhale, all remaining tension leaves your body...' },
    { t: 255, ar: 'ومع كل شهيق... يدخل السكون والسلام إلى صدرك...', en: 'And with every inhale, stillness fills your chest...' },
    { t: 272, ar: 'تشعر الآن بثقل دافئ يسري في ساقيك وقدميك...', en: 'Feel a warm heaviness flowing through your legs and feet...' },
    { t: 285, ar: 'أنفاسك الآن تعود لإيقاعها الطبيعي البطيء... دون أي جهد...', en: 'Your breath returns to its natural, slow rhythm with effortless ease...' },
    { t: 300, ar: 'صدرك يعلو ويهبط كالأمواج الهادئة...', en: 'Your chest rises and falls like gentle waves...' },
    { t: 312, ar: 'أنت آمن... أنت بسلام...', en: 'You are safe... you are at peace...' },
    { t: 324, ar: 'استسلم للنعاس... استسلم للنوم العميق...', en: 'Surrender to rest... surrender to deep sleep...' },
    { t: 335, ar: 'تصبح على خير وسكينة.', en: 'Goodnight, sleep peacefully.' }
  ]
};

const TOTAL_JOURNEY_SECONDS = 360;

export const SleepJourneyOverlay: React.FC<SleepJourneyOverlayProps> = ({ isOpen, onClose, lang }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentLine, setCurrentLine] = useState('');
  const [currentPhase, setCurrentPhase] = useState('');
  const [orbScale, setOrbScale] = useState(0.65);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      voiceGuide.cancel();
      audioEngine.stopTrack('pure432');
      audioEngine.stopTrack('rain');
      return;
    }

    // Start atmospheric sleep soundscape: 432Hz + gentle rain
    audioEngine.toggleTrack('pure432', 40);
    audioEngine.toggleTrack('rain', 50);

    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);

      // Current Phase
      const activePhase = [...SLEEP_JOURNEY_DATA.phases].reverse().find((p) => elapsed >= p.t);
      if (activePhase) {
        setCurrentPhase(lang === 'ar' ? activePhase.ar : activePhase.en);
      }

      // Check for spoken lines matching timestamp
      const line = SLEEP_JOURNEY_DATA.lines.find((l) => l.t === elapsed);
      if (line) {
        const text = lang === 'ar' ? line.ar : line.en;
        setCurrentLine(text);
        voiceGuide.speakText(text, lang, { pitch: 0.8, rate: 0.72 });
      }

      // Orb oscillation during 4-7-8 segment (150s to 270s)
      if (elapsed >= 150 && elapsed <= 270) {
        const cycleSeconds = (elapsed - 150) % 19;
        if (cycleSeconds < 4) {
          // Inhale (4s)
          setOrbScale(0.6 + (cycleSeconds / 4) * 0.4);
        } else if (cycleSeconds < 11) {
          // Hold (7s)
          setOrbScale(1.0);
        } else {
          // Exhale (8s)
          setOrbScale(1.0 - ((cycleSeconds - 11) / 8) * 0.4);
        }
      }

      // Fade soundscape near end
      if (elapsed >= 340) {
        audioEngine.stopTrack('pure432');
        audioEngine.stopTrack('rain');
      }

      if (elapsed >= TOTAL_JOURNEY_SECONDS) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      voiceGuide.cancel();
      audioEngine.stopTrack('pure432');
      audioEngine.stopTrack('rain');
    };
  }, [isOpen, lang]);

  if (!isOpen) return null;

  const progressPct = Math.min(100, (elapsedSeconds / TOTAL_JOURNEY_SECONDS) * 100);

  return (
    <div
      id="sleep-journey-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#040814] text-white transition-opacity duration-1000"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0a1430 0%, #050a1c 55%, #02040c 100%)'
      }}
    >
      {/* Top bar: Phase & Close */}
      <div className="w-full max-w-2xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-[#f2cd96]" />
          <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            {currentPhase}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Exit Journey"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Center Visuals: Sinking Moon & Breathing Orb */}
      <div className="relative flex flex-col items-center justify-center flex-1 w-full max-w-md">
        {/* Luminous Moon */}
        <div
          className="w-20 h-20 rounded-full transition-transform duration-1000"
          style={{
            background: 'radial-gradient(circle at 40% 35%, #fff6df, #e4d3ac 62%, #c8b78d)',
            boxShadow: '0 0 60px 20px rgba(255,240,205,0.35), 0 0 140px 60px rgba(255,240,205,0.1)',
            transform: `translateY(${Math.min(50, elapsedSeconds * 0.15)}px)`
          }}
        />

        {/* 4-7-8 Breathing Orb (active during breath phase) */}
        {elapsedSeconds >= 148 && elapsedSeconds <= 275 && (
          <div
            className="absolute w-44 h-44 rounded-full border border-[#86e6cf]/40 transition-transform duration-1000"
            style={{
              transform: `scale(${orbScale})`,
              background: 'radial-gradient(circle at 35% 30%, rgba(134,230,207,0.35), rgba(126,148,255,0.1) 60%, transparent 80%)',
              boxShadow: '0 0 60px rgba(134,230,207,0.25)'
            }}
          />
        )}

        {/* Guided Voice Over Captions */}
        <div className="mt-14 text-center px-4 min-h-[90px] flex items-center justify-center">
          <p className="text-base sm:text-lg text-slate-100 font-light leading-relaxed drop-shadow-md transition-opacity duration-700">
            {currentLine || (lang === 'ar' ? 'استرخِ تماماً ودع أنفاسك تقودك...' : 'Relax completely and let your breath guide you...')}
          </p>
        </div>
      </div>

      {/* Bottom Progress Indicator */}
      <div className="w-full max-w-md pb-4 z-10">
        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-[#86e6cf] to-[#7e94ff] transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{lang === 'ar' ? 'رحلة النَفَس نحو النوم العميق (6 دقائق)' : 'Deep Sleep Breath Journey (6 min)'}</span>
          <span>{Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
};
