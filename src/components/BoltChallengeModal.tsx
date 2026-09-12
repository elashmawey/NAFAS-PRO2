import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { X, Activity, Trophy, Share2, RotateCcw, Sparkles, CheckCircle2, ShieldAlert, Heart, Wind } from 'lucide-react';

interface BoltChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectPattern?: (patternId: string) => void;
}

type Step = 'prep' | 'holding' | 'result';

export const BoltChallengeModal: React.FC<BoltChallengeModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectPattern
}) => {
  const [step, setStep] = useState<Step>('prep');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      setStep('prep');
      setElapsedMs(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartHolding = () => {
    setStep('holding');
    setElapsedMs(0);
    startTimeRef.current = Date.now();

    timerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 50);
  };

  const handleStopHolding = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStep('result');
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep('prep');
    setElapsedMs(0);
  };

  const seconds = (elapsedMs / 1000).toFixed(1);
  const numSec = parseFloat(seconds);

  // Biological Interpretation & Estimated Lung Age
  let level = {
    title: { ar: 'تحدٍ يحتاج تدريباً', en: 'Needs Training' },
    badge: { ar: 'حساسية مرتفعة لـ CO2', en: 'High CO2 Sensitivity' },
    color: 'from-rose-500 to-red-600',
    borderColor: 'border-rose-500/40',
    textColor: 'text-rose-400',
    lungAge: lang === 'ar' ? '+55 سنة' : '55+ years',
    advice: {
      ar: 'رئتاك تفرغان ثاني أكسيد الكربون بسرعة مفرطة مما يسبب توتراً سريعاً. ننصحك ببدء تدريب "التنهيدة الفسيولوجية" يومياً.',
      en: 'Your body is hyper-sensitive to carbon dioxide. We recommend daily Physiological Sigh training.'
    },
    recommendedPattern: 'sigh'
  };

  if (numSec >= 30) {
    level = {
      title: { ar: 'سعة رئة أسطورية', en: 'Elite Lung Capacity' },
      badge: { ar: 'كفاءة رياضية أولمبية', en: 'Olympic Endurance' },
      color: 'from-amber-400 to-emerald-400',
      borderColor: 'border-amber-400/40',
      textColor: 'text-amber-300',
      lungAge: lang === 'ar' ? '18-22 سنة' : '18-22 years',
      advice: {
        ar: 'تحكم عصبي وأكسدة خلوية خارقة! رئتاك في قمة كفاءتهما الفسيولوجية.',
        en: 'Phenomenal oxygen efficiency! Your respiratory system is in peak condition.'
      },
      recommendedPattern: 'coherent'
    };
  } else if (numSec >= 20) {
    level = {
      title: { ar: 'صحة رئوية ممتازة', en: 'Optimal Lung Health' },
      badge: { ar: 'توازن واستقرار عصبي عالي', en: 'Balanced Autonomic System' },
      color: 'from-emerald-400 to-teal-500',
      borderColor: 'border-emerald-400/40',
      textColor: 'text-emerald-400',
      lungAge: lang === 'ar' ? '24-28 سنة' : '24-28 years',
      advice: {
        ar: 'معدل ممتاز يدل على قدرة عالية على تحمل الإجهاد والهدوء التلقائي.',
        en: 'Great score indicating strong resilience to stress and calm nervous tone.'
      },
      recommendedPattern: 'box'
    };
  } else if (numSec >= 12) {
    level = {
      title: { ar: 'متوسط مع إجهاد طفيف', en: 'Moderate Balance' },
      badge: { ar: 'تراكم إجهاد تنفسي يومي', en: 'Mild Respiratory Fatigue' },
      color: 'from-cyan-400 to-blue-500',
      borderColor: 'border-cyan-400/40',
      textColor: 'text-cyan-400',
      lungAge: lang === 'ar' ? '35-42 سنة' : '35-42 years',
      advice: {
        ar: 'لديك قاعدة جيدة، ولكن ضغوط اليوم تؤدي لتنفس سطحي سريع. تمارين 4-7-8 سترفع سعتك سريعاً.',
        en: 'Solid baseline, but daily tension causes shallow breathing. 4-7-8 training will expand your capacity.'
      },
      recommendedPattern: 'calm'
    };
  }

  const handleShare = () => {
    const text =
      lang === 'ar'
        ? `🫁 نتيجتي في اختبار سعة الرئة وتحدي BOLT على تطبيق نَفَس: ${seconds} ثانية (العمر الرئوي التقديري: ${level.lungAge})! هل يمكنك تحدي رئتيك؟ ✨`
        : `🫁 My Lung BOLT Score on Nafas App: ${seconds}s (Estimated Lung Age: ${level.lungAge})! Can you beat it? ✨`;

    if (navigator.share) {
      navigator.share({ title: 'تحدي سعة الرئة - نَفَس', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert(lang === 'ar' ? 'تم نسخ نتيجتك بنجاح لمشاركتها في الستوري!' : 'Score copied to clipboard for sharing!');
    }
  };

  return (
    <div
      id="bolt-challenge-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0d1220]/95 p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{lang === 'ar' ? 'اختبار سعة الرئة وتحدي BOLT' : 'BOLT Lung Capacity Challenge'}</span>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                  {lang === 'ar' ? 'علمي معتمد' : 'CLINICAL'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'مقياس دقيق لمدى كفاءة استهلاك الأكسجين ومقاومة الإجهاد'
                  : 'Body Oxygen Level Test: Evaluate your cellular oxygen resilience'}
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

        {/* STEP 1: PREPARATION */}
        {step === 'prep' && (
          <div>
            <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4 mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                <Wind className="h-4 w-4" />
                <span>{lang === 'ar' ? 'كيف يعمل الاختبار في ٣ خطوات بسيطة؟' : 'How the Test Works'}</span>
              </h4>
              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300">
                    1
                  </span>
                  <span>
                    {lang === 'ar'
                      ? 'اجلس مسترخياً، وخذ شهيقاً هادئاً عادياً من أنفك ثم أخرجه بشكل طبيعي.'
                      : 'Sit relaxed, take a normal gentle breath in through your nose, and let it out normally.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300">
                    2
                  </span>
                  <span>
                    {lang === 'ar'
                      ? 'اضغط زر "بدء حبس النَفَس" وسد أنفك برفق بعد انتهاء الزفير.'
                      : 'Click "Start Breath Hold" and pinch your nose gently right after the exhale.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300">
                    3
                  </span>
                  <span>
                    {lang === 'ar'
                      ? 'توقف فور شعورك بأول رغبة طبيعية غير قسرية للتنفس (ليس حتى الاختناق!).'
                      : 'Stop the moment you feel the first involuntary urge to breathe (not until gasping!).'}
                  </span>
                </li>
              </ol>
            </div>

            <button
              onClick={handleStartHolding}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Activity className="h-4 w-4" />
              <span>{lang === 'ar' ? 'جاهز، ابدأ الاختبار الآن' : 'I am Ready, Start Test'}</span>
            </button>
          </div>
        )}

        {/* STEP 2: HOLDING (ACTIVE TIMER) */}
        {step === 'holding' && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="relative mb-6 flex h-48 w-48 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping opacity-30" />
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white tracking-tight">{seconds}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mt-1">
                  {lang === 'ar' ? 'ثانية حبس نَفَس' : 'SECONDS'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-xs mb-6">
              {lang === 'ar'
                ? 'حافظ على هدوء عضلات حلقك ورقبتك... اضغط الزر فور شعورك بأول رغبة للتنفس.'
                : 'Keep throat relaxed... Tap below at the very first involuntary urge to breathe.'}
            </p>

            <button
              onClick={handleStopHolding}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-base shadow-[0_0_30px_rgba(244,63,94,0.5)] hover:brightness-110 active:scale-[0.97] transition-all"
            >
              {lang === 'ar' ? 'أشعر بالرغبة للتنفس الآن (إيقاف)' : 'I Feel Urge to Breathe (Stop)'}
            </button>
          </div>
        )}

        {/* STEP 3: RESULT & SCORECARD */}
        {step === 'result' && (
          <div>
            {/* Story Card Box */}
            <div
              className={`rounded-2xl border ${level.borderColor} bg-gradient-to-b from-[#11192e] to-[#0d1220] p-5 mb-5 shadow-2xl relative overflow-hidden`}
            >
              {/* Background ambient glow */}
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${level.color} opacity-20 blur-2xl`} />

              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                    {lang === 'ar' ? 'بطاقة فحص الرئة BOLT' : 'BOLT SCORECARD'}
                  </span>
                </div>
                <span className={`text-xs font-extrabold ${level.textColor}`}>
                  {lang === 'ar' ? level.badge.ar : level.badge.en}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl bg-white/[0.03] p-3.5 border border-white/5">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {lang === 'ar' ? 'مدة التحمل' : 'Hold Time'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{seconds}</span>
                    <span className="text-xs text-slate-400">{lang === 'ar' ? 'ثانية' : 'sec'}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-3.5 border border-white/5">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {lang === 'ar' ? 'العمر الرئوي التقديري' : 'Estimated Lung Age'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${level.textColor}`}>{level.lungAge}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-xs text-slate-300 mb-2 leading-relaxed">
                <p>{lang === 'ar' ? level.advice.ar : level.advice.en}</p>
              </div>

              {/* Action CTA */}
              {onSelectPattern && (
                <button
                  onClick={() => {
                    onSelectPattern(level.recommendedPattern);
                    onClose();
                  }}
                  className="mt-3 w-full py-2.5 px-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>
                    {lang === 'ar'
                      ? 'بدء التمرين الموصى به لتحسين سعة الرئة'
                      : 'Start Recommended Capacity Workout'}
                  </span>
                </button>
              )}
            </div>

            {/* Buttons: Share & Retest */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4 text-slate-950" />
                <span>{lang === 'ar' ? 'مشاركة النتيجة في الستوري 📸' : 'Share Result Card 📸'}</span>
              </button>

              <button
                onClick={handleReset}
                className="py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{lang === 'ar' ? 'إعادة' : 'Retry'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
