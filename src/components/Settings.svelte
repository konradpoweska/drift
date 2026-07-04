<script lang="ts">
  import { persisted } from '../lib/persisted.svelte';
  import SettingsSlider from './SettingsSlider.svelte';

  const MS_PER_MINUTE = 60_000;
  const SLIDER_STEP_MINUTES = 1;
  const FOCUS_SLIDER_MIN_MINUTES = 5;
  const FOCUS_SLIDER_MAX_MINUTES = 60;
  const BREAK_SLIDER_MIN_MINUTES = 1;
  const BREAK_SLIDER_MAX_MINUTES = 20;

  function msToMinutes(ms: number): number {
    return Math.round(ms / MS_PER_MINUTE);
  }

  function minutesToMs(minutes: number): number {
    return minutes * MS_PER_MINUTE;
  }

  function formatMinutes(minutes: number): string {
    return `${minutes} min`;
  }
</script>

<section class="panel">
  <h2 class="heading">Settings</h2>

  <div class="group">
    <h3 class="groupHeading">Focus</h3>
    <SettingsSlider
      label="Min duration"
      min={FOCUS_SLIDER_MIN_MINUTES}
      max={FOCUS_SLIDER_MAX_MINUTES}
      step={SLIDER_STEP_MINUTES}
      value={msToMinutes(persisted.settings.focusMinMs)}
      formatValue={formatMinutes}
      onValueChange={(minutes) => persisted.setFocusMinMs(minutesToMs(minutes))}
    />
    <SettingsSlider
      label="Max duration"
      min={FOCUS_SLIDER_MIN_MINUTES}
      max={FOCUS_SLIDER_MAX_MINUTES}
      step={SLIDER_STEP_MINUTES}
      value={msToMinutes(persisted.settings.focusMaxMs)}
      formatValue={formatMinutes}
      onValueChange={(minutes) => persisted.setFocusMaxMs(minutesToMs(minutes))}
    />
  </div>

  <div class="group">
    <h3 class="groupHeading">Break</h3>
    <SettingsSlider
      label="Min duration"
      min={BREAK_SLIDER_MIN_MINUTES}
      max={BREAK_SLIDER_MAX_MINUTES}
      step={SLIDER_STEP_MINUTES}
      value={msToMinutes(persisted.settings.breakMinMs)}
      formatValue={formatMinutes}
      onValueChange={(minutes) => persisted.setBreakMinMs(minutesToMs(minutes))}
    />
    <SettingsSlider
      label="Max duration"
      min={BREAK_SLIDER_MIN_MINUTES}
      max={BREAK_SLIDER_MAX_MINUTES}
      step={SLIDER_STEP_MINUTES}
      value={msToMinutes(persisted.settings.breakMaxMs)}
      formatValue={formatMinutes}
      onValueChange={(minutes) => persisted.setBreakMaxMs(minutesToMs(minutes))}
    />
  </div>
</section>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 24rem;
    padding: 1rem 1.5rem;
  }

  .heading {
    font-size: 1rem;
    font-weight: 600;
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .groupHeading {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
  }
</style>
