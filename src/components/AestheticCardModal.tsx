import React, { useState, useRef } from 'react';
import { Language, SceneType } from '../types';
import { X, Share2, Download, Sparkles, RefreshCw, Heart, Check, Wind } from 'lucide-react';

import auroraImg from '../assets/images/aurora_night_sky_1789253960058.jpg';
import moonlakeImg from '../assets/images/moonlit_calm_lake_1789253973431.jpg';
import forestImg from '../assets/images/misty_pine_forest_1789253984169.jpg';
import oceanImg from '../assets/images/midnight_ocean_waves_1789253996219.jpg';
import mountainsImg from '../assets/images/dusk_mountain_peaks_1789254006724.jpg';

interface AestheticCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentScene: SceneType;
  patternTitle: string;
  durationMinutes?: number;
  breathsCount?: number;
}

const QUOTES = [
  {
    ar: 'النَفَس العميق هو أقصر جسر بين العقل الهائج والروح الهادئة.',
    en: 'A deep breath is the shortest bridge between a chaotic mind and a peaceful soul.'
  },
  {
    ar: 'في كل زفير هادئ... مساحة جديدة للسلام الداخلي.',
    en: 'In every slow exhale, a new space for inner stillness unfolds.'
  },
  {
    ar: 'هدوءك الداخلي هو أعظم قوة في عالم صاخب متسارع.',
    en: 'Your inner tranquility is your greatest power in a restless world.'
  },
  {
    ar: 'تنفس بعمق، ودع كل ما لا يخدم سلامك يرحل.',
    en: 'Breathe deeply, and gently release whatever no longer serves your peace.'
  },
  {
    ar: 'بين الشهيق والزفير، تكمن لحظة ولادتك من جديد.',
    en: 'Between the inhale and exhale lies the sacred pause of rebirth.'
  }
];

const SCENE_IMAGES: Record<string, string> = {
  default: auroraImg,
  ocean: oceanImg,
  desert: mountainsImg,
  mountains: mountainsImg,
  forest: forestImg,
  moonlake: moonlakeImg
};

export const AestheticCardModal: React.FC<AestheticCardModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentScene,
  patternTitle,
  durationMinutes = 5,
  breathsCount = 28
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const quote = QUOTES[quoteIndex];
  const bgImage = SCENE_IMAGES[currentScene] || auroraImg;

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  };

  const handleShare = async () => {
    const text =
      lang === 'ar'
        ? `✨ لحظة سكينة مع تطبيق نَفَس\nجلسة: ${patternTitle}\n"${quote.ar}"\n🫁 جرب هدوء التنفس الآن!`
        : `✨ A mindful moment on Nafas App\nSession: ${patternTitle}\n"${quote.en}"\n🫁 Breathe deeply!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'بطاقة سكينة - تطبيق نَفَس',
          text
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      id="aesthetic-card-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-[#0b0f1a] p-5 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full p-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-3">
          <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400">
            {lang === 'ar' ? 'بطاقة الهدوء للستوري 📸' : 'ZEN STORY CARD 📸'}
          </span>
        </div>

        {/* Story Card Container (9:16 proportion feel) */}
        <div
          ref={cardRef}
          className="relative w-full aspect-[9/14] rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between p-6 select-none"
        >
          {/* Background Image & Cinematic Overlays */}
          <img
            src={bgImage}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/85" />
          <div className="absolute inset-0 bg-radial from-transparent to-black/60" />

          {/* Card Top: Brand Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-[#86e6cf]">
                <Wind className="h-4 w-4" />
              </div>
              <span className="text-xs font-black tracking-wider text-white">نَفَس · NAFAS</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-300 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15">
              {patternTitle}
            </span>
          </div>

          {/* Card Center: Philosophical Quote */}
          <div className="relative z-10 my-auto text-center px-2">
            <div className="inline-block mb-3 text-cyan-300">
              <Sparkles className="h-6 w-6 mx-auto opacity-80 animate-pulse" />
            </div>
            <p className="text-base sm:text-lg font-medium text-white/95 leading-relaxed drop-shadow-md">
              "{lang === 'ar' ? quote.ar : quote.en}"
            </p>
          </div>

          {/* Card Bottom: Mindful Metrics */}
          <div className="relative z-10 pt-4 border-t border-white/15">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-black/40 backdrop-blur-md p-2 border border-white/10">
                <span className="text-[9px] text-slate-300 block">
                  {lang === 'ar' ? 'السكينة' : 'Stillness'}
                </span>
                <span className="text-sm font-black text-emerald-400">
                  {durationMinutes} {lang === 'ar' ? 'د' : 'm'}
                </span>
              </div>

              <div className="rounded-xl bg-black/40 backdrop-blur-md p-2 border border-white/10">
                <span className="text-[9px] text-slate-300 block">
                  {lang === 'ar' ? 'الأنفاس' : 'Breaths'}
                </span>
                <span className="text-sm font-black text-cyan-300">{breathsCount}</span>
              </div>

              <div className="rounded-xl bg-black/40 backdrop-blur-md p-2 border border-white/10">
                <span className="text-[9px] text-slate-300 block">
                  {lang === 'ar' ? 'معدل الهدوء' : 'Zen Score'}
                </span>
                <span className="text-sm font-black text-purple-300">96%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Controls below card */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={handleNextQuote}
            className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
            title={lang === 'ar' ? 'تغيير الاقتباس' : 'Shuffle Quote'}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{lang === 'ar' ? 'اقتباس آخر' : 'Shuffle'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>{lang === 'ar' ? 'مشاركة في الستوري 📸' : 'Share to Story 📸'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
