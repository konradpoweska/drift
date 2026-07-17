<script lang="ts">
  import { fly } from 'svelte/transition';
  import { timer } from '../lib/timer.svelte';
  import { persisted } from '../lib/persisted.svelte';
  import { slideIn, slideOut } from '../lib/transitions';
  import { shouldPromptForPermission } from '../lib/notifications';
  import NotificationPrompt from './NotificationPrompt.svelte';

  let permissionPromptVisible = $state(false);

  const hasHistory = $derived(Object.keys(persisted.events).length > 0);
  const phaseLabel = $derived(
    timer.phase === 'focus'
      ? timer.paused
        ? 'Focus · Paused'
        : 'Focus'
      : timer.phase === 'break'
        ? timer.paused
          ? 'Break · Paused'
          : 'Break'
        : 'Ready',
  );
  const startLabel = $derived(
    hasHistory ? 'Start next session' : 'Start focus',
  );
  const pauseLabel = $derived(timer.paused ? 'Resume' : 'Pause');
  const clockText = $derived(
    timer.phase === 'focus'
      ? formatClock(timer.elapsedMs)
      : timer.phase === 'break'
        ? formatClock(timer.remainingMs)
        : null,
  );

  function handleClick(): void {
    if (shouldPromptForPermission()) {
      permissionPromptVisible = true;
      return;
    }
    timer.start();
  }

  function handlePauseClick(): void {
    if (timer.paused) {
      timer.resume();
    } else {
      timer.pause();
    }
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

        {#if timer.phase === 'idle'}
          <button class="action" onclick={handleClick}>{startLabel}</button>
        {:else}
          <div class="controls">
            <button class="action" onclick={handlePauseClick}
              >{pauseLabel}</button
            >
            <button class="secondary danger" onclick={() => timer.stop()}
              >Stop</button
            >
          </div>
        {/if}
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

  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .secondary {
    padding: 0.5rem 1.25rem;
    border: none;
    background: none;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    cursor: pointer;
  }

  .secondary:hover {
    color: var(--color-text);
  }

  .secondary.danger {
    color: var(--color-danger-muted);
  }

  .secondary.danger:hover {
    color: var(--color-danger);
  }
</style>
