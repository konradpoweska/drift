<script lang="ts">
  import {
    markPromptShown,
    requestNotificationPermission,
  } from '../lib/notifications';

  interface Props {
    onDone: () => void;
  }

  const { onDone }: Props = $props();

  async function enable(): Promise<void> {
    markPromptShown();
    await requestNotificationPermission();
    onDone();
  }

  function skip(): void {
    markPromptShown();
    onDone();
  }
</script>

<div class="prompt">
  <p class="title">Get notified between phases</p>
  <p class="explanation">
    Drift can notify you when a focus session ends and when your break is over —
    useful if you step away from the screen. Notifications only work while the
    app stays open (a background tab or minimized window is fine).
  </p>
  <div class="actions">
    <button class="primary" onclick={enable}>Enable notifications</button>
    <button class="secondary" onclick={skip}>Not now</button>
  </div>
</div>

<style>
  .prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    max-width: 24rem;
    padding: 0 1.5rem;
    text-align: center;
  }

  .title {
    font-size: 1.125rem;
    font-weight: 600;
  }

  .explanation {
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  .actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .primary,
  .secondary {
    padding: 0.75rem 2rem;
    border-radius: 999px;
    font-size: 1rem;
    cursor: pointer;
  }

  .primary {
    border: 1px solid var(--color-border);
    background-color: var(--color-surface);
    color: var(--color-text);
  }

  .primary:hover {
    background-color: var(--color-border);
  }

  .secondary {
    border: none;
    background: transparent;
    color: var(--color-text-muted);
  }

  .secondary:hover {
    color: var(--color-text);
  }
</style>
