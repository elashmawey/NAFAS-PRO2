import React from 'react';
import { SceneType, Language } from '../types';
import { Sparkles, X, Image as ImageIcon, Check } from 'lucide-react';

import auroraImg from '../assets/images/aurora_night_sky_1789253960058.jpg';
import moonlakeImg from '../assets/images/moonlit_calm_lake_1789253973431.jpg';
import forestImg from '../assets/images/misty_pine_forest_1789253984169.jpg';
import oceanImg from '../assets/images/midnight_ocean_waves_1789253996219.jpg';
import mountainsImg from '../assets/images/dusk_mountain_peaks_1789254006724.jpg';

interface SceneSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScene: SceneType;
  onSelectScene: (scene: SceneType) => void;
  lang: Language;
}

interface SceneOption {
  id: SceneType;
  title: { ar: string; en: string };
  desc: { ar: string; en: string };
  emoji: string;
  gradient: string;
  image?: string;
}

const SCENE_OPTIONS: SceneOption[] = [
  {
    id: 'default',
    title: { ar: 'أورورا الشفق القطبي', en: 'Polar Aurora' },
    desc: { ar: 'توهجات سماوية ملونة مع وميض نجوم وشهب ليلية', en: 'Dancing celestial auroras with drifting meteors' },
    emoji: '🌌',
    gradient: 'from-cyan-950 via-slate-900 to-emerald-950',
    image: auroraImg
  },
  {
    id: 'moonlake',
    title: { ar: 'بحيرة القمر الفضي', en: 'Moonlit Lake' },
    desc: { ar: 'قمر مشع يعكس نوره على مياه هادئة ساكنة', en: 'Luminous moon glowing over calm silent waters' },
    emoji: '🌕',
    gradient: 'from-slate-900 via-blue-950 to-indigo-950',
    image: moonlakeImg
  },
  {
    id: 'ocean',
    title: { ar: 'المحيط الليلي العميق', en: 'Midnight Ocean' },
    desc: { ar: 'أمواج ليلية عميقة مع نسيم بحري مهدئ للأعصاب', en: 'Rhythmic deep ocean waters under the night sky' },
    emoji: '🌊',
    gradient: 'from-blue-950 via-slate-950 to-cyan-950',
    image: oceanImg
  },
  {
    id: 'forest',
    title: { ar: 'غابة الضباب والسكينة', en: 'Misty Forest' },
    desc: { ar: 'أشجار صنوبر ساحرة في ضباب زمردي لطيف', en: 'Tranquil emerald pine forest wrapped in cool mist' },
    emoji: '🌲',
    gradient: 'from-emerald-950 via-slate-950 to-teal-950',
    image: forestImg
  },
  {
    id: 'desert',
    title: { ar: 'سكون الصحراء الذهبي', en: 'Desert Starlight' },
    desc: { ar: 'كثبان ليلية دافئة تحت سماء مرصعة بالنجوم الصافية', en: 'Golden nocturnal dunes under crystal-clear stars' },
    emoji: '🏜️',
    gradient: 'from-amber-950 via-slate-950 to-stone-900'
  },
  {
    id: 'mountains',
    title: { ar: 'قمم الجبال في الشفق', en: 'Dusk Mountains' },
    desc: { ar: 'سلاسل جبال أرجوانية هادئة تعزز عمق التنفس والتركيز', en: 'Peaceful violet mountain ridges inspiring deep breaths' },
    emoji: '🏔️',
    gradient: 'from-purple-950 via-slate-950 to-slate-900',
    image: mountainsImg
  }
];

export const SceneSelectorModal: React.FC<SceneSelectorModalProps> = ({
  isOpen,
  onClose,
  currentScene,
  onSelectScene,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="scene-selector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0d1220]/95 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'ar' ? 'استوديو المشاهد والأجواء البصرية' : 'Ambient Visual Scenes Studio'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'اختر المشهد التأملي الذي يمنح عينيك وروحك أقصى درجات السكينة'
                  : 'Select your serene visual backdrop for meditation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scenes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {SCENE_OPTIONS.map((opt) => {
            const isSelected = currentScene === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onSelectScene(opt.id);
                  onClose();
                }}
                className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left rtl:text-right transition-all overflow-hidden ${
                  isSelected
                    ? 'border-purple-400 ring-2 ring-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Background image if available */}
                {opt.image ? (
                  <>
                    <img
                      src={opt.image}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1220] via-[#0d1220]/80 to-transparent" />
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${opt.gradient} opacity-80`} />
                )}

                <div className="relative z-10 flex items-center justify-between w-full mb-2">
                  <span className="text-2xl">{opt.emoji}</span>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-white shadow-sm">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <span className="relative z-10 text-sm font-bold text-white mb-0.5">
                  {lang === 'ar' ? opt.title.ar : opt.title.en}
                </span>
                <span className="relative z-10 text-[11px] text-slate-300 leading-snug">
                  {lang === 'ar' ? opt.desc.ar : opt.desc.en}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
