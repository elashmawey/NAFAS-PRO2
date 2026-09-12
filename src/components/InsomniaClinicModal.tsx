import React from 'react';
import { Language } from '../types';
import { Moon, Sparkles, X, Check, Heart, Shield, Headphones } from 'lucide-react';

interface InsomniaClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onStart478: () => void;
  onStartSleepJourney: () => void;
}

export const InsomniaClinicModal: React.FC<InsomniaClinicModalProps> = ({
  isOpen,
  onClose,
  lang,
  onStart478,
  onStartSleepJourney
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="insomnia-clinic-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/20 bg-[#0d1220]/95 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'ar' ? 'عيادة الأرق والنوم العميق 🌙' : 'Sleep & Insomnia Clinic'}
              </h3>
              <p className="text-xs text-amber-200/70">
                {lang === 'ar' ? 'بروتوكول 4-7-8 لإبطاء نبض القلب والتهيئة للنوم' : '4-7-8 Protocol & Guided Somatic Release'}
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

        {/* Banner */}
        <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-100 leading-relaxed">
          <b>{lang === 'ar' ? 'تهدئة التفكير المفرط:' : 'Calming Racing Thoughts:'} </b>
          {lang === 'ar'
            ? 'حبس النَفَس لـ 7 ثوانٍ ثم الزفير لـ 8 ثوانٍ يحفز العصب المبهم فورياً، مما يخفض ضغط الدم ويهيئ الدماغ لإفراز الميلاتونين.'
            : 'Holding for 7s and exhaling for 8s triggers the vagal brake, lowering blood pressure and signaling sleep.'}
        </div>

        {/* 3 Step Body Scan */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-300">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-300 text-[11px]">
              ١
            </span>
            <div>
              <b className="text-white block mb-0.5">
                {lang === 'ar' ? 'إرخاء الفك واللسان:' : 'Release Jaw & Tongue:'}
              </b>
              <span className="text-slate-400 text-[11px]">
                {lang === 'ar'
                  ? 'دع فكك السفلي يبتعد عن العلوي، واجعل لسانك يرتاح في قاع فمك لإرسال إشارة أمان لجهازك العصبي.'
                  : 'Let your lower jaw fall away from the top, allowing your tongue to rest at the base of your mouth.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-300">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-300 text-[11px]">
              ٢
            </span>
            <div>
              <b className="text-white block mb-0.5">
                {lang === 'ar' ? 'إسقاط ثقل الكتفين:' : 'Drop Shoulder Weight:'}
              </b>
              <span className="text-slate-400 text-[11px]">
                {lang === 'ar'
                  ? 'أنزل كتفيك بالكامل بعيداً عن أذنيك ودع ثقل ذراعيك يذوب داخل السرير.'
                  : 'Slide shoulders fully down from your ears, letting your arms melt heavily into bed.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-300">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-300 text-[11px]">
              ٣
            </span>
            <div>
              <b className="text-white block mb-0.5">
                {lang === 'ar' ? 'قاعدة الاستسلام (The 20-min Rule):' : 'The 20-Minute Rule:'}
              </b>
              <span className="text-slate-400 text-[11px]">
                {lang === 'ar'
                  ? 'لا تجبر نفسك على النوم. ركّز فقط على صوت الأنفاس والأصوات المولدة، والنعاس سيأتي تلقائياً.'
                  : 'Do not fight sleeplessness; anchor your mind onto the breathing and sleep sounds.'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onStartSleepJourney();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 py-3 text-xs font-bold text-[#060a13] shadow-lg hover:opacity-95 transition-all"
          >
            <Headphones className="h-4 w-4" />
            <span>
              {lang === 'ar'
                ? '🎧 تشغيل رحلة النَفَس نحو النوم العميق (إرشاد صوتي كامل 6 دقائق)'
                : '🎧 Start 6-Min Deep Sleep Journey (Full Audio Guidance)'}
            </span>
          </button>

          <button
            onClick={() => {
              onStart478();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 transition-all"
          >
            <Moon className="h-4 w-4" />
            <span>
              {lang === 'ar'
                ? 'تشغيل جلسة تنفس 4-7-8 الكلاسيكية (30 دورة للنوم)'
                : 'Start Classic 4-7-8 Breathing Session (30 Cycles)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
