# Drift

A PWA focus/break timer that exploits variable-ratio reinforcement — the same mechanic behind slot machines and infinite scroll — and redirects it toward sustained work.

**[Try it →](https://konradpoweska.github.io/drift/)**

## How it works

- **Focus phase:** random duration within a range you set, never revealed. The timer only counts up — there's no hint of when it will end.
- **Break phase:** random duration, shown as a countdown.
- Focus ends → break starts automatically, no click needed. Break ends → the app waits for you to start the next session.
- Notifications on every phase transition (while the app is open).
- Installable, offline-capable, no backend, no accounts. All data stays in `localStorage`.

The asymmetry is the whole point: anticipation lives only in focus time, where it's useful for staying on task, not in break time, where it would just be stressful.

## Stack

Vite + Svelte 5 + TypeScript, styled with CSS modules, sliders via Melt UI. No state management library, no backend.

## Development

```sh
npm install
npm run dev      # dev server
npm run check    # typecheck
npm run lint     # eslint
npm run test:e2e # playwright e2e suite
npm run build    # production build
```
