import React, { useState } from 'react';
import { voiceGuide } from '../services/voiceGuide';
import { Language, VoiceGuideMode, VoiceSettings } from '../types';
import { Mic, Volume2, Sparkles, Play, Check, X, Sliders, Music } from 'lucide-react';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ isOpen, onClose, lang }) => {
  const [settings, setSettings] = useState<VoiceSettings>(voiceGuide.getSettings());
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  if (!isOpen) return null;

  const handleModeChange = (mode: VoiceGuideMode) => {
    voiceGuide.updateSettings({ mode });
    setSettings(voiceGuide.getSettings());
  };

  const handleWarmthToggle = () => {
    const next = !settings.warmth;
    voiceGuide.updateSettings({ warmth: next });
    setSettings(voiceGuide.getSettings());
  };

  const handleMindfulToggle = () => {
    const next = !settings.mindfulReminders;
    voiceGuide.updateSettings({ mindfulReminders: next });
    setSettings(voiceGuide.getSettings());
  };

  const handlePaceChange = (pace: number) => {
    voiceGuide.updateSettings({ speechPace: pace });
    setSettings(voiceGuide.getSettings());
  };

  const handleTestVoice = () => {
    setIsPlayingSample(true);
    voiceGuide.testVoiceSample(lang);
    setTimeout(() => setIsPlayingSample(false), 3800);
  };

  const modes: { id: VoiceGuideMode; titleAr: string; titleEn: string; descAr: string; descEn: string; icon: React.ReactNode; isHuman?: boolean }[] = [
    {
      id: 'human_warm',
      titleAr: 'صوت بشري دافئ (استوديو)',
      titleEn: 'Warm Studio Human Voice (Male)',
      descAr: 'نبرة عميقة رخيمة مع دفء استوديو صوتي هادئ يبعث على الطمأنينة',
      descEn: 'Deep, resonant, warm human guidance tailored for deep grounding',
      icon: <Mic className="h-4 w-4 text-[#86e6cf]" />,
      isHuman: true
    },
    {
      id: 'human_calm_female',
      titleAr: 'صوت بشري رقيق (مرشدة هادئة)',
      titleEn: 'Gentle Human Voice (Female)',
      descAr: 'نبرة صوتية حانية وناعمة تناسب الاسترخاء وما قبل النوم',
      descEn: 'Soft, compassionate, gentle human voice for evening sleep prep',
      icon: <Sparkles className="h-4 w-4 text-[#f2cd96]" />,
      isHuman: true
    },
    {
      id: 'neural_tts',
      titleAr: 'توليد صوتي آلي (Neural TTS)',
      titleEn: 'Neural Speech Synthesis',
      descAr: 'قراءة قياسية موجزة للشهيق والزفير وحبس النَفَس',
      descEn: 'Standard system vocal prompts for breath counts',
      icon: <Volume2 className="h-4 w-4 text-[#7e94ff]" />
    },
    {
      id: 'chimes_only',
      titleAr: 'إشارات نغمية فقط (بدون صوت بشري)',
      titleEn: 'Harmonic Chimes Only',
      descAr: 'نغمات رنين كونية عند التحول بين الشهيق والزفير في صمت تام',
      descEn: 'Pure acoustic chimes for silent, undistracted meditation',
      icon: <Music className="h-4 w-4 text-slate-400" />
    }
  ];

  return (
    <div
      id="voice-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1220]/95 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#86e6cf]/10 text-[#86e6cf] border border-[#86e6cf]/20">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'ar' ? 'إعدادات الصوت البشري والتوجيه الصوتي' : 'Human Voice & Audio Guidance'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'اختر بين التسجيلات الصوتية البشرية الدافئة أو النغمات الهادئة'
                  : 'Select warm human vocal guidance or ambient acoustic chimes'}
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

        {/* Voice Mode Options */}
        <div className="space-y-2.5 mb-5">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            {lang === 'ar' ? 'نمط المرشد الصوتي:' : 'Voice Guidance Style:'}
          </label>
          {modes.map((m) => {
            const isSelected = settings.mode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-[#86e6cf] bg-[#86e6cf]/10 shadow-[0_0_15px_rgba(134,230,207,0.15)]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{m.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {lang === 'ar' ? m.titleAr : m.titleEn}
                      </span>
                      {m.isHuman && (
                        <span className="rounded-full bg-[#f2cd96]/20 border border-[#f2cd96]/40 px-2 py-0.5 text-[9.5px] font-bold text-[#f2cd96]">
                          {lang === 'ar' ? 'صوت بشري استوديو' : 'Human Voice'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {lang === 'ar' ? m.descAr : m.descEn}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                    isSelected ? 'border-[#86e6cf] bg-[#86e6cf] text-[#060a13]' : 'border-white/20'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Acoustic Fine-Tuning */}
        <div className="mb-5 space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">
                {lang === 'ar' ? 'دفء الاستوديو الصوتي (Acoustic Warmth)' : 'Studio Acoustic Warmth'}
              </span>
              <span className="text-[11px] text-slate-400">
                {lang === 'ar'
                  ? 'مرشح صوتي يخفف حدة الحروف ويرفع دفء النبرة'
                  : 'Low-resonance filter softening vocal sibilance'}
              </span>
            </div>
            <button
              onClick={handleWarmthToggle}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                settings.warmth ? 'bg-[#86e6cf]' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#060a13] transition-transform ${
                  settings.warmth ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="border-t border-white/5 pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">
                {lang === 'ar' ? 'تذكيرات إسقاط الشد والفك' : 'Body Scan Relaxation Reminders'}
              </span>
              <span className="text-[11px] text-slate-400">
                {lang === 'ar'
                  ? 'همسات توجيهية دورية لإرخاء الفك والكتفين أثناء الدورة'
                  : 'Periodic gentle cues to release jaw & shoulder tension'}
              </span>
            </div>
            <button
              onClick={handleMindfulToggle}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                settings.mindfulReminders ? 'bg-[#86e6cf]' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#060a13] transition-transform ${
                  settings.mindfulReminders ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Speed slider */}
          <div className="border-t border-white/5 pt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">
                {lang === 'ar' ? 'سرعة الإرشاد الصوتي:' : 'Speech Guidance Pace:'}
              </span>
              <span className="text-[#86e6cf] font-bold">
                {settings.speechPace.toFixed(2)}x {lang === 'ar' ? '(هادئ ومسترخٍ)' : '(Calm)'}
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.05"
              step="0.05"
              value={settings.speechPace}
              onChange={(e) => handlePaceChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#86e6cf]"
            />
          </div>
        </div>

        {/* Test voice sample button */}
        <div className="flex gap-3">
          <button
            onClick={handleTestVoice}
            disabled={isPlayingSample}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#86e6cf]/40 bg-[#86e6cf]/10 py-2.5 px-4 text-xs font-bold text-[#86e6cf] hover:bg-[#86e6cf]/20 transition-all disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>
              {isPlayingSample
                ? lang === 'ar' ? 'جارٍ الاستماع للعيّنة…' : 'Playing sample…'
                : lang === 'ar' ? 'استمع لعيّنة الصوت البشري' : 'Preview Human Voice Sample'}
            </span>
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
          >
            {lang === 'ar' ? 'تم' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
