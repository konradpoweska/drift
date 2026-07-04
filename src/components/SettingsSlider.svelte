<script lang="ts">
  import { Slider } from 'melt/builders';

  interface Props {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    formatValue: (value: number) => string;
    onValueChange: (value: number) => void;
  }

  let { label, min, max, step, value, formatValue, onValueChange }: Props =
    $props();

  const slider = new Slider({
    min: () => min,
    max: () => max,
    step: () => step,
    value: () => value,
    onValueChange: (newValue) => onValueChange(newValue),
  });
</script>

<div class="field">
  <div class="labelRow">
    <span>{label}</span>
    <span class="value">{formatValue(value)}</span>
  </div>
  <div {...slider.root} class="root">
    <div class="track"></div>
    <div class="fill"></div>
    <div {...slider.thumb} class="thumb"></div>
  </div>
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .labelRow {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }

  .value {
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .root {
    position: relative;
    height: 1.5rem;
    display: flex;
    align-items: center;
  }

  .track {
    position: absolute;
    inset-inline: 0;
    height: 4px;
    border-radius: 999px;
    background-color: var(--color-border);
  }

  .fill {
    position: absolute;
    left: 0;
    height: 4px;
    width: var(--percentage);
    border-radius: 999px;
    background-color: var(--color-text);
  }

  .thumb {
    position: absolute;
    left: var(--percentage);
    translate: -50% 0;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: var(--color-text);
  }

  .thumb:focus-visible {
    outline: 2px solid var(--color-text);
    outline-offset: 2px;
  }
</style>
