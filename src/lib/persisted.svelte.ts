export interface Settings {
  focusMinMs: number;
  focusMaxMs: number;
  breakMinMs: number;
  breakMaxMs: number;
  updatedAt: number;
  deviceId: string;
}

export interface SessionEvent {
  id: string;
  deviceId: string;
  type: 'focus' | 'break';
  startedAt: number;
  durationMs: number;
  completed: boolean;
}

interface PersistedData {
  version: 1;
  deviceId: string;
  settings: Settings;
  events: Record<string, SessionEvent>;
}

const STORAGE_KEY = 'drift';

const DEFAULT_FOCUS_MIN_MS = 20 * 60 * 1000;
const DEFAULT_FOCUS_MAX_MS = 35 * 60 * 1000;
const DEFAULT_BREAK_MIN_MS = 5 * 60 * 1000;
const DEFAULT_BREAK_MAX_MS = 10 * 60 * 1000;

export class PersistedStore {
  private data = $state<PersistedData>(loadData());

  get deviceId(): string {
    return this.data.deviceId;
  }

  get settings(): Settings {
    return this.data.settings;
  }

  get events(): Record<string, SessionEvent> {
    return this.data.events;
  }

  setFocusMinMs(ms: number): void {
    this.writeSettings({
      focusMinMs: Math.min(ms, this.data.settings.focusMaxMs),
    });
  }

  setFocusMaxMs(ms: number): void {
    this.writeSettings({
      focusMaxMs: Math.max(ms, this.data.settings.focusMinMs),
    });
  }

  setBreakMinMs(ms: number): void {
    this.writeSettings({
      breakMinMs: Math.min(ms, this.data.settings.breakMaxMs),
    });
  }

  setBreakMaxMs(ms: number): void {
    this.writeSettings({
      breakMaxMs: Math.max(ms, this.data.settings.breakMinMs),
    });
  }

  addEvent(event: SessionEvent): void {
    this.data = {
      ...this.data,
      events: { ...this.data.events, [event.id]: event },
    };
    saveData(this.data);
  }

  private writeSettings(
    partial: Partial<Omit<Settings, 'updatedAt' | 'deviceId'>>,
  ): void {
    this.data = {
      ...this.data,
      settings: {
        ...this.data.settings,
        ...partial,
        updatedAt: Date.now(),
      },
    };
    saveData(this.data);
  }
}

export const persisted = new PersistedStore();

function loadData(): PersistedData {
  const raw =
    typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem(STORAGE_KEY);
  if (raw === null) return createDefaultData();

  try {
    return JSON.parse(raw) as PersistedData;
  } catch {
    return createDefaultData();
  }
}

function saveData(data: PersistedData): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function createDefaultData(): PersistedData {
  const deviceId = crypto.randomUUID();
  return {
    version: 1,
    deviceId,
    settings: {
      focusMinMs: DEFAULT_FOCUS_MIN_MS,
      focusMaxMs: DEFAULT_FOCUS_MAX_MS,
      breakMinMs: DEFAULT_BREAK_MIN_MS,
      breakMaxMs: DEFAULT_BREAK_MAX_MS,
      updatedAt: Date.now(),
      deviceId,
    },
    events: {},
  };
}
