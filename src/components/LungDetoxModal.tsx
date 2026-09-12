import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { voiceGuide } from '../services/voiceGuide';
import { audioEngine } from '../services/audioEngine';
import {
  Wind,
  ShieldCheck,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Droplets,
  Activity,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Heart,
  Flame,
  Coffee
} from 'lucide-react';

interface LungDetoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onStartInMainOrb?: (patternId: string) => void;
}

type TabType = 'acbt_live' | 'pursed_lip' | 'recovery_timeline' | 'hygiene_guide';

export const LungDetoxModal: React.FC<LungDetoxModalProps> = ({
  isOpen,
  onClose,
  lang,
  onStartInMainOrb
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('acbt_live');

  // ACBT Live Session State
  // Steps: 0: Prep, 1: Breathing Control (Gentle), 2: Deep Thoracic Expansion (Hold 3s), 3: Huffing ("Haaah!"), 4: Controlled Cough, 5: Done
  const [acbtStep, setAcbtStep] = useState<number>(0);
  const [acbtTimer, setAcbtTimer] = useState<number>(0);
  const [isAcbtRunning, setIsAcbtRunning] = useState<boolean>(false);
  const [acbtCycle, setAcbtCycle] = useState<number>(1);
  const totalCycles = 3;

  // Smoker tracker state
  const [quitDays, setQuitDays] = useState<number>(14);
  const [cigsPerDay, setCigsPerDay] = useState<number>(15);
  const [isSmokerSaved, setIsSmokerSaved] = useState<boolean>(false);

  // Load tracker state
  useEffect(() => {
    try {
      const savedDays = localStorage.getItem('nafas_smoker_quit_days');
      const savedCigs = localStorage.getItem('nafas_smoker_cigs');
      if (savedDays) setQuitDays(parseInt(savedDays, 10));
      if (savedCigs) setCigsPerDay(parseInt(savedCigs, 10));
    } catch {}
  }, []);

  const saveSmokerData = (days: number, cigs: number) => {
    setQuitDays(days);
    setCigsPerDay(cigs);
    setIsSmokerSaved(true);
    try {
      localStorage.setItem('nafas_smoker_quit_days', String(days));
      localStorage.setItem('nafas_smoker_cigs', String(cigs));
    } catch {}
    setTimeout(() => setIsSmokerSaved(false), 2500);
  };

  // ACBT Step definitions
  const stepsData = [
    {
      id: 'prep',
      title: lang === 'ar' ? 'الاستعداد للوضعية السليمة' : 'Posture & Preparation',
      duration: 6,
      instruction:
        lang === 'ar'
          ? 'اجلس مستقيماً، أسند ظهرك، وأرخِ كتفيك وبطنك تماماً. جهز كوب ماء دافئ أو منديلاً بجانبك.'
          : 'Sit upright with back supported, shoulders relaxed. Have warm water or a tissue nearby.',
      voiceKey: 'control' as const
    },
    {
      id: 'control',
      title: lang === 'ar' ? 'المرحلة ١: تنفس هادئ وضبط الشعب (Breathing Control)' : 'Phase 1: Breathing Control',
      duration: 18, // 3 gentle breaths (3s in, 3s out)
      instruction:
        lang === 'ar'
          ? 'تنفّس بهدوء وبطء عبر الأنف مع حركة البطن فقط. هذا يريح القصبات الهوائية ويمنع تشنجها.'
          : 'Breathe gently through your nose, letting your belly rise. This calms and relaxes bronchial tubes.',
      voiceKey: 'control' as const
    },
    {
      id: 'expansion',
      title: lang === 'ar' ? 'المرحلة ٢: تمدد صدري عميق وحبس (Deep Expansion & Hold)' : 'Phase 2: Deep Thoracic Expansion',
      duration: 24, // 3 deep breaths with 3s hold (4s in, 3s hold, 4s out)
      instruction:
        lang === 'ar'
          ? 'شهيق عميق جداً يملأ قاع الصدر، ثم احبس النَفَس لـ ٣ ثوانٍ ليتسلل الهواء خلف البلغم المحتبس ويزيحه عن جدار القصبات.'
          : 'Take a very deep breath in, hold for 3 seconds so air gets behind mucus, then exhale gently.',
      voiceKey: 'deep_expansion' as const
    },
    {
      id: 'huff',
      title: lang === 'ar' ? 'المرحلة ٣: النفث الدافئ (The Huffing Technique)' : 'Phase 3: The Huffing Technique',
      duration: 14,
      instruction:
        lang === 'ar'
          ? 'افتح فمك كأنك تدفئ زجاج نافذة بالبخار، وازفر بقوة دافئة متوسطة: "هااااه!" لدفع المخاط إلى الحلق دون إجهاد الصدر.'
          : 'Open mouth wide like misting a mirror. Exhale with moderate force: "Haaah!" moving mucus upward.',
      voiceKey: 'huff' as const
    },
    {
      id: 'cough',
      title: lang === 'ar' ? 'المرحلة ٤: سعال مسيطر عليه (Controlled Cough)' : 'Phase 4: Controlled Cough',
      duration: 8,
      instruction:
        lang === 'ar'
          ? 'إذا وصل البلغم إلى حلقك، قم بسعال خفيف مسيطر عليه لطرده في المنديل. إذا لم يصل، كرر الدورة بهدوء.'
          : 'If secretions reached your upper throat, give a gentle cough into a tissue. Otherwise, repeat the cycle.',
      voiceKey: 'cough' as const
    }
  ];

  // ACBT Timer Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAcbtRunning) {
      timer = setInterval(() => {
        setAcbtTimer((prev) => {
          if (prev <= 1) {
            // Move to next step
            if (acbtStep < stepsData.length - 1) {
              const nextStep = acbtStep + 1;
              setAcbtStep(nextStep);
              const nextDur = stepsData[nextStep].duration;
              // Trigger voice cue
              voiceGuide.speakLungDetoxCue(stepsData[nextStep].voiceKey, lang);
              audioEngine.playCueTone(330, 440, 0.6);
              return nextDur;
            } else {
              // Check cycles
              if (acbtCycle < totalCycles) {
                setAcbtCycle((c) => c + 1);
                setAcbtStep(1); // loop back to Breathing Control
                voiceGuide.speakLungDetoxCue('control', lang);
                return stepsData[1].duration;
              } else {
                // Done!
                setIsAcbtRunning(false);
                audioEngine.playCompletionHarmonic();
                if (lang === 'ar') {
                  voiceGuide.speakText('أحسنت صنعاً! انتهت دورة تنقية الرئة بنجاح. اشرب رشفة ماء دافئ الآن.', lang);
                } else {
                  voiceGuide.speakText('Great job! ACBT airway clearance complete. Drink some warm water now.', lang);
                }
                return 0;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAcbtRunning, acbtStep, acbtCycle, lang]);

  const startAcbt = () => {
    setAcbtStep(0);
    setAcbtCycle(1);
    setAcbtTimer(stepsData[0].duration);
    setIsAcbtRunning(true);
    voiceGuide.speakText(
      lang === 'ar'
        ? 'سنبدأ الآن بروتوكول دورة التنفس النشط لتنظيف الرئة وطرد البلغم. اجلس مستقيماً وأرخِ كتفيك.'
        : 'Starting Active Cycle of Breathing for airway clearance. Sit upright and relax your shoulders.',
      lang
    );
  };

  const pauseAcbt = () => {
    setIsAcbtRunning(false);
    voiceGuide.cancel();
  };

  const resetAcbt = () => {
    setIsAcbtRunning(false);
    setAcbtStep(0);
    setAcbtCycle(1);
    setAcbtTimer(stepsData[0].duration);
    voiceGuide.cancel();
  };

  if (!isOpen) return null;

  return (
    <div
      id="lung-detox-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/25 bg-[#08101a]/95 p-4 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Wind className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {lang === 'ar' ? 'عيادة تنقية الرئة ومجرى التنفّس 🫁' : 'Pulmonary Detox & Airway Clinic'}
                </h3>
                <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  {lang === 'ar' ? 'للمدخنين وإذابة البلغم' : 'Smokers & Mucus'}
                </span>
              </div>
              <p className="text-xs text-cyan-200/70">
                {lang === 'ar'
                  ? 'بروتوكول دورة التنفس النشط (ACBT) الطبي المعتمد في العلاج الطبيعي للصدر'
                  : 'Active Cycle of Breathing Technique (ACBT) for mucus clearance & lung detox'}
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 border-b border-white/5 scrollbar-none">
          <button
            onClick={() => setActiveTab('acbt_live')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'acbt_live'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Play className="h-3.5 w-3.5 text-cyan-400" />
            <span>{lang === 'ar' ? 'جلسة طرد البلغم الموجهة (ACBT)' : 'Guided ACBT Session'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pursed_lip')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'pursed_lip'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wind className="h-3.5 w-3.5 text-cyan-400" />
            <span>{lang === 'ar' ? 'تنفس الشفاه المضمومة' : 'Pursed-Lip Breathing'}</span>
          </button>

          <button
            onClick={() => setActiveTab('recovery_timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'recovery_timeline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>{lang === 'ar' ? 'مؤشر تعافي رئة المدخن' : 'Smoker Recovery Index'}</span>
          </button>

          <button
            onClick={() => setActiveTab('hygiene_guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'hygiene_guide'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Droplets className="h-3.5 w-3.5 text-cyan-400" />
            <span>{lang === 'ar' ? 'دليل إذابة المخاط والترطيب' : 'Phlegm Clearance Tips'}</span>
          </button>
        </div>

        {/* TAB 1: ACBT LIVE SESSION */}
        {activeTab === 'acbt_live' && (
          <div className="space-y-4">
            {/* Scientific explanation callout */}
            <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3.5 text-xs text-cyan-100 leading-relaxed">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-cyan-300 shrink-0 mt-0.5" />
                <div>
                  <b className="text-cyan-200">
                    {lang === 'ar' ? 'كيف تعمل تقنية ACBT طبياً؟ ' : 'How ACBT Works Clinically: '}
                  </b>
                  {lang === 'ar'
                    ? 'بدلاً من السعال العنيف الذي يضغط على القفص الصدري ويسد القصبات، نستخدم حبس النَفَس لإدخال الهواء خلف الإفرازات اللزجة، ثم نستخدم تقنية "النفث الدافئ (Huffing)" لرفع البلغم تدريجياً وبأمان نحو الحلق لطرده بسهولة.'
                    : 'Instead of violent coughing that collapses airways, deep holds allow collateral ventilation behind mucus, and warm huffing carries secretions gently up the bronchial tree.'}
                </div>
              </div>
            </div>

            {/* Interactive ACBT Display Box */}
            <div className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#0e1c2d] to-[#09121d] p-5 text-center overflow-hidden">
              {/* Progress Ring / Pulse animation */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Cycle Badge */}
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 text-[11px] font-bold text-cyan-300">
                    {lang === 'ar' ? `الدورة ${acbtCycle} من ${totalCycles}` : `Cycle ${acbtCycle} of ${totalCycles}`}
                  </span>
                  {isAcbtRunning && (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {lang === 'ar' ? 'إرشاد صوتي نشط' : 'Voice Active'}
                    </span>
                  )}
                </div>

                {/* Current Step Title */}
                <h4 className="text-lg font-black text-white mb-2">{stepsData[acbtStep].title}</h4>

                {/* Step Timer Count */}
                <div className="my-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                  <span className="text-3xl font-black text-cyan-300 font-mono">
                    {isAcbtRunning ? acbtTimer : stepsData[acbtStep].duration}s
                  </span>
                </div>

                {/* Step Detailed Instructions */}
                <p className="text-xs text-cyan-100 max-w-md leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 my-2">
                  {stepsData[acbtStep].instruction}
                </p>

                {/* Step Specific Visual Cue */}
                {acbtStep === 3 && (
                  <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-2 text-xs font-bold text-amber-200 animate-bounce">
                    🗣️ {lang === 'ar' ? 'افتح فمك وازفر بقوة دافئة: "هااااااااه"' : 'Open mouth & exhale warm breath: "HAAAAH!"'}
                  </div>
                )}
                {acbtStep === 2 && (
                  <div className="mt-2 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-4 py-1.5 text-xs font-semibold text-cyan-200">
                    ⏱️ {lang === 'ar' ? 'حبس النَفَس ٣ ثوانٍ ليتغلغل الهواء خلف المخاط' : '3-second hold to penetrate behind mucus'}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="mt-5 flex items-center justify-center gap-3 relative z-10">
                {!isAcbtRunning ? (
                  <button
                    onClick={startAcbt}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:opacity-95 transition-all"
                  >
                    <Play className="h-4 w-4 fill-black" />
                    <span>
                      {acbtStep === 0
                        ? lang === 'ar'
                          ? 'بدء جلسة الـ ACBT بالصوت'
                          : 'Start Guided ACBT'
                        : lang === 'ar'
                        ? 'متابعة الجلسة'
                        : 'Resume Session'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={pauseAcbt}
                    className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/20 px-6 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-all"
                  >
                    <Pause className="h-4 w-4" />
                    <span>{lang === 'ar' ? 'إيقاف مؤقت' : 'Pause'}</span>
                  </button>
                )}

                <button
                  onClick={resetAcbt}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all"
                  title={lang === 'ar' ? 'إعادة من البداية' : 'Reset'}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{lang === 'ar' ? 'إعادة' : 'Reset'}</span>
                </button>
              </div>
            </div>

            {/* Quick Launch in Core Orb */}
            {onStartInMainOrb && (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
                <span className="text-slate-300">
                  {lang === 'ar'
                    ? 'هل تفضل تشغيل نمط تنقية الرئة المستمر في الحلقة المركزية الكبرى للتطبيق؟'
                    : 'Prefer running continuous lung detox pattern in main orb?'}
                </span>
                <button
                  onClick={() => {
                    onStartInMainOrb('detox_acbt');
                    onClose();
                  }}
                  className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 font-bold text-cyan-300 hover:bg-cyan-500/30 transition-all text-[11px]"
                >
                  {lang === 'ar' ? 'تشغيل في الحلقة الكبرى' : 'Open in Main Orb'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PURSED-LIP BREATHING */}
        {activeTab === 'pursed_lip' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3.5 text-xs text-cyan-100 leading-relaxed">
              <b className="text-cyan-200">
                {lang === 'ar' ? 'ما هو تنفس الشفاه المضمومة (Pursed-Lip)؟ ' : 'What is Pursed-Lip Breathing? '}
              </b>
              {lang === 'ar'
                ? 'هو المعيار الطبي الذهبي لمرضى الربو، المدخنين، والمصابين بضيق النفس أو انتفاخ الرئة. عند الزفير من بين شفتين مضمومتين، يتولد ضغط ارتدادي إيجابي داخل الشعب الهوائية يحميها من الانطباق السريع ويخرج الهواء العالق المحمل بالسموم.'
                : 'Creates positive back-pressure that keeps vulnerable airways open during exhalation, purging trapped stale air.'}
            </div>

            {/* Steps Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs">
                    ١
                  </span>
                  <span>{lang === 'ar' ? 'شهيق عبر الأنف (ثانيتان)' : 'Inhale via Nose (2s)'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">
                  {lang === 'ar'
                    ? 'أغلق فمك، واستنشق الهواء برفق عبر الأنف مع عدّ: ١... ٢. دع الهواء يملأ رئتيك دون إجهاد.'
                    : 'Inhale gently through nose for a count of 2, allowing air to warm and filter.'}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs">
                    ٢
                  </span>
                  <span>{lang === 'ar' ? 'ضم الشفتين كالنفخ (Pursed Lips)' : 'Purse Your Lips'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">
                  {lang === 'ar'
                    ? 'ضم شفتيك تماماً كأنك توشك على إطفاء شمعة أو التصفير برفق.'
                    : 'Pucker lips as if blowing out birthday candles or whistling.'}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs">
                    ٣
                  </span>
                  <span>{lang === 'ar' ? 'زفير بطيء وممتد (٤ ثوانٍ أو أكثر)' : 'Exhale Slowly (4s+)'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">
                  {lang === 'ar'
                    ? 'أخرج الهواء ببطء مضاعف عبر شفتيك المضمومتين مع عدّ: ١... ٢... ٣... ٤. لا تجبر الهواء، دعه ينساب بمقاومة خفيفة.'
                    : 'Exhale twice as long as the inhale through pursed lips. Smooth and unforced.'}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <Heart className="h-4 w-4 text-emerald-400" />
                  <span>{lang === 'ar' ? 'الفائدة الفورية' : 'Immediate Benefit'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">
                  {lang === 'ar'
                    ? 'يفرغ الرئتين من بقايا ثاني أكسيد الكربون، يخفف ضيق التنفس، ويخفض المجهود العضلي للقفص الصدري بنسبة ٤٠٪.'
                    : 'Purges trapped CO2, relieves dyspnea, and reduces respiratory muscle work by 40%.'}
                </p>
              </div>
            </div>

            {onStartInMainOrb && (
              <button
                onClick={() => {
                  onStartInMainOrb('pursed_lip');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 py-3 text-xs font-bold text-black shadow-lg hover:opacity-95 transition-all"
              >
                <Wind className="h-4 w-4" />
                <span>
                  {lang === 'ar'
                    ? 'تشغيل نمط الشفاه المضمومة 2-4 في الحلقة المركزية'
                    : 'Start Pursed-Lip 2-4 in Main Breathing Orb'}
                </span>
              </button>
            )}
          </div>
        )}

        {/* TAB 3: SMOKER RECOVERY TIMELINE & TRACKER */}
        {activeTab === 'recovery_timeline' && (
          <div className="space-y-4">
            {/* User configuration input */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {lang === 'ar' ? 'متابعة تعافي رئة المدخن 🫁' : 'Smoker’s Lung Recovery Tracker'}
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    {lang === 'ar'
                      ? 'أدخل أيام التعافي أو التقليل لمعرفة التغيرات البيولوجية في أهداب الرئة والسعة الهوائية'
                      : 'Track cellular lung regeneration and cilia recovery over time'}
                  </p>
                </div>
                {isSmokerSaved && (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {lang === 'ar' ? 'تم الحفظ' : 'Saved'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium text-[11px]">
                    {lang === 'ar' ? 'عدد الأيام منذ تقليل/إيقاف التدخين:' : 'Days since quitting / reducing:'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="3650"
                    value={quitDays}
                    onChange={(e) => saveSmokerData(parseInt(e.target.value, 10) || 0, cigsPerDay)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-cyan-300 font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium text-[11px]">
                    {lang === 'ar' ? 'المعدل السابق (سجائر/يومياً):' : 'Previous cigarettes / day:'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={cigsPerDay}
                    onChange={(e) => saveSmokerData(quitDays, parseInt(e.target.value, 10) || 1)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-cyan-300 font-mono focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Biological Milestones */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {lang === 'ar' ? 'المحطات الفسيولوجية لتعافي الرئة:' : 'Biological Milestones:'}
              </h5>

              {/* 20 Mins */}
              <div
                className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-all ${
                  quitDays >= 0
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                    : 'border-white/5 bg-white/[0.02] text-slate-400'
                }`}
              >
                <Clock className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">
                    {lang === 'ar' ? 'بعد ٢٠ دقيقة:' : '20 Minutes:'}
                  </b>
                  <span>
                    {lang === 'ar'
                      ? 'يبدأ النبض وضغط الدم بالانخفاض إلى مستواهما الطبيعي، وتتحسن الدورة الدموية في الأطراف.'
                      : 'Heart rate and blood pressure drop back towards healthy baseline levels.'}
                  </span>
                </div>
              </div>

              {/* 8 Hours */}
              <div
                className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-all ${
                  quitDays >= 1
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                    : 'border-white/5 bg-white/[0.02] text-slate-400'
                }`}
              >
                <Flame className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">
                    {lang === 'ar' ? 'بعد ٨ إلى ١٢ ساعة:' : '8 to 12 Hours:'}
                  </b>
                  <span>
                    {lang === 'ar'
                      ? 'ينخفض مستوى غاز أول أكسيد الكربون (CO) السام في الدم إلى النصف، مما يرفع تشبع الأكسجين في الدم.'
                      : 'Carbon monoxide blood levels drop to normal, oxygen levels in blood normalize.'}
                  </span>
                </div>
              </div>

              {/* 72 Hours */}
              <div
                className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-all ${
                  quitDays >= 3
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                    : 'border-white/5 bg-white/[0.02] text-slate-400'
                }`}
              >
                <Wind className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">
                    {lang === 'ar' ? 'بعد ٧٢ ساعة:' : '72 Hours:'}
                  </b>
                  <span>
                    {lang === 'ar'
                      ? 'تسترخي القصبات الهوائية تماماً وتتفتح الشعب، وتبدأ السعة الحيوية للرئة بالارتفاع ويسهل التنفس.'
                      : 'Bronchial tubes relax, breathing gets noticeably easier, and lung capacity increases.'}
                  </span>
                </div>
              </div>

              {/* 1 to 9 Weeks */}
              <div
                className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-all ${
                  quitDays >= 7
                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100'
                    : 'border-white/5 bg-white/[0.02] text-slate-400'
                }`}
              >
                <Sparkles className="h-4 w-4 shrink-0 text-cyan-300 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">
                    {lang === 'ar' ? 'من أسبوع إلى ٩ أسابيع (تجدد الأهداب التنفسية Cilia):' : '1 to 9 Weeks (Cilia Regrowth):'}
                  </b>
                  <span>
                    {lang === 'ar'
                      ? 'تبدأ الأهداب المجهرية المبطنة للشعب الهوائية بالنمو من جديد لتتولى مهمة كنس وتنظيف البلغم والشوائب تلقائياً، وتنخفض نوبات السعال وضيق التنفس بنسبة كبيرة.'
                      : 'Microscopic cilia regrow in airways, actively sweeping mucus out of lungs and dramatically cutting infection risk.'}
                  </span>
                </div>
              </div>

              {/* 1 Year */}
              <div
                className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-all ${
                  quitDays >= 365
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                    : 'border-white/5 bg-white/[0.02] text-slate-400'
                }`}
              >
                <Heart className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">
                    {lang === 'ar' ? 'بعد سنة كاملة:' : '1 Year Smoke-Free:'}
                  </b>
                  <span>
                    {lang === 'ar'
                      ? 'ينخفض خطر الإصابة بأمراض القلب التاجية بنسبة ٥٠٪ مقارنة بالمدخن المستمر.'
                      : 'Coronary heart disease risk drops by 50% compared to a continuing smoker.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MUCUS CLEARANCE & HYGIENE GUIDE */}
        {activeTab === 'hygiene_guide' && (
          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3.5 text-cyan-100 leading-relaxed">
              <b className="text-cyan-200">
                {lang === 'ar' ? 'نصائح طبية معتمدة لإذابة البلغم المتراكم:' : 'Evidence-Based Airway Hygiene Tips:'}
              </b>
              <p className="mt-1 text-[11.5px] text-cyan-100/90">
                {lang === 'ar'
                  ? 'المخاط في الرئة يشبه مادة لزجة تجف عند نقص السوائل وتلتصق بجدران القصبات. هذه الخطوات تحولها لمادة سائلة يسهل طردها.'
                  : 'Mucus becomes thick and sticky when dehydrated. These physical strategies thin secretions so they clear effortlessly.'}
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <Droplets className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">
                    {lang === 'ar' ? '١. الترطيب الفائق والماء الدافئ (Systemic Hydration):' : '1. Warm Fluid Hydration:'}
                  </b>
                  <span className="text-slate-300 text-[11.5px]">
                    {lang === 'ar'
                      ? 'شرب ٢ إلى ٣ لتر من الماء والمشروبات الدافئة (كالينسون والنعناع والزنجبيل الدافئ مع العسل) هو أقوى مذيب طبيعي للبلغم على الإطلاق.'
                      : 'Drinking 2-3 liters of warm water, herbal teas, or honey-lemon water directly thins bronchial mucus.'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <Wind className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">
                    {lang === 'ar' ? '٢. استنشاق البخار الدافئ (Steam Inhalation):' : '2. Steam Inhalation:'}
                  </b>
                  <span className="text-slate-300 text-[11.5px]">
                    {lang === 'ar'
                      ? 'استنشاق بخار ماء دافئ (أثناء الاستحمام أو من إناء بخار) لمدة ٥ إلى ١٠ دقائق يفكك التصاق الإفرازات بأهداب الرئة ويسهل صعودها بتمرين الـ Huffing.'
                      : 'Inhaling warm steam for 5-10 minutes loosens sticky phlegm from the bronchial walls.'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <Activity className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">
                    {lang === 'ar' ? '٣. وضعيات التصريف بالجاذبية (Postural Drainage):' : '3. Postural Drainage:'}
                  </b>
                  <span className="text-slate-300 text-[11.5px]">
                    {lang === 'ar'
                      ? 'الاستلقاء على الجانب مع وضع وسادة تحت الوركين يتيح للجاذبية الأرضية سحب الإفرازات من فصوص الرئة السفلية نحو القصبة المركزية.'
                      : 'Lying on side with hips slightly elevated uses gravity to draw mucus toward central airways.'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-amber-200 block mb-0.5">
                    {lang === 'ar' ? 'تنبيه: تجنب السعال الجاف المتكرر' : 'Caution: Avoid Dry Violent Coughing'}
                  </b>
                  <span className="text-slate-300 text-[11.5px]">
                    {lang === 'ar'
                      ? 'السعال الجاف المستمر يجرح الحبال الصوتية ويحدث تشنجاً في القصبات. استخدم دائماً تقنية النفث الدافئ (Huffing) كبديل آمن وفعال.'
                      : 'Repeated dry coughing causes bronchial spasms and throat irritation. Always prefer gentle huffing.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-cyan-400/80" />
            <span>
              {lang === 'ar'
                ? 'تقنيات فسيولوجية وتمارين تنفس توعوية — استشر طبيبك إذا استمر البلغم الملون أو صعوبة التنفس'
                : 'Physiological wellness techniques — consult a physician if discolored phlegm or severe dyspnea persists'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 bg-white/5 text-slate-300 hover:bg-white/10 text-xs transition-colors"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
