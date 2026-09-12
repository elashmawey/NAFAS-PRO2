import { HealthEcosystemStatus, MindfulSession } from '../types';

const STORAGE_KEY = 'nafas_health_ecosystem_v1';

class HealthConnectService {
  private status: HealthEcosystemStatus = {
    appleHealthConnected: false,
    healthConnectConnected: false,
    autoSync: true,
    weeklyTargetMinutes: 70,
    recentSessions: []
  };

  constructor() {
    this.loadData();
    this.detectNativeBridges();
  }

  private loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.status = { ...this.status, ...JSON.parse(saved) };
      }
    } catch {
      // Use defaults
    }
  }

  private saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.status));
    } catch {
      // Ignored
    }
  }

  private detectNativeBridges() {
    if (typeof window === 'undefined') return;

    // Check for iOS HealthKit WebKit bridge
    const win = window as unknown as {
      webkit?: {
        messageHandlers?: {
          healthKit?: { postMessage: (msg: unknown) => void };
        };
      };
      HealthConnectNative?: {
        syncSession: (json: string) => void;
      };
    };

    if (win.webkit?.messageHandlers?.healthKit) {
      this.status.appleHealthConnected = true;
    }
    if (win.HealthConnectNative) {
      this.status.healthConnectConnected = true;
    }
  }

  public getStatus(): HealthEcosystemStatus {
    return { ...this.status };
  }

  public toggleAppleHealth(connected: boolean) {
    this.status.appleHealthConnected = connected;
    this.saveData();
  }

  public toggleHealthConnect(connected: boolean) {
    this.status.healthConnectConnected = connected;
    this.saveData();
  }

  public toggleAutoSync(auto: boolean) {
    this.status.autoSync = auto;
    this.saveData();
  }

  public setWeeklyTarget(minutes: number) {
    this.status.weeklyTargetMinutes = Math.max(10, minutes);
    this.saveData();
  }

  public recordSession(params: {
    durationSeconds: number;
    breathsCount: number;
    patternId: string;
    patternName: string;
    avgHeartRate?: number;
    stressBefore?: number;
    stressAfter?: number;
  }): MindfulSession {
    const now = new Date();
    const startTime = new Date(now.getTime() - params.durationSeconds * 1000).toISOString();
    const endTime = now.toISOString();
    const durationMinutes = Math.max(1, Math.round(params.durationSeconds / 60));

    const session: MindfulSession = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      startTime,
      endTime,
      durationMinutes,
      breathsCount: params.breathsCount,
      patternId: params.patternId,
      patternName: params.patternName,
      avgHeartRate: params.avgHeartRate,
      stressBefore: params.stressBefore,
      stressAfter: params.stressAfter,
      syncedToAppleHealth: false,
      syncedToHealthConnect: false
    };

    // Auto-sync if platform is marked connected or autoSync enabled
    if (this.status.autoSync) {
      session.syncedToAppleHealth = this.syncToAppleHealthBridge(session);
      session.syncedToHealthConnect = this.syncToHealthConnectBridge(session);
    }

    this.status.recentSessions.unshift(session);
    if (this.status.recentSessions.length > 50) {
      this.status.recentSessions.pop();
    }
    this.status.lastSyncTimestamp = new Date().toISOString();
    this.saveData();

    return session;
  }

  private syncToAppleHealthBridge(session: MindfulSession): boolean {
    const win = window as unknown as {
      webkit?: {
        messageHandlers?: {
          healthKit?: { postMessage: (msg: unknown) => void };
        };
      };
    };

    if (win.webkit?.messageHandlers?.healthKit) {
      try {
        win.webkit.messageHandlers.healthKit.postMessage({
          type: 'SAVE_MINDFUL_SESSION',
          identifier: 'HKCategoryTypeIdentifierMindfulSession',
          startDate: session.startTime,
          endDate: session.endTime,
          metadata: {
            HKMetadataKeySessionTitle: session.patternName,
            breaths: session.breathsCount,
            heartRate: session.avgHeartRate
          }
        });
        return true;
      } catch {
        return false;
      }
    }
    return this.status.appleHealthConnected;
  }

  private syncToHealthConnectBridge(session: MindfulSession): boolean {
    const win = window as unknown as {
      HealthConnectNative?: {
        syncSession: (json: string) => void;
      };
    };

    if (win.HealthConnectNative) {
      try {
        win.HealthConnectNative.syncSession(
          JSON.stringify({
            recordType: 'MindfulSessionRecord',
            startTime: session.startTime,
            endTime: session.endTime,
            title: `Nafas - ${session.patternName}`,
            notes: `${session.breathsCount} mindful breaths recorded in Nafas`
          })
        );
        return true;
      } catch {
        return false;
      }
    }
    return this.status.healthConnectConnected;
  }

  public getWeeklyMinutes(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return this.status.recentSessions
      .filter((s) => new Date(s.endTime) >= oneWeekAgo)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  }

  public getTotalMinutes(): number {
    return this.status.recentSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  }

  /**
   * Generates standard Apple HealthKit XML format export
   */
  public generateAppleHealthXML(): string {
    const sessions = this.status.recentSessions;
    const records = sessions
      .map(
        (s) => `  <Record type="HKCategoryTypeIdentifierMindfulSession" sourceName="Nafas" sourceVersion="3.0" unit="" creationDate="${s.endTime}" startDate="${s.startTime}" endDate="${s.endTime}">
    <MetadataEntry key="HKMetadataKeySessionTitle" value="${s.patternName}"/>
    <MetadataEntry key="BreathsCompleted" value="${s.breathsCount}"/>
    ${s.avgHeartRate ? `<MetadataEntry key="HeartRateBPM" value="${s.avgHeartRate}"/>` : ''}
  </Record>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE HealthData [
  <!ELEMENT HealthData (ExportDate, Record*)>
  <!ELEMENT ExportDate EMPTY>
  <!ATTLIST ExportDate value CDATA #REQUIRED>
  <!ELEMENT Record (MetadataEntry*)>
  <!ATTLIST Record
    type CDATA #REQUIRED
    sourceName CDATA #REQUIRED
    sourceVersion CDATA #REQUIRED
    creationDate CDATA #REQUIRED
    startDate CDATA #REQUIRED
    endDate CDATA #REQUIRED
  >
  <!ELEMENT MetadataEntry EMPTY>
  <!ATTLIST MetadataEntry key CDATA #REQUIRED value CDATA #REQUIRED>
]>
<HealthData>
  <ExportDate value="${new Date().toISOString()}"/>
${records}
</HealthData>`;
  }

  /**
   * Generates standard Android Google Health Connect JSON export
   */
  public generateGoogleHealthConnectJSON(): string {
    const payload = {
      exportTime: new Date().toISOString(),
      clientPackage: 'com.nafas.wellness',
      records: this.status.recentSessions.map((s) => ({
        recordType: 'androidx.health.connect.client.records.MindfulSessionRecord',
        startTime: s.startTime,
        endTime: s.endTime,
        durationMinutes: s.durationMinutes,
        title: `Nafas - ${s.patternName}`,
        metadata: {
          dataOrigin: 'com.nafas.wellness',
          recordingMethod: 'RECORDING_METHOD_ACTIVELY_RECORDED',
          device: {
            manufacturer: 'Web Client',
            model: 'Nafas Progressive Web App'
          }
        },
        heartRateMetrics: s.avgHeartRate
          ? {
              averageBpm: s.avgHeartRate,
              sampleTime: s.endTime
            }
          : null
      }))
    };

    return JSON.stringify(payload, null, 2);
  }

  public downloadAppleHealthExport() {
    const xml = this.generateAppleHealthXML();
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nafas-apple-health-${new Date().toISOString().slice(0, 10)}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public downloadHealthConnectExport() {
    const json = this.generateGoogleHealthConnectJSON();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nafas-health-connect-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const healthConnect = new HealthConnectService();
