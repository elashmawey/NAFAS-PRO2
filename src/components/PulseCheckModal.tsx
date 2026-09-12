import React, { useState } from 'react';
import { healthConnect } from '../services/healthConnect';
import { Language } from '../types';
import { Heart, Activity, CheckCircle2, X } from 'lucide-react';

interface PulseCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSaveAndStart: (suggestedPattern: string, bpm: number) => void;
}

export const PulseCheckModal: React.FC<PulseCheckModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSaveAndStart
}) => {
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [bpm, setBpm] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [isBeating, setIsBeating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleHeartTap = () => {
    const now = Date.now();
    setIsBeating(true);
    setTimeout(() => setIsBeating(false), 140);

    // Haptic if supported
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch {}
    }

    const updated = [...tapTimestamps, now];
    if (updated.length > 8) updated.shift();
    setTapTimestamps(updated);

    if (updated.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < updated.length; i++) {
        intervals.push(updated[i] - updated[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avg > 350 && avg < 1800) {
        const calculatedBpm = Math.round(60000 / avg);
        setBpm(calculatedBpm);
      }
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    const suggested = bpm && bpm > 82 ? 'calm' : 'coherent';
    setTimeout(() => {
      onSaveAndStart(suggested, bpm || 72);
      onClose();
    }, 600);
  };

  return (
    <div
      id="pulse-check-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1220]/95 p-6 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
          <Heart className="h-6 w-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {lang === 'ar' ? 'فاحص النبض ومستوى التوتر' : 'Pulse & Stress Level Check'}
        </h3>
        <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
          {lang === 'ar'
            ? 'انقر على القلب باستمرار مع كل نبضة تشعر بها في معصمك أو عنقك لحساب وتيرة قلبك'
            : 'Tap the heart rhythmically with your pulse (wrist or neck) to measure BPM'}
        </p>

        {/* Heart Tap Button */}
        <div className="mb-4">
          <button
            onClick={handleHeartTap}
            className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-red-400/40 bg-red-500/10 text-red-400 transition-transform active:scale-95 ${
              isBeating ? 'scale-115 shadow-[0_0_30px_rgba(255,100,120,0.5)] border-red-400' : 'hover:scale-105'
            }`}
          >
            <Heart className="h-12 w-12 fill-current" />
          </button>
        </div>

        {/* BPM Display */}
        <div className="text-3xl font-extrabold text-red-400 font-mono mb-1">
          {bpm ? `${bpm} BPM` : '-- BPM'}
        </div>
        <p className="text-xs text-slate-400 mb-5">
          {tapTimestamps.length < 3
            ? lang === 'ar' ? 'انقر 4 مرات متتالية لبدء القياس' : 'Tap 4 times consecutively to measure'
            : lang === 'ar' ? 'استمر بالنقر لزيادة دقة الحساب' : 'Keep tapping for precision'}
        </p>

        {/* Stress Slider */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 mb-5 text-start">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">
              {lang === 'ar' ? 'مستوى التوتر الآن (1 - 10):' : 'Current Stress Level (1 - 10):'}
            </span>
            <span className="text-red-400 font-bold">{stressLevel} / 10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(e) => setStressLevel(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-red-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!bpm}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#86e6cf] to-[#7e94ff] py-3 text-xs font-bold text-[#060a13] hover:opacity-90 transition-all disabled:opacity-40"
          >
            <Activity className="h-4 w-4" />
            <span>
              {lang === 'ar'
                ? 'حفظ ومزامنة وبدء جلسة هادئة'
                : 'Save, Sync & Start Calm Session'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
