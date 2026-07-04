<script lang="ts">
  import { fade } from 'svelte/transition';
  import { Tween } from 'svelte/motion';
  import { Timer } from '../lib/timer.svelte';
  import { persisted } from '../lib/persisted.svelte';

  const LABEL_TRANSITION_MS = 200;
  const COUNTDOWN_TWEEN_MS = 200;

  const timer = new Timer(
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
    },
  );

  $effect(() => {
    return () => timer.destroy();
  });

  const remainingTween = Tween.of(() => timer.remainingMs, {
    duration: COUNTDOWN_TWEEN_MS,
  });

  const hasHistory = $derived(Object.keys(persisted.events).length > 0);
  const phaseLabel = $derived(
    timer.phase === 'focus'
      ? 'Focus'
      : timer.phase === 'break'
        ? 'Break'
        : 'Ready',
  );
  const startLabel = $derived(
    hasHistory ? 'Start next session' : 'Start focus',
  );
  const buttonLabel = $derived(timer.phase === 'idle' ? startLabel : 'Stop');

  function handleClick(): void {
    if (timer.phase === 'idle') {
      timer.start();
    } else {
      timer.stop();
    }
  }

  function formatClock(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="screen">
  {#key timer.phase}
    <p class="label" transition:fade={{ duration: LABEL_TRANSITION_MS }}>
      {phaseLabel}
    </p>
  {/key}

  {#if timer.phase === 'focus'}
    <p class="clock">{formatClock(timer.elapsedMs)}</p>
  {:else if timer.phase === 'break'}
    <p class="clock">{formatClock(remainingTween.current)}</p>
  {/if}

  <button class="action" onclick={handleClick}>{buttonLabel}</button>
</div>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .label {
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
  }

  .clock {
    font-size: 3.5rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .action {
    padding: 0.75rem 2rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background-color: var(--color-surface);
    color: var(--color-text);
    font-size: 1rem;
    cursor: pointer;
  }

  .action:hover {
    background-color: var(--color-border);
  }
</style>
