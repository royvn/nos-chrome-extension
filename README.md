# NOS Chrome Extension

An unofficial Chrome extension that displays NOS (Dutch public broadcaster) RSS feeds in a browser popup.

> **Note:** This is an unofficial extension not affiliated with or endorsed by NOS.

## Screenshots

![News popup](src/images/screenshot-1.png)
![News popup](src/images/screenshot-2.png)
![Settings](src/images/screenshot-3.png)

## Features

- Browse recent articles from 15 NOS news and sport categories
- Choose your feed from the settings view (Nieuws & Sport)
- Configure how many articles to display (1–20)
- Dark mode toggle, persisted across sessions
- Badge on the extension icon showing unread article count (checked every minute)

## Feeds

**Nieuws:** Algemeen, Binnenland, Buitenland, Politiek, Economie, Opmerkelijk, Koningshuis, Cultuur & media, Tech

**Sport:** Algemeen, Voetbal, Wielrennen, Schaatsen, Tennis, Formule 1

## Tech stack

| Tool | Version | Role |
|------|---------|------|
| Vue 3 | ^3.5 | Popup UI (Composition API) |
| Rollup | ^4 | Module bundler |
| Tailwind CSS | ^4.2 | Utility-first styling |
| Manifest V3 | — | Chrome extension format |

## Development

### Prerequisites

- Node.js
- pnpm (recommended) or npm

### Install

```bash
pnpm install
```

### Build

```bash
pnpm build
```

Output is written to `dist/`.

### Watch (development)

```bash
pnpm watch
```

Rebuilds on every file change (Rollup + Tailwind in parallel).

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

After rebuilds, click the refresh icon on the extension card in `chrome://extensions`.

## Project structure

```
src/
├── components/
│   ├── ArticleItem.vue   # Single article row (thumbnail + title + date)
│   ├── NewsView.vue      # Main feed view with header bar
│   └── SettingsView.vue  # Feed selector and max-items slider
├── App.vue               # Root component; owns all shared state
├── background.js         # Service worker: periodic badge updates
├── feed.js               # Feed list, storage constants, RSS parsers
├── main.js               # Vue app entry point
├── manifest.json         # Chrome extension manifest
├── popup.html            # Popup shell HTML
└── theme.css             # Tailwind CSS v4 input
```

## Permissions

| Permission | Reason |
|-----------|--------|
| `https://feeds.nos.nl/*` | Fetch NOS RSS feeds |
| `alarms` | Periodic background feed checks |
| `storage` | Persist user preferences and seen-article tracking |

## License

Private.
