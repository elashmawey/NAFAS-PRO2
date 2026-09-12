import React, { useState, useEffect } from 'react';
import { healthConnect } from '../services/healthConnect';
import { HealthEcosystemStatus, Language } from '../types';
import { Heart, Activity, CheckCircle2, Download, RefreshCw, X, ShieldCheck, Smartphone } from 'lucide-react';

interface HealthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const HealthSyncModal: React.FC<HealthSyncModalProps> = ({ isOpen, onClose, lang }) => {
  const [status, setStatus] = useState<HealthEcosystemStatus>(healthConnect.getStatus());
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus(healthConnect.getStatus());
      setSyncSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const weeklyMinutes = healthConnect.getWeeklyMinutes();
  const totalMinutes = healthConnect.getTotalMinutes();
  const target = status.weeklyTargetMinutes || 70;
  const progressPct = Math.min(100, Math.round((weeklyMinutes / target) * 100));

  const handleToggleAppleHealth = () => {
    const next = !status.appleHealthConnected;
    healthConnect.toggleAppleHealth(next);
    setStatus(healthConnect.getStatus());
    if (next) {
      setSyncSuccess(lang === 'ar' ? 'تم ربط Apple Health بنجاح!' : 'Apple Health connected!');
      setTimeout(() => setSyncSuccess(null), 3000);
    }
  };

  const handleToggleHealthConnect = () => {
    const next = !status.healthConnectConnected;
    healthConnect.toggleHealthConnect(next);
    setStatus(healthConnect.getStatus());
    if (next) {
      setSyncSuccess(lang === 'ar' ? 'تم ربط Google Health Connect بنجاح!' : 'Google Health Connect connected!');
      setTimeout(() => setSyncSuccess(null), 3000);
    }
  };

  const handleToggleAutoSync = () => {
    const next = !status.autoSync;
    healthConnect.toggleAutoSync(next);
    setStatus(healthConnect.getStatus());
  };

  const handleExportApple = () => {
    healthConnect.downloadAppleHealthExport();
    setSyncSuccess(
      lang === 'ar'
        ? 'تم تنزيل حزمة Apple Health (XML) الجاهزة للاستيراد'
        : 'Apple Health XML export downloaded!'
    );
    setTimeout(() => setSyncSuccess(null), 3500);
  };

  const handleExportHealthConnect = () => {
    healthConnect.downloadHealthConnectExport();
    setSyncSuccess(
      lang === 'ar'
        ? 'تم تنزيل حزمة Health Connect (JSON) المتوافقة مع أندرويد'
        : 'Google Health Connect JSON export downloaded!'
    );
    setTimeout(() => setSyncSuccess(null), 3500);
  };

  return (
    <div
      id="health-sync-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1220]/95 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#86e6cf]/10 text-[#86e6cf] border border-[#86e6cf]/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'ar' ? 'التكامل مع Apple Health & Google Health Connect' : 'Apple Health & Health Connect Sync'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'مزامنة دقائق اليقظة الذهنية ونبض القلب تلقائياً'
                  : 'Automatic Mindful Minutes & Heart Rate sync'}
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

        {/* Feedback Alert */}
        {syncSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#86e6cf]/30 bg-[#86e6cf]/10 px-4 py-3 text-xs text-[#86e6cf]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{syncSuccess}</span>
          </div>
        )}

        {/* Weekly Goal Card */}
        <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              {lang === 'ar' ? 'دقائق اليقظة هذا الأسبوع (Mindful Minutes)' : 'This Week Mindful Minutes'}
            </span>
            <span className="text-xs font-bold text-[#86e6cf]">
              {weeklyMinutes} / {target} {lang === 'ar' ? 'دقيقة' : 'min'}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#86e6cf] to-[#7e94ff] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {lang === 'ar' ? `إجمالي الدقائق المسجلة: ${totalMinutes} د` : `Total Logged: ${totalMinutes} mins`}
            </span>
            <span>{progressPct}% {lang === 'ar' ? 'من الهدف الموصى به' : 'of weekly goal'}</span>
          </div>
        </div>

        {/* Platforms Connect Section */}
        <div className="space-y-3 mb-5">
          {/* Apple Health Card */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3.5 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Apple Health (HealthKit)</span>
                  {status.appleHealthConnected && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {lang === 'ar' ? 'مفعل' : 'Active'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar'
                    ? 'تسجيل جلسات التنفس كـ Mindful Sessions في تطبيق صحتي على iPhone و Apple Watch'
                    : 'Sync sessions directly to Apple Health on iPhone & Apple Watch'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleAppleHealth}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                status.appleHealthConnected
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {status.appleHealthConnected
                ? lang === 'ar' ? 'إلغاء الربط' : 'Disconnect'
                : lang === 'ar' ? 'ربط الآن' : 'Connect'}
            </button>
          </div>

          {/* Google Health Connect Card */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3.5 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Google Health Connect</span>
                  {status.healthConnectConnected && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {lang === 'ar' ? 'مفعل' : 'Active'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar'
                    ? 'تخزين بيانات الجلسات عبر معيار MindfulSessionRecord المتوافق مع أندرويد وساعات Pixel وGalaxy'
                    : 'Direct sync with Android Health Connect standard for Galaxy & Pixel Watches'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleHealthConnect}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                status.healthConnectConnected
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {status.healthConnectConnected
                ? lang === 'ar' ? 'إلغاء الربط' : 'Disconnect'
                : lang === 'ar' ? 'ربط الآن' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Auto Sync Toggle & Privacy Guarantee */}
        <div className="mb-5 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="h-4 w-4 text-[#86e6cf]" />
            <span className="text-xs text-slate-300 font-medium">
              {lang === 'ar' ? 'مزامنة تلقائية عند انتهاء كل جلسة' : 'Auto-sync upon completing each session'}
            </span>
          </div>
          <button
            onClick={handleToggleAutoSync}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              status.autoSync ? 'bg-[#86e6cf]' : 'bg-white/20'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-[#060a13] transition-transform ${
                status.autoSync ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Export Buttons */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            {lang === 'ar' ? 'تصدير السجل الصحي المحلي:' : 'Export Health Records:'}
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExportApple}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs font-medium text-slate-200 hover:bg-white/[0.08] hover:border-white/20 transition-all"
            >
              <Download className="h-3.5 w-3.5 text-red-400" />
              <span>Apple Health (XML)</span>
            </button>
            <button
              onClick={handleExportHealthConnect}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs font-medium text-slate-200 hover:bg-white/[0.08] hover:border-white/20 transition-all"
            >
              <Download className="h-3.5 w-3.5 text-blue-400" />
              <span>Health Connect (JSON)</span>
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-200/80 leading-relaxed">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <span>
            {lang === 'ar'
              ? 'خصوصيتك محمية 100%: تُحفظ بيانات التنفس والنبض محلياً في جهازك فقط، ولا تُرسل لأي خادم سحابي خارجي.'
              : '100% Privacy Protected: Health and breathing metrics remain exclusively on your device.'}
          </span>
        </div>
      </div>
    </div>
  );
};
