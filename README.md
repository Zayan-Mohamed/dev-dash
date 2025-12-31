# DevDash - Developer New Tab Extension

A zero-latency, keyboard-first Chrome Extension that replaces your new tab with a developer-focused dashboard built with **Svelte 5** and **Tailwind CSS v4**.

![DevDash Screenshot](https://via.placeholder.com/800x400?text=DevDash+Screenshot)

## ✨ Features

- ⚡ **Zero Latency** - Instant load with no framework overhead
- ⌨️ **Keyboard First** - Command palette with shortcuts
- 🎨 **Hacker Aesthetic** - Dark mode with monospace fonts (GitHub theme)
- 🔒 **Privacy Focused** - All data stored locally, no tracking
- 🚀 **Svelte 5** - Built with latest runes syntax
- 💅 **Tailwind CSS v4** - Modern utility-first styling
- 📱 **Responsive** - Works on all screen sizes

## 🎯 Quick Commands

Type in the omnibar:

- `g <query>` → Google search
- `gh <query>` → GitHub search  
- `l <port>` → Open localhost (default: 3000)
- `/<command>` → Custom commands (extensible)
- Direct URLs or search queries

**History Navigation**: Use ↑/↓ arrow keys

## 🚀 Installation

### Option 1: Load Unpacked (Development)

```bash
# Clone and install
git clone <your-repo>
cd dev-dash
pnpm install

# Build the extension
pnpm build

# Load in Chrome:
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the build/ directory
```

### Option 2: From Release (Coming Soon)

Download the latest `.crx` or `.zip` from [Releases](#).

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Dev server (browser preview)
pnpm dev

# Build for Chrome
pnpm build

# Type checking
pnpm check

# Lint & format
pnpm lint && pnpm format
```

## 📦 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Svelte | 5.45+ | UI framework with runes |
| SvelteKit | 2.49+ | Build tooling |
| TypeScript | 5.9+ | Type safety |
| Tailwind CSS | 4.1+ | Styling |
| Vite | 7.2+ | Bundler |
| lucide-svelte | latest | Icons |

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/       # UI components (Clock, TopSites, Omnibar)
│   ├── services/         # Chrome API wrappers
│   └── utils/            # Helper functions
├── routes/
│   ├── +layout.svelte    # Root layout
│   └── +page.svelte      # Main dashboard
└── app.css              # Global Tailwind styles

public/
├── manifest.json        # Extension manifest
└── icons/              # Extension icons

build/                  # Built extension (git-ignored)
```

## 🎨 Customization

### Colors

Edit component classes or `app.css`. Current theme (GitHub Dark):

```css
--bg-primary: #0d1117
--bg-secondary: #161b22
--border: #30363d
--text-main: #c9d1d9
--accent: #58a6ff
```

### Add Commands

In `src/lib/components/Omnibar.svelte`:

```typescript
if (command.startsWith('npm ')) {}
  const pkg = command.slice(4);
  window.location.href = `https://npmjs.com/package/${pkg}`;
  return;
}
```

### Clock Format

In `src/routes/+page.svelte`:

```svelte
<Clock use24Hour={true} showGreeting={false} />
```

## 🧩 Architecture

### Services

- **topSites.ts** - Chrome API wrapper with dev fallback
- **storage.ts** - chrome.storage.local with localStorage fallback

### Components (Svelte 5 Runes)

- **Clock** - `$state` + `$effect` for time updates
- **TopSites** - Pure presentation with `$props`
- **Omnibar** - Command parser + history with `$state`

### Type Safety

- Strict TypeScript mode enabled
- No `any` types
- Interface definitions for all data structures

## 📚 Documentation

- [Installation Guide](INSTALLATION.md) - Detailed setup instructions
- [Build Summary](BUILD_SUMMARY.md) - What's been built
- [Svelte 5 Docs](https://svelte.dev/docs/svelte)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make your changes (with tests if applicable)
4. Submit a PR

## 📝 License

MIT © 2025

---

**Built with Svelte 5 + Tailwind CSS + ❤️**
