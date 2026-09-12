import { Language, VoiceSettings } from '../types';
import { audioEngine } from './audioEngine';

interface VoiceCuePhrases {
  in: string[];
  hold: string[];
  out: string[];
  mindful: string[];
}

const ARABIC_PHRASES: VoiceCuePhrases = {
  in: [
    'شهيق عميق بهدوء...',
    'خُذ نفساً عميقاً يملأ صدرك...',
    'تنفّس بهدوء، املأ رئتيك بالسكينة...',
    'شهيق بطيء وواعٍ...'
  ],
  hold: [
    'احبس النَفَس برفق وسلام...',
    'استشعر الامتلاء والهدوء داخل صدرك...',
    'وقفة هادئة، احتفظ بالسكينة...',
    'احبس بلطف دون أي جهد...'
  ],
  out: [
    'زفير هادئ وممتد، أفرغ كل التوتر...',
    'أطلق الهواء ببطء واسترخاء تام...',
    'زفير ناعم، دع جسدك يرتاح كلياً...',
    'أخرج النَفَس بلطف وسلاسة...'
  ],
  mindful: [
    'أرخِ عضلات وجهك وفكك الآن...',
    'أسقط كتفيك برفق، دع ذراعيك تثقلان...',
    'لاحظ سكون نبضك وتناغم أنفاسك...',
    'أنت هنا بأمان وسلام... استسلم للراحة.',
    'دع أي فكرة تعبر كغمامة صامتة...'
  ]
};

const ENGLISH_PHRASES: VoiceCuePhrases = {
  in: [
    'Deep, gentle breath in...',
    'Inhale slowly, feeling calm fill your chest...',
    'Take in fresh stillness...',
    'A quiet, steady breath in...'
  ],
  hold: [
    'Hold softly with ease...',
    'Stay gently suspended in peace...',
    'Hold the stillness inside...',
    'A peaceful pause, no tension...'
  ],
  out: [
    'Long, peaceful exhale... let go of all stress.',
    'Breathe out slowly and completely relax...',
    'Soft release, letting your whole body sink...',
    'Slow exhale, feeling warm weight in your muscles...'
  ],
  mindful: [
    'Soften your jaw and let your shoulders drop...',
    'Allow your tongue to rest at the base of your mouth...',
    'Notice the gentle rhythm slowing your heartbeat...',
    'You are safe, at peace, and grounded right here.'
  ]
};

class VoiceGuideService {
  private settings: VoiceSettings = {
    mode: 'human_warm',
    volume: 85,
    speechPace: 0.82,
    warmth: true,
    speakPhases: true,
    mindfulReminders: true
  };

  private cachedVoices: { arMale: SpeechSynthesisVoice | null; arFemale: SpeechSynthesisVoice | null; enMale: SpeechSynthesisVoice | null; enFemale: SpeechSynthesisVoice | null } = {
    arMale: null,
    arFemale: null,
    enMale: null,
    enFemale: null
  };

  private lastPhraseIndex: Record<string, number> = { in: -1, hold: -1, out: -1, mindful: -1 };

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.refreshVoices();
      window.speechSynthesis.onvoiceschanged = () => this.refreshVoices();
    }
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('nafas_voice_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch {
      // Use defaults
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('nafas_voice_settings', JSON.stringify(this.settings));
    } catch {
      // Ignored
    }
  }

  private refreshVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();

    const scoreVoice = (v: SpeechSynthesisVoice, isFemaleTarget: boolean) => {
      let score = 0;
      const name = (v.name || '').toLowerCase();
      if (name.includes('natural') || name.includes('neural') || name.includes('online')) score += 10;
      if (name.includes('premium') || name.includes('enhanced')) score += 7;
      if (name.includes('google')) score += 5;
      if (name.includes('microsoft')) score += 4;
      if (name.includes('siri')) score += 6;

      const femaleHints = ['female', 'woman', 'zeina', 'amira', 'laila', 'samantha', 'jenny', 'zira', 'ava'];
      const maleHints = ['male', 'man', 'hamed', 'naayf', 'david', 'george', 'guy', 'salim'];

      const isFemale = femaleHints.some((h) => name.includes(h));
      const isMale = maleHints.some((h) => name.includes(h));

      if (isFemaleTarget && isFemale) score += 6;
      if (!isFemaleTarget && isMale) score += 6;

      return score;
    };

    const arVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('ar'));
    const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));

    this.cachedVoices.arMale = arVoices.slice().sort((a, b) => scoreVoice(b, false) - scoreVoice(a, false))[0] || null;
    this.cachedVoices.arFemale = arVoices.slice().sort((a, b) => scoreVoice(b, true) - scoreVoice(a, true))[0] || null;
    this.cachedVoices.enMale = enVoices.slice().sort((a, b) => scoreVoice(b, false) - scoreVoice(a, false))[0] || null;
    this.cachedVoices.enFemale = enVoices.slice().sort((a, b) => scoreVoice(b, true) - scoreVoice(a, true))[0] || null;
  }

  public speakPhasePrompt(phase: 'in' | 'hold' | 'out', lang: Language = 'ar') {
    if (this.settings.mode === 'chimes_only' || !this.settings.speakPhases) return;

    const pool = lang === 'ar' ? ARABIC_PHRASES[phase] : ENGLISH_PHRASES[phase];
    if (!pool || pool.length === 0) return;

    // Cycle through phrases organically so it feels conversational and natural
    const nextIdx = (this.lastPhraseIndex[phase] + 1) % pool.length;
    this.lastPhraseIndex[phase] = nextIdx;
    const text = pool[nextIdx];

    this.speakText(text, lang, {
      pitch: this.settings.mode === 'human_calm_female' ? 0.95 : 0.82,
      rate: this.settings.speechPace * 0.95
    });
  }

  public speakMindfulReminder(lang: Language = 'ar') {
    if (this.settings.mode === 'chimes_only' || !this.settings.mindfulReminders) return;

    const pool = lang === 'ar' ? ARABIC_PHRASES.mindful : ENGLISH_PHRASES.mindful;
    const nextIdx = (this.lastPhraseIndex.mindful + 1) % pool.length;
    this.lastPhraseIndex.mindful = nextIdx;
    const text = pool[nextIdx];

    this.speakText(text, lang, {
      pitch: this.settings.mode === 'human_calm_female' ? 0.92 : 0.78,
      rate: this.settings.speechPace * 0.88
    });
  }

  public speakText(
    text: string,
    lang: Language = 'ar',
    overrides?: { pitch?: number; rate?: number; volume?: number }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (audioEngine.getIsMuted()) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const isFemale = this.settings.mode === 'human_calm_female';
      const voice =
        lang === 'ar'
          ? isFemale
            ? this.cachedVoices.arFemale || this.cachedVoices.arMale
            : this.cachedVoices.arMale || this.cachedVoices.arFemale
          : isFemale
          ? this.cachedVoices.enFemale || this.cachedVoices.enMale
          : this.cachedVoices.enMale || this.cachedVoices.enFemale;

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      }

      // Warm acoustic parameters
      const basePitch = overrides?.pitch ?? (isFemale ? 0.96 : 0.84);
      const baseRate = overrides?.rate ?? this.settings.speechPace;
      const vol = (overrides?.volume ?? this.settings.volume) / 100;

      // Studio human voice organic warmth adjustment:
      // A gentle low-pitch shift to soothe vocal tract sibilance, creating that warm, radio-studio proximity effect
      const warmOffset = this.settings.warmth ? -0.04 : 0;
      utterance.pitch = Math.max(0.6, Math.min(1.2, basePitch + warmOffset));
      utterance.rate = Math.max(0.6, Math.min(1.1, baseRate));
      utterance.volume = vol;

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignored
    }
  }

  public speakLungDetoxCue(step: 'control' | 'deep_expansion' | 'huff' | 'cough', lang: Language = 'ar') {
    if (this.settings.mode === 'chimes_only') return;
    const prompts = {
      control: {
        ar: 'تنفس بطني هادئ ولطيف... دع القصبات الهوائية تسترخي.',
        en: 'Gentle, calm breathing... let your airways relax.'
      },
      deep_expansion: {
        ar: 'شهيق صدري عميق... احبس الهواء لثلاث ثوانٍ ليتغلغل خلف البلغم.',
        en: 'Deep thoracic inhale... hold for 3 seconds so air flows behind secretions.'
      },
      huff: {
        ar: 'الآن نفث دافئ هافلنج بفم مفتوح: هااااه، كأنك تدفئ زجاج نافذة لدفع البلغم للأعلى.',
        en: 'Now a warm open-mouth huff: Haaah! Moving secretions upward safely.'
      },
      cough: {
        ar: 'سعال خفيف ومسيطر عليه لتفريغ مجرى الهواء بأمان.',
        en: 'A gentle, controlled cough to clear the throat safely.'
      }
    };

    const text = prompts[step]?.[lang] || prompts[step]?.ar;
    if (text) {
      this.speakText(text, lang, {
        pitch: this.settings.mode === 'human_calm_female' ? 0.96 : 0.85,
        rate: this.settings.speechPace * 0.95
      });
    }
  }

  public testVoiceSample(lang: Language = 'ar') {
    const sample =
      lang === 'ar'
        ? 'مرحباً بك في نَفَس... خُذ شهيقاً عميقاً، ودع كتفيك تسترخيان بسلام.'
        : 'Welcome to Nafas. Take a deep, gentle breath in, and let your shoulders relax.';
    this.speakText(sample, lang);
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceGuide = new VoiceGuideService();
