export type Language = 'ar' | 'en';

export type SceneType = 'default' | 'ocean' | 'desert' | 'mountains' | 'forest' | 'moonlake';

export interface Phase {
  k: 'in' | 'hold' | 'out';
  s: number;
}

export interface BreathingPattern {
  id: string;
  nameKey: string;
  cycles: number;
  phases: Phase[];
  descriptionKey: string;
  accentColor: string;
  hue: number;
}

export type VoiceGuideMode = 'human_warm' | 'human_calm_female' | 'neural_tts' | 'chimes_only';

export interface VoiceSettings {
  mode: VoiceGuideMode;
  volume: number; // 0 - 100
  speechPace: number; // 0.7 - 1.2
  warmth: boolean; // Studio acoustic warmth emulation filter
  speakPhases: boolean; // Speak "شهيق عميق", "احبس النفس", "زفير هادئ"
  mindfulReminders: boolean; // Periodic mindful relaxation cues ("أرخِ فكك وكتفيك")
}

export interface MindfulSession {
  id: string;
  startTime: string; // ISO string
  endTime: string;
  durationMinutes: number;
  breathsCount: number;
  patternId: string;
  patternName: string;
  avgHeartRate?: number;
  stressBefore?: number;
  stressAfter?: number;
  syncedToAppleHealth: boolean;
  syncedToHealthConnect: boolean;
}

export interface HealthEcosystemStatus {
  appleHealthConnected: boolean;
  healthConnectConnected: boolean;
  autoSync: boolean;
  weeklyTargetMinutes: number;
  lastSyncTimestamp?: string;
  recentSessions: MindfulSession[];
}

export type ProceduralTrackId =
  | 'rain'
  | 'ocean'
  | 'brown'
  | 'om'
  | 'theta'
  | 'solfeggio'
  | 'fire'
  | 'delta'
  | 'pure432'
  | 'harp'
  | 'tibetan'
  | 'wind';

export interface SoundTrackInfo {
  id: ProceduralTrackId;
  nameKey: string;
  freqLabel: string;
  isPro?: boolean;
}

export interface CoachMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SmokerRecoveryStatus {
  isSmoker: boolean;
  quitDate?: string;
  cigarettesPerDay?: number;
  completedDetoxSessions: number;
}
