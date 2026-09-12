import React from 'react';
import { Phase, Language } from '../types';

interface BreathingOrbProps {
  phase: 'in' | 'hold' | 'out' | 'idle' | 'paused' | 'done';
  phaseProgress: number; // 0 to 1
  remainingSeconds: number;
  scale: number;
  lang: Language;
  onToggle: () => void;
  accentHue?: number;
  phaseHint?: string;
}

const PHASE_LABELS: Record<string, { ar: string; en: string }> = {
  in: { ar: 'شهيق عميق', en: 'Inhale Deeply' },
  hold: { ar: 'احبس النَفَس', en: 'Hold Breath' },
  out: { ar: 'زفير هادئ', en: 'Exhale Slowly' },
  idle: { ar: 'ابدأ الجلسة', en: 'Start Breath' },
  paused: { ar: 'وقفة هادئة', en: 'Paused' },
  done: { ar: 'أحسنت صنعاً', en: 'Well Done' }
};

export const BreathingOrb: React.FC<BreathingOrbProps> = ({
  phase,
  phaseProgress,
  remainingSeconds,
  scale,
  lang,
  onToggle,
  accentHue = 0,
  phaseHint
}) => {
  const RADIUS = 140;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - phaseProgress);

  const label = PHASE_LABELS[phase] ? (lang === 'ar' ? PHASE_LABELS[phase].ar : PHASE_LABELS[phase].en) : '';

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Interactive Orb Wrapper */}
      <div
        id="orb-touch-target"
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-label="Toggle Breathing Session"
        className="relative w-64 h-64 sm:w-72 sm:h-72 cursor-pointer outline-none rounded-full flex items-center justify-center select-none"
      >
        {/* SVG Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 300 300"
        >
          <defs>
            <linearGradient id="orbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86e6cf" />
              <stop offset="100%" stopColor="#7e94ff" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="150"
            cy="150"
            r={RADIUS}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3.5"
          />
          {/* Animated active stroke */}
          <circle
            cx="150"
            cy="150"
            r={RADIUS}
            fill="none"
            stroke="url(#orbGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: phase === 'idle' ? CIRCUMFERENCE : strokeDashoffset,
              transition: 'stroke-dashoffset 0.1s linear',
              filter: `hue-rotate(${accentHue}deg)`
            }}
          />
        </svg>

        {/* Luminous Core Orb */}
        <div
          className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center transition-transform ${
            phase === 'idle' ? 'animate-idle-pulse' : ''
          }`}
          style={{
            transform: `scale(${scale})`,
            background:
              'radial-gradient(circle at 32% 28%, #ddfff6 0%, #84e2cf 22%, #3fadc9 48%, #1e5393 74%, #11244d 100%)',
            boxShadow:
              '0 0 75px rgba(96,224,196,0.32), 0 0 190px rgba(126,148,255,0.18), inset 0 -26px 60px rgba(0,0,0,0.42), inset 0 18px 46px rgba(255,255,255,0.32)',
            filter: `hue-rotate(${accentHue}deg)`,
            willChange: 'transform'
          }}
        >
          {/* Centered Phase Text & Countdown */}
          <div className="flex flex-col items-center justify-center text-center p-3 select-none">
            <span className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              {label}
            </span>
            {phase !== 'idle' && phase !== 'done' && phase !== 'paused' && (
              <span className="mt-1 text-base font-bold font-mono text-white/90 drop-shadow">
                {remainingSeconds}s
              </span>
            )}
            {phaseHint && phase !== 'idle' && phase !== 'done' && (
              <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold text-white tracking-wide border border-white/30 animate-pulse">
                {phaseHint}
              </span>
            )}
            {phase === 'idle' && (
              <span className="mt-1 text-xs text-white/70">
                {lang === 'ar' ? 'انقر للبدء' : 'Tap to start'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
