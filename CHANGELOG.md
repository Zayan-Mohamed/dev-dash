# Changelog

All notable changes to DevDash will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-08

### 🎉 Initial Release

This is the first stable release of **DevDash** — a zero-latency, keyboard-first developer new tab extension for Chrome.

### Added

#### Core Infrastructure

- Svelte 5 (runes) + SvelteKit + TypeScript strict-mode project setup
- Vite build pipeline with post-build CSP fix script
- Chrome Manifest V3 with `topSites`, `storage`, `system.cpu`, `system.memory` permissions
- `chrome.storage.local` wrapper service with `localStorage` fallback for development
- `chrome.topSites` service with mock data fallback for localhost development

#### Widgets

- **Clock** — Large digital clock with configurable 12/24h format and dynamic time-of-day greeting
- **Top Sites** — Most-visited sites grid pulled from Chrome history
- **Omnibar** — Terminal-style command palette with command history stored in `chrome.storage.local`
  - `g <query>` → Google Search
  - `gh <query>` → GitHub Search
  - `l <port>` → Open `localhost:<port>`
  - Bare URL → Navigate directly
  - Any other input → Google Search
- **Pomodoro Timer** — Focus/break interval timer with configurable durations
- **Notepad** — Persistent scratchpad with auto-save and a fullscreen focused mode
- **Weather** — Local weather widget (requires geolocation)
- **Compact Weather** — Minimal weather display for the navigation header
- **Tech News** — Latest developer news feed
- **GitHub Stats** — Personal GitHub activity & contribution stats (requires token)
- **System Stats** — Real-time CPU and memory usage in the navigation header

#### UI & UX

- GitHub Dark Dimmed design system (`#0d1117` background, `#58a6ff` accent)
- JetBrains Mono / system monospace font stack
- Tailwind CSS v4 with CSS-first configuration (no `tailwind.config.js`)
- Responsive `ViewportLayout` grid with configurable widget slots
- `NavigationHeader` with compact system stats and weather
- `Settings` modal — toggle 12/24h clock, show/hide widgets, GitHub token, custom links
- Keyboard shortcuts: `Ctrl/Cmd + ,` (Settings), `Escape` (close modals), `↑/↓` (Omnibar history)
- Zero white-flash on load (`background: #0d1117` in `app.html`)

#### Developer Experience

- ESLint + Prettier with Svelte plugin
- Vitest unit testing setup
- Playwright E2E testing setup
- `pnpm` workspace configuration
- Strict TypeScript — no `any`, no implicit `any`

### Contributors

- **Zayan Mohamed** ([@Zayan-Mohamed](https://github.com/Zayan-Mohamed)) — Project author
- **Duwaragie Kugaraj** ([@duwaragie](https://github.com/duwaragie)) — UI revamp
- **ERJavier** ([@ERJavier](https://github.com/ERJavier)) — CPU/Memory usage widgets

---

<!-- Links -->

[1.0.0]: https://github.com/Zayan-Mohamed/dev-dash/releases/tag/v1.0.0
