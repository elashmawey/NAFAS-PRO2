import React from 'react';
import { streakTracker } from '../services/streakTracker';
import { Language } from '../types';
import { Flame, Trophy, Award, X, Sparkles, CheckCircle, Share2 } from 'lucide-react';

interface MilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const MilestonesModal: React.FC<MilestonesModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const stats = streakTracker.getStats();
  const badges = streakTracker.getAllBadges();

  const handleShare = () => {
    const text =
      lang === 'ar'
        ? `أكملت اليوم ${stats.totalMinutes} دقيقة من تمارين التنفّس الواعي مع سلسلة متتالية مدتها ${stats.currentStreak} أيام على تطبيق نَفَس Nafas! 🫁✨`
        : `I've completed ${stats.totalMinutes} mindful breathing minutes with a ${stats.currentStreak}-day streak on Nafas Breath App! 🫁✨`;

    if (navigator.share) {
      navigator.share({ title: 'نَفَس - Nafas', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert(lang === 'ar' ? 'تم نسخ إنجازك بنجاح للمشاركة!' : 'Milestone summary copied to clipboard!');
    }
  };

  return (
    <div
      id="milestones-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/20 bg-[#0d1220]/95 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'ar' ? 'أيام التتالي وسجل الإنجازات' : 'Mindful Streak & Milestones'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'حافظ على وتيرة يومية لبناء صحة رئوية وهدوء عصبي مستدام'
                  : 'Track your daily consistency & lung wellness progress'}
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

        {/* Streak Highlight Card */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-[#0d1220] to-orange-500/10 p-5 mb-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <Flame className="h-8 w-8 text-slate-950 fill-slate-950 animate-pulse" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{stats.currentStreak}</span>
                  <span className="text-sm font-semibold text-amber-300">
                    {lang === 'ar' ? 'أيام متتالية' : 'Days Streak'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {lang === 'ar'
                    ? `أطول سلسلة سابقة: ${stats.bestStreak} أيام`
                    : `Best record: ${stats.bestStreak} days`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold text-cyan-300 block">{stats.totalMinutes}</span>
              <span className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'دقيقة تنفّس' : 'Mindful Min'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>{lang === 'ar' ? 'إجمالي الجلسات المكتملة:' : 'Total sessions:'}</span>
            <span className="font-bold text-white">{stats.totalSessions} جلسة</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'أوسمة الإنجاز والسكينة' : 'Milestone Badges'}</span>
            </h4>
            <span className="text-xs text-amber-400/90 font-medium">
              {stats.unlockedBadges.length} / {badges.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`rounded-xl border p-3 flex flex-col items-center text-center transition-all ${
                  b.isUnlocked
                    ? 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                    : 'border-white/5 bg-white/[0.02] opacity-40 grayscale'
                }`}
              >
                <span className="text-2xl mb-1">{b.icon}</span>
                <span className="text-xs font-bold text-white mb-0.5">
                  {lang === 'ar' ? b.title.ar : b.title.en}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {lang === 'ar' ? b.desc.ar : b.desc.en}
                </span>
                {b.isUnlocked && (
                  <span className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-amber-400">
                    <CheckCircle className="h-2.5 w-2.5" />
                    <span>{lang === 'ar' ? 'مُنجز' : 'Earned'}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 py-2.5 text-xs font-bold text-amber-200 hover:brightness-110 transition-all shadow-md"
        >
          <Share2 className="h-4 w-4 text-amber-400" />
          <span>{lang === 'ar' ? 'مشاركة شارة التتالي وإلهام الآخرين' : 'Share Streak & Inspire Others'}</span>
        </button>
      </div>
    </div>
  );
};
