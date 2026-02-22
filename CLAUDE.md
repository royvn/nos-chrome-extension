# CLAUDE.md

This file provides context for AI assistants working in this codebase.

## Project Overview

NOS Chrome Extension is an unofficial Chrome extension that displays NOS (Dutch public broadcaster) RSS feeds in a browser popup. Users can choose from 15 news/sport categories, configure how many articles to show, toggle dark mode, and receive badge notifications for new articles.

- **Manifest Version:** 3 (MV3)
- **Language:** All UI text is in Dutch (nl-NL)
- **Package manager:** pnpm (preferred) or npm

---

## Repository Structure

```
nos-chrome-extension/
├── src/
│   ├── components/
│   │   ├── ArticleItem.vue     # Renders a single article row (thumbnail + title + date)
│   │   ├── NewsView.vue        # Main feed view: header bar + article list
│   │   └── SettingsView.vue    # Settings view: feed selector + max-items slider
│   ├── images/                 # Extension icons (16/32/48/128 px) and screenshots
│   ├── App.vue                 # Root component; owns all shared state
│   ├── background.js           # Service worker: periodic badge updates
│   ├── feed.js                 # Feed constants, RSS parsing utilities
│   ├── main.js                 # Vue app entry point (mounts App.vue to #app)
│   ├── manifest.json           # Chrome extension manifest (MV3)
│   ├── popup.html              # Extension popup shell HTML
│   └── theme.css               # Tailwind CSS v4 input file
├── rollup.config.mjs           # Rollup build configuration (two bundles)
├── package.json
├── pnpm-lock.yaml
└── dist/                       # Build output — gitignored, load this folder in Chrome
```

---

## Tech Stack

| Tool | Version | Role |
|------|---------|------|
| Vue 3 | ^3.5 | UI framework (Composition API, `<script setup>`) |
| Rollup | ^4 | Module bundler |
| Tailwind CSS | ^4.2 | Utility-first CSS |
| `@vue/compiler-sfc` | ^3.5 | Compiles `.vue` single-file components |
| `rollup-plugin-vue` | ^6 | Rollup integration for SFCs |
| `@rollup/plugin-replace` | ^5 | Inlines compile-time constants |
| `rollup-plugin-copy` | ^3.5 | Copies static assets to `dist/` |

---

## Build System

### Commands

```bash
pnpm build   # Production build: Rollup + minified Tailwind CSS → dist/
pnpm watch   # Development: Rollup + Tailwind in watch mode (parallel)
```

### Two Rollup Bundles

**1. Popup bundle** (`src/main.js` → `dist/popup.js`)
- Compiles Vue SFCs, resolves node modules, inlines env constants
- Also copies static files to `dist/`: `popup.html`, `manifest.json`, and all icon PNGs

**2. Background service worker bundle** (`src/background.js` → `dist/background.js`)
- Lightweight; no Vue dependency — only `@rollup/plugin-node-resolve`

### Tailwind CSS

- Input: `src/theme.css` (imports tailwindcss, scans `popup.html`, `main.js`, `**/*.vue`)
- Output: `dist/popup.css` (minified in production)
- Dark mode uses a custom variant: `@variant dark (&:where(.dark, .dark *))` (class-based, toggled on `<html>`)

---

## Architecture

### State Management

All shared state lives in `src/App.vue` using Vue 3 Composition API (`ref`, `computed`). There is no Vuex/Pinia. State is passed down as props and changes bubble up via `$emit`.

```
App.vue (state owner)
├── NewsView.vue    (props: articles, loading, error, feedTitle, isDark)
│   └── ArticleItem.vue (props: article)
└── SettingsView.vue (props: currentFeedUrl, maxItems)
```

### View Switching

`App.vue` uses a `currentView` ref (`"news"` | `"settings"`) and a `v-if`/`v-else` to swap between `NewsView` and `SettingsView`. There is no router.

### Persistence (Chrome Storage)

All user preferences are persisted to `chrome.storage.local`. Storage keys are defined as named exports in `src/feed.js`:

| Constant | Key | Type | Description |
|----------|-----|------|-------------|
| `STORAGE_KEY_FEED_URL` | `"feedUrl"` | string | Selected feed URL |
| `STORAGE_KEY_MAX_ITEMS` | `"maxItems"` | number | Articles to display |
| `STORAGE_KEY_LAST_SEEN` | `"lastSeenLinks"` | string[] | Links seen; used for badge diff |
| *(inline in App.vue)* | `"darkMode"` | boolean | Dark mode preference |

Settings are loaded in `App.vue`'s `onMounted` hook and persisted immediately on every change.

### Badge Notifications

`src/background.js` runs as a MV3 service worker:
- Sets up a `chrome.alarms` alarm named `"checkFeed"` on install, firing every **1 minute**
- On each alarm: fetches the current feed URL, extracts links with `parseFeedLinksOnly` (regex-based, no `DOMParser`), compares against `lastSeenLinks` in storage, and updates the badge text (capped at `"10+"`)
- The popup clears the badge on open by sending a `{ type: "clearBadge", links }` message to the service worker

### RSS Parsing (Dual Strategy)

`src/feed.js` exports two parsers:

- **`parseFeedLinksOnly(xmlString, maxItems)`** — Regex-based, for use in the service worker where `DOMParser` is unavailable. Returns `string[]` of article URLs.
- **`parseFeed(xmlString, maxItems)`** — `DOMParser`-based, for use in the popup. Returns `{ title, link, imageUrl, pubDate }[]`.

---

## Chrome Extension APIs Used

- `chrome.storage.local` — persistent preferences and seen-links tracking
- `chrome.alarms` — periodic background feed checks (requires `"alarms"` permission)
- `chrome.action.setBadgeText` / `setBadgeBackgroundColor` — unread count badge
- `chrome.runtime.onInstalled` — alarm setup on first install
- `chrome.runtime.onMessage` / `sendMessage` — popup → service worker communication
- `fetch` — cross-origin RSS fetch (requires `"https://feeds.nos.nl/*"` host permission)

---

## Code Conventions

### Vue Components

- All components use `<script setup>` syntax (Vue 3 Composition API)
- Props validated with `defineProps()`, events declared with `defineEmits()`
- No Options API; no `this`
- Child components never mutate parent state — they emit events

### Styling

- Tailwind CSS v4 utility classes everywhere; no custom CSS except in `theme.css`
- Dark mode: add `dark:` prefix to any Tailwind class; controlled by `.dark` on `<html>`
- Two shared utility classes defined in `theme.css`: `.status` and `.status.error`
- Animations: Vue `<Transition name="slide-up">` with CSS defined in `theme.css`
- Inline SVG icons; decorative SVGs use `aria-hidden="true"`

### Accessibility

- All interactive elements have `title` and `aria-label` attributes (in Dutch)
- Article list uses `aria-live="polite"`
- Loading state communicated via `aria-busy` on the refresh button
- Links open with `target="_blank" rel="noopener noreferrer"`

### Error Handling

- Async functions in both the popup and service worker use `try/catch`
- Error messages displayed to users are in Dutch
- Feed parse errors detected via `doc.querySelector("parseerror")`
- Service worker errors are logged to the console: `console.error("[NOS] ...")`

### Localization

- All user-facing text is in Dutch
- Dates formatted with `toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })`
- `popup.html` has `lang="nl"`

---

## Available Feeds

Feeds are defined in `src/feed.js` as the `FEEDS` array. The default is `FEEDS[0]` (Nieuws / Algemeen). All feed URLs follow the pattern `https://feeds.nos.nl/<slug>`.

**Nieuws:** Algemeen, Binnenland, Buitenland, Politiek, Economie, Opmerkelijk, Koningshuis, Cultuur & media, Tech

**Sport:** Algemeen, Voetbal, Wielrennen, Schaatsen, Tennis, Formule 1

---

## Development Workflow

### Setup

```bash
pnpm install
pnpm build
```

### Loading in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

### Iterating

```bash
pnpm watch   # Rebuilds on every source file change
```

After each rebuild, click the refresh icon on the extension card in `chrome://extensions`.

### No Tests

There is currently no test framework configured. When adding tests, consider Vitest (compatible with the ES module setup).

---

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `src/feed.js` | Feed list, storage key constants, RSS parsers |
| `src/App.vue` | Root component; all shared state and Chrome storage I/O |
| `src/background.js` | Service worker; badge logic |
| `src/components/NewsView.vue` | Header bar and article list layout |
| `src/components/ArticleItem.vue` | Single article row with thumbnail and date |
| `src/components/SettingsView.vue` | Feed selector and max-items slider |
| `src/theme.css` | Tailwind input; dark variant, `.status`, slide-up animation |
| `rollup.config.mjs` | Build config for popup and background bundles |
| `src/manifest.json` | Chrome extension manifest (permissions, icons, service worker) |
| `dist/` | Build output loaded by Chrome (gitignored) |
