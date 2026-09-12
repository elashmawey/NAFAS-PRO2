export interface MilestoneBadge {
  id: string;
  icon: string;
  title: { ar: string; en: string };
  desc: { ar: string; en: string };
  unlockedAt?: string;
}

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  lastActiveDate: string;
  unlockedBadges: string[];
}

const STORAGE_KEY = 'nafas_streak_stats_v1';

const ALL_BADGES: MilestoneBadge[] = [
  {
    id: 'first_breath',
    icon: '🌱',
    title: { ar: 'النَفَس الأول', en: 'First Breath' },
    desc: { ar: 'أول جلسة تنفّس واعية مكتملة', en: 'Completed your first mindful breathing session' }
  },
  {
    id: 'clean_lungs',
    icon: '🫁',
    title: { ar: 'رئة نقية', en: 'Pure Lungs' },
    desc: { ar: 'أكملت جلسة تنقية الرئة ومجرى التنفّس (ACBT)', en: 'Completed an ACBT Pulmonary Detox session' }
  },
  {
    id: 'night_healer',
    icon: '🌙',
    title: { ar: 'طارد الأرق', en: 'Night Calm' },
    desc: { ar: 'أكملت رحلة النَفَس نحو النوم العميق', en: 'Completed a deep sleep breath journey' }
  },
  {
    id: 'three_days',
    icon: '🔥',
    title: { ar: 'ثلاثية السكينة', en: '3-Day Momentum' },
    desc: { ar: 'تنفّست لمدة ٣ أيام متتالية دون انقطاع', en: 'Maintained a 3-day consecutive breathing streak' }
  },
  {
    id: 'seven_days',
    icon: '⭐',
    title: { ar: 'أسبوع النور والهدوء', en: '7-Day Master' },
    desc: { ar: '٧ أيام متتالية من التنفّس واليقظة الذهنية', en: 'Completed 7 days in a row of daily mindfulness' }
  },
  {
    id: 'zen_master',
    icon: '🧘',
    title: { ar: 'سيد الحضور الذهني', en: 'Zen Master' },
    desc: { ar: 'تجاوزت 60 دقيقة إجمالية من تمارين التنفّس', en: 'Accumulated over 60 mindful breathing minutes' }
  }
];

class StreakTrackerService {
  private stats: StreakStats = {
    currentStreak: 1,
    bestStreak: 1,
    totalSessions: 3,
    totalMinutes: 18,
    lastActiveDate: new Date().toISOString().split('T')[0],
    unlockedBadges: ['first_breath']
  };

  constructor() {
    this.load();
    this.checkDayRollOver();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.stats = { ...this.stats, ...parsed };
      }
    } catch {
      // ignore
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
    } catch {
      // ignore
    }
  }

  private checkDayRollOver() {
    const today = new Date().toISOString().split('T')[0];
    if (this.stats.lastActiveDate !== today) {
      const last = new Date(this.stats.lastActiveDate);
      const now = new Date(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Continuous next day
      } else if (diffDays > 1) {
        // Streak broken
        this.stats.currentStreak = 1;
      }
    }
  }

  public recordSession(durationMinutes: number, patternId: string): { newlyUnlockedBadge?: MilestoneBadge } {
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = this.stats.lastActiveDate !== today;

    if (isNewDay) {
      const last = new Date(this.stats.lastActiveDate);
      const now = new Date(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        this.stats.currentStreak += 1;
      } else {
        this.stats.currentStreak = 1;
      }
      this.stats.lastActiveDate = today;
    }

    if (this.stats.currentStreak > this.stats.bestStreak) {
      this.stats.bestStreak = this.stats.currentStreak;
    }

    this.stats.totalSessions += 1;
    this.stats.totalMinutes += Math.max(1, Math.round(durationMinutes));

    let newlyUnlockedBadge: MilestoneBadge | undefined;

    const tryUnlock = (badgeId: string) => {
      if (!this.stats.unlockedBadges.includes(badgeId)) {
        this.stats.unlockedBadges.push(badgeId);
        const b = ALL_BADGES.find((x) => x.id === badgeId);
        if (b && !newlyUnlockedBadge) {
          newlyUnlockedBadge = b;
        }
      }
    };

    tryUnlock('first_breath');
    if (patternId.includes('detox') || patternId.includes('pursed')) {
      tryUnlock('clean_lungs');
    }
    if (patternId.includes('insomnia')) {
      tryUnlock('night_healer');
    }
    if (this.stats.currentStreak >= 3) {
      tryUnlock('three_days');
    }
    if (this.stats.currentStreak >= 7) {
      tryUnlock('seven_days');
    }
    if (this.stats.totalMinutes >= 60) {
      tryUnlock('zen_master');
    }

    this.save();
    return { newlyUnlockedBadge };
  }

  public getStats(): StreakStats {
    return { ...this.stats };
  }

  public getAllBadges(): (MilestoneBadge & { isUnlocked: boolean })[] {
    return ALL_BADGES.map((b) => ({
      ...b,
      isUnlocked: this.stats.unlockedBadges.includes(b.id)
    }));
  }
}

export const streakTracker = new StreakTrackerService();
