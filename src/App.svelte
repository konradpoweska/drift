<script lang="ts">
  import { fly } from 'svelte/transition';
  import MainScreen from './components/MainScreen.svelte';
  import Settings from './components/Settings.svelte';
  import {
    SLIDE_DISTANCE_PX,
    SLIDE_TRANSITION_MS,
    slideIn,
    slideOut,
  } from './lib/transitions';

  let settingsOpen = $state(false);

  function toggleSettings(): void {
    settingsOpen = !settingsOpen;
  }
</script>

<main
  style:--slide-duration="{SLIDE_TRANSITION_MS}ms"
  style:--slide-distance="{SLIDE_DISTANCE_PX}px"
>
  <!-- Always mounted (even while hidden behind Settings) so its Timer
       instance keeps running instead of being destroyed and recreated. -->
  <div class="view" class:hidden={settingsOpen} inert={settingsOpen}>
    <MainScreen />
  </div>

  {#if settingsOpen}
    <div class="view" in:fly={slideIn} out:fly={slideOut}>
      <Settings />
    </div>
  {/if}

  <button
    class="toggle"
    onclick={toggleSettings}
    aria-label={settingsOpen ? 'Close settings' : 'Open settings'}
  >
    {#if !settingsOpen}
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="3"></circle>
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        ></path>
      </svg>
    {:else}
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    {/if}
  </button>
</main>

<style>
  main {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 100dvh;
    color: var(--color-text);
  }

  /* Outgoing and incoming views share the same grid cell so the
     switch animates in place without any layout shift. */
  .view {
    grid-area: 1 / 1;
    width: 100%;
    display: flex;
    justify-content: center;
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity var(--slide-duration) ease,
      transform var(--slide-duration) ease;
  }

  /* `inert` (set alongside this class) already removes the hidden view
     from interaction, focus, and the accessibility tree — opacity alone
     covers the visual, so there's no `visibility` delay to keep in sync
     across both transition directions. */
  .view.hidden {
    opacity: 0;
    transform: translateY(calc(-1 * var(--slide-distance)));
  }

  .toggle {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
  }

  .toggle:hover {
    background-color: var(--color-surface);
    color: var(--color-text);
  }
</style>
