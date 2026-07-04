<script lang="ts">
  import { fly } from 'svelte/transition';
  import { Tween } from 'svelte/motion';
  import { Timer } from '../lib/timer.svelte';
  import { persisted } from '../lib/persisted.svelte';
  import { slideIn, slideOut } from '../lib/transitions';
  import {
    notifyPhaseEnd,
    shouldPromptForPermission,
  } from '../lib/notifications';
  import NotificationPrompt from './NotificationPrompt.svelte';

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
      if (record.completed) {
        void notifyPhaseEnd(record.type);
      }
    },
  );

  let permissionPromptVisible = $state(false);

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
  const clockText = $derived(
    timer.phase === 'focus'
      ? formatClock(timer.elapsedMs)
      : timer.phase === 'break'
        ? formatClock(remainingTween.current)
        : null,
  );

  function handleClick(): void {
    if (timer.phase !== 'idle') {
      timer.stop();
      return;
    }
    if (shouldPromptForPermission()) {
      permissionPromptVisible = true;
      return;
    }
    timer.start();
  }

  function handlePromptDone(): void {
    permissionPromptVisible = false;
    timer.start();
  }

  function formatClock(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="stack">
  {#key permissionPromptVisible ? 'prompt' : timer.phase}
    <div class="screen" in:fly={slideIn} out:fly={slideOut}>
      {#if permissionPromptVisible}
        <NotificationPrompt onDone={handlePromptDone} />
      {:else}
        <p class="label">{phaseLabel}</p>

        {#if clockText !== null}
          <p class="clock">{clockText}</p>
        {/if}

        <button class="action" onclick={handleClick}>{buttonLabel}</button>
      {/if}
    </div>
  {/key}
</div>

<style>
  /* Outgoing and incoming screens share the same grid cell, so the
     whole view slides as one unit with no layout shift. */
  .stack {
    display: grid;
    justify-items: center;
    align-items: center;
  }

  .stack > .screen {
    grid-area: 1 / 1;
  }

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
