import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { X, Flame, DollarSign, Wind, Heart, Sparkles, Share2, ShieldCheck, Check, Calendar } from 'lucide-react';

interface SmokerRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectPattern?: (patternId: string) => void;
}

interface SmokerProfile {
  cigsPerDay: number;
  packPrice: number;
  currency: string;
  cigsPerPack: number;
  quitDate: string; // ISO date
}

const DEFAULT_PROFILE: SmokerProfile = {
  cigsPerDay: 20,
  packPrice: 8,
  currency: '$',
  cigsPerPack: 20,
  quitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 days ago by default
};

export const SmokerRecoveryModal: React.FC<SmokerRecoveryModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectPattern
}) => {
  const [profile, setProfile] = useState<SmokerProfile>(() => {
    try {
      const saved = localStorage.getItem('nafas_smoker_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nafas_smoker_profile', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  if (!isOpen) return null;

  // Calculate stats based on quitDate
  const quitTime = new Date(profile.quitDate).getTime();
  const now = Date.now();
  const diffHours = Math.max(0, (now - quitTime) / (1000 * 60 * 60));
  const diffDays = diffHours / 24;

  const cigsAvoided = Math.floor(diffDays * profile.cigsPerDay);
  const costPerCig = profile.packPrice / (profile.cigsPerPack || 20);
  const moneySaved = Math.floor(cigsAvoided * costPerCig);

  // Biological milestones
  const coNormalized = Math.min(100, Math.floor((diffHours / 24) * 100));
  const tasteSmellRegained = Math.min(100, Math.floor((diffHours / 48) * 100));
  const lungCapacityBoost = Math.min(100, Math.floor((diffDays / 30) * 100));
  const ciliaRegrowth = Math.min(100, Math.floor((diffDays / 90) * 100));

  const handleShare = () => {
    const text =
      lang === 'ar'
        ? `🚭 فخور بإنجازي مع تطبيق نَفَس: امتنعت عن ${cigsAvoided} سيجارة ووفّرت ${moneySaved} ${profile.currency}! ورئتي تستعيد عافيتها يوماً بعد يوم 🫁✨`
        : `🚭 Proud milestone on Nafas App: ${cigsAvoided} cigarettes avoided & ${moneySaved} ${profile.currency} saved! My lungs are breathing clean again 🫁✨`;

    if (navigator.share) {
      navigator.share({ title: 'تعافي الرئة - نَفَس', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert(lang === 'ar' ? 'تم نسخ بطاقة التعافي بنجاح للمشاركة!' : 'Milestone copied to clipboard for sharing!');
    }
  };

  return (
    <div
      id="smoker-recovery-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0d1220]/95 p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{lang === 'ar' ? 'عدّاد استعادة الرئة للمدخنين' : 'Smoker Recovery & Wealth Tracker'}</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                  {lang === 'ar' ? 'حرية الرئة' : 'FREEDOM'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'شاهد كيف تتجدد رئتاك وتوفر أموالك مع كل يوم تنفّس نقي'
                  : 'Track cellular regeneration & financial freedom since quitting'}
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

        {/* Top Highlight Cards: Cigarettes Avoided & Money Saved */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900/60 p-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-400">
                {lang === 'ar' ? 'سجائر تم تجنبها' : 'Cigarettes Avoided'}
              </span>
              <Flame className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{cigsAvoided.toLocaleString()}</span>
              <span className="text-xs text-slate-400">{lang === 'ar' ? 'سيجارة' : 'cigs'}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {lang === 'ar' ? `${diffDays.toFixed(1)} أيام نقية` : `${diffDays.toFixed(1)} clean days`}
            </span>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 to-slate-900/60 p-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-400">
                {lang === 'ar' ? 'أموال تم توفيرها' : 'Money Saved'}
              </span>
              <DollarSign className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{moneySaved.toLocaleString()}</span>
              <span className="text-xs font-bold text-amber-300">{profile.currency}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {lang === 'ar' ? 'في جيبك وصحتك' : 'In your pocket'}
            </span>
          </div>
        </div>

        {/* Biological Recovery Timeline */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
            <span>{lang === 'ar' ? 'مؤشرات التعافي الفسيولوجي للرئتين' : 'Biological Regeneration'}</span>
            <span className="text-[10px] text-emerald-400 font-normal">
              {lang === 'ar' ? 'تجدد مستمر' : 'Active Healing'}
            </span>
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{lang === 'ar' ? 'تنقية أول أكسيد الكربون وعودة الأكسجين' : 'Carbon Monoxide Cleared'}</span>
                <span className="font-bold text-emerald-400">{coNormalized}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all" style={{ width: `${coNormalized}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{lang === 'ar' ? 'استعادة حاسة التذوق وتهدئة نبض القلب' : 'Heart Rate & Taste Normalization'}</span>
                <span className="font-bold text-emerald-400">{tasteSmellRegained}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all" style={{ width: `${tasteSmellRegained}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{lang === 'ar' ? 'تحسن سعة الرئة وتراجع ضيق التنفس' : 'Lung Capacity & Ease of Breathing'}</span>
                <span className="font-bold text-cyan-400">{lungCapacityBoost}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all" style={{ width: `${lungCapacityBoost}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{lang === 'ar' ? 'تجدد الأهداب التنفسية وطرد السموم' : 'Cilia Regrowth & Deep Mucus Clearing'}</span>
                <span className="font-bold text-purple-400">{ciliaRegrowth}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all" style={{ width: `${ciliaRegrowth}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Settings Toggle Accordion */}
        <div className="mb-5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>{isEditing ? (lang === 'ar' ? 'إخفاء تخصيص الإعدادات' : 'Hide Settings') : (lang === 'ar' ? 'تعديل تاريخ الإقلاع وسعر العلبة ⚙️' : 'Edit Quit Date & Price ⚙️')}</span>
          </button>

          {isEditing && (
            <div className="mt-3 grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  {lang === 'ar' ? 'تاريخ التوقف' : 'Quit Date'}
                </label>
                <input
                  type="date"
                  value={profile.quitDate}
                  onChange={(e) => setProfile({ ...profile, quitDate: e.target.value })}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  {lang === 'ar' ? 'سجائر يومياً' : 'Cigs / Day'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={profile.cigsPerDay}
                  onChange={(e) => setProfile({ ...profile, cigsPerDay: parseInt(e.target.value) || 20 })}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  {lang === 'ar' ? 'سعر العلبة' : 'Pack Price'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={profile.packPrice}
                  onChange={(e) => setProfile({ ...profile, packPrice: parseFloat(e.target.value) || 5 })}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  {lang === 'ar' ? 'العملة' : 'Currency'}
                </label>
                <select
                  value={profile.currency}
                  onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="$" className="bg-[#0d1220]">$ (USD)</option>
                  <option value="ج.م" className="bg-[#0d1220]">ج.م (EGP)</option>
                  <option value="ر.س" className="bg-[#0d1220]">ر.س (SAR)</option>
                  <option value="د.إ" className="bg-[#0d1220]">د.إ (AED)</option>
                  <option value="€" className="bg-[#0d1220]">€ (EUR)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Share Card & ACBT Workout */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleShare}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4 text-slate-950" />
            <span>{lang === 'ar' ? 'مشاركة بطاقة إنجازي في الستوري 📸' : 'Share Freedom Card 📸'}</span>
          </button>

          {onSelectPattern && (
            <button
              onClick={() => {
                onSelectPattern('detox_acbt');
                onClose();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Wind className="h-3.5 w-3.5 text-cyan-400" />
              <span>{lang === 'ar' ? 'تمرين تنقية الرئة ACBT' : 'Start ACBT Detox'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
