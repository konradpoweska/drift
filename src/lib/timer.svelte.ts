import { persisted } from './persisted.svelte';
import { notifyPhaseEnd } from './notifications';

export type Phase = 'idle' | 'focus' | 'break';

export interface PhaseRange {
  minMs: number;
  maxMs: number;
}

export interface PhaseEndRecord {
  type: 'focus' | 'break';
  startedAt: number;
  durationMs: number;
  completed: boolean;
}

const TICK_INTERVAL_MS = 1000;

export class Timer {
  phase = $state<Phase>('idle');
  phaseStartedAt = $state<number | null>(null);
  phaseDurationMs = $state(0);
  private now = $state(Date.now());

  elapsedMs = $derived(
    this.phaseStartedAt === null
      ? 0
      : Math.max(0, this.now - this.phaseStartedAt),
  );
  remainingMs = $derived(Math.max(0, this.phaseDurationMs - this.elapsedMs));

  private getFocusRange: () => PhaseRange;
  private getBreakRange: () => PhaseRange;
  private onPhaseEnd: (record: PhaseEndRecord) => void;
  private intervalId: ReturnType<typeof setInterval> | undefined;

  constructor(
    getFocusRange: () => PhaseRange,
    getBreakRange: () => PhaseRange,
    onPhaseEnd: (record: PhaseEndRecord) => void,
  ) {
    this.getFocusRange = getFocusRange;
    this.getBreakRange = getBreakRange;
    this.onPhaseEnd = onPhaseEnd;
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => this.recompute());
    }
  }

  start(): void {
    if (this.phase !== 'idle') return;
    this.beginPhase('focus');
  }

  stop(): void {
    if (this.phase === 'idle') return;
    this.stopTicking();
    this.now = Date.now();
    this.reportPhaseEnd(false);
    this.phase = 'idle';
    this.phaseStartedAt = null;
    this.phaseDurationMs = 0;
  }

  private beginPhase(phase: 'focus' | 'break'): void {
    const range =
      phase === 'focus' ? this.getFocusRange() : this.getBreakRange();
    this.phase = phase;
    this.phaseStartedAt = Date.now();
    this.phaseDurationMs = randomDurationMs(range);
    this.now = this.phaseStartedAt;
    this.startTicking();
  }

  private startTicking(): void {
    this.stopTicking();
    this.intervalId = setInterval(() => this.recompute(), TICK_INTERVAL_MS);
  }

  private stopTicking(): void {
    if (this.intervalId === undefined) return;
    clearInterval(this.intervalId);
    this.intervalId = undefined;
  }

  private recompute(): void {
    this.now = Date.now();
    if (this.phase === 'idle' || this.phaseStartedAt === null) return;
    if (this.now - this.phaseStartedAt < this.phaseDurationMs) return;

    this.reportPhaseEnd(true);
    if (this.phase === 'focus') {
      this.beginPhase('break');
    } else {
      this.stopTicking();
      this.phase = 'idle';
      this.phaseStartedAt = null;
      this.phaseDurationMs = 0;
    }
  }

  private reportPhaseEnd(completed: boolean): void {
    if (this.phase === 'idle' || this.phaseStartedAt === null) return;
    this.onPhaseEnd({
      type: this.phase,
      startedAt: this.phaseStartedAt,
      durationMs: this.now - this.phaseStartedAt,
      completed,
    });
  }
}

function randomDurationMs(range: PhaseRange): number {
  return range.minMs + Math.random() * (range.maxMs - range.minMs);
}

// A module-level singleton, not owned by any component: switching views
// (e.g. opening Settings) unmounts whatever reads from `timer`, but the
// timer itself keeps ticking and keeps firing notifications regardless.
export const timer = new Timer(
  () => ({
    minMs: persisted.settings.focusMinMs,
    maxMs: persisted.settings.focusMaxMs,
  }),
  () => ({
    minMs: persisted.settings.breakMinMs,
    maxMs: persisted.settings.breakMaxMs,
  }),
  (record) => {
    persisted.addEvent({
      id: crypto.randomUUID(),
      deviceId: persisted.deviceId,
      type: record.type,
      startedAt: record.startedAt,
      durationMs: record.durationMs,
      completed: record.completed,
    });
    if (record.completed) {
      void notifyPhaseEnd(record.type);
    }
  },
);
