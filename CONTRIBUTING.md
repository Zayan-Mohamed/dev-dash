# Contributing to DevDash

First off, thank you for considering contributing to DevDash! 🎉

DevDash is a community-driven project, and we welcome contributions of all kinds: bug reports, feature requests, documentation improvements, and code contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

---

## Code of Conduct

This project and everyone participating in it is governed by respect, kindness, and professionalism. Please be respectful and constructive in all interactions.

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs. **actual behavior**
- **Screenshots** (if applicable)
- **Environment details**: Chrome version, OS, extension version
- **Console errors** (if any)

### 💡 Suggesting Features

Feature requests are welcome! Please provide:

- **Clear use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches you've thought about
- **Mockups/wireframes** (if applicable)

### 📝 Improving Documentation

Documentation improvements are always appreciated:

- Fix typos or clarify confusing sections
- Add examples or screenshots
- Improve code comments
- Write tutorials or guides

### 💻 Code Contributions

Ready to contribute code? Awesome! Here's how:

1. **Check existing issues** or create a new one to discuss your changes
2. **Fork the repository** and create a feature branch
3. **Make your changes** following our coding standards
4. **Test thoroughly** - ensure nothing breaks
5. **Submit a pull request** with a clear description

---

## Development Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** (preferred) or npm
- **Google Chrome** (for testing)
- **Git**

### Getting Started

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/dev-dash.git
cd dev-dash

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev
# Opens at http://localhost:5173

# 4. Build the extension
pnpm build

# 5. Load in Chrome
# - Navigate to chrome://extensions
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the `build/` directory
```

### Available Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build extension
pnpm check        # Type checking
pnpm lint         # Lint code
pnpm format       # Format code
pnpm test:unit    # Run unit tests
pnpm test:e2e     # Run E2E tests
pnpm test         # Run all tests
```

---

## Project Architecture

### Core Philosophy

- **⚡ Zero Latency** - Performance is critical. No heavy frameworks or unnecessary dependencies.
- **⌨️ Keyboard First** - All features should be accessible via keyboard.
- **🔒 Privacy** - All data stays local. No external tracking or analytics.
- **🎯 Type Safety** - Strict TypeScript. No `any` types.

### Directory Structure

```
src/
├── lib/
│   ├── components/       # Reusable Svelte components
│   ├── services/         # Chrome API wrappers
│   ├── stores/           # Svelte stores (state management)
│   ├── styles/           # Design system (CSS variables)
│   └── utils/            # Helper functions
├── routes/
│   ├── +layout.svelte    # Root layout
│   ├── +page.svelte      # Main dashboard
│   └── layout.css        # Tailwind plugins
├── app.css               # Global styles + Tailwind
└── app.html              # HTML template
```

### Key Patterns

1. **Services** - All Chrome API calls go through `src/lib/services/`
2. **Environment Checks** - Always check if `chrome` API exists
3. **Svelte 5 Runes** - Use `$state`, `$derived`, `$effect` instead of legacy syntax
4. **CSS Variables** - Use design tokens from `src/lib/styles/tokens.css`
5. **Type Definitions** - Define interfaces for all data structures

---

## Coding Standards

### TypeScript Rules

✅ **DO:**

```typescript
// ✓ Explicit types
interface Site {
  title: string;
  url: string;
}

// ✓ Type narrowing
function isExtension(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.topSites;
}

// ✓ Typed props in components
interface Props {
  sites: Site[];
  onSelect?: (site: Site) => void;
}
let { sites, onSelect }: Props = $props();
```

❌ **DON'T:**

```typescript
// ✗ Using 'any'
const data: any = {};

// ✗ Implicit types
function process(input) { }

// ✗ Untyped props
let { data } = $props();
```

### Svelte 5 Component Style

```svelte
<script lang="ts">
	import { onMount } from 'svelte';

	// Props with types
	interface Props {
		initialValue?: number;
	}
	let { initialValue = 0 }: Props = $props();

	// State using runes
	let count = $state(initialValue);

	// Derived state
	let doubled = $derived(count * 2);

	// Effects
	$effect(() => {
		console.log(`Count changed: ${count}`);
	});
</script>

<button onclick={() => count++}>
	Count: {count} (Doubled: {doubled})
</button>

<style>
	button {
		/* Use CSS variables */
		background: var(--color-accent);
		color: var(--color-text-primary);
	}
</style>
```

### Chrome API Handling

Always wrap Chrome API calls with environment checks:

```typescript
// ✓ Safe Chrome API call
export async function getTopSites(): Promise<Site[]> {
  const isExtension = typeof chrome !== 'undefined' && !!chrome.topSites;

  if (!isExtension) {
    // Return mock data for development
    return MOCK_SITES;
  }

  try {
    const sites = await chrome.topSites.get();
    return sites.map(site => ({
      title: site.title,
      url: site.url
    }));
  } catch (error) {
    console.error('Failed to fetch top sites:', error);
    return [];
  }
}
```

### CSS & Styling

1. **Use Tailwind v4** - Utility-first approach
2. **CSS Variables** - For theme colors and design tokens
3. **Scoped Styles** - Component-specific styles in `<style>` tags
4. **Monospace Fonts** - Maintain the hacker aesthetic

```css
/* Use design tokens */
.card {
	background: var(--color-surface);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	padding: var(--spacing-4);
}
```

### File Naming

- **Components**: PascalCase - `Clock.svelte`, `TopSites.svelte`
- **Services**: camelCase - `topSites.ts`, `storage.ts`
- **Utils**: camelCase - `time.ts`, `url.ts`
- **Types**: PascalCase - `types.ts`, interfaces use `interface` keyword

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `ci`: CI/CD changes

### Examples

```bash
feat(omnibar): add npm package search command

Add 'npm <package>' command to quickly search npm packages.
Example: 'npm react' opens https://npmjs.com/package/react

Closes #42
```

```bash
fix(clock): correct 12-hour format AM/PM display

Fixed bug where midnight displayed as 0:00 AM instead of 12:00 AM

Fixes #38
```

```bash
docs(readme): update installation instructions

Added clearer steps for loading unpacked extension in Chrome
```

---

## Pull Request Process

### Before Submitting

1. **Update your fork** to the latest `main` branch
2. **Run all checks**:
   ```bash
   pnpm check      # TypeScript
   pnpm lint       # ESLint
   pnpm format     # Prettier
   pnpm test       # Tests
   pnpm build      # Ensure it builds
   ```
3. **Test manually** in Chrome as an extension
4. **Update documentation** if needed

### PR Title

Use the same format as commit messages:

```
feat(weather): add celsius/fahrenheit toggle
fix(settings): resolve theme persistence issue
docs(contributing): add testing guidelines
```

### PR Description Template

```markdown
## Description

Brief description of what this PR does

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Changes Made

- Bullet point list of changes

## Screenshots (if applicable)

Paste screenshots here

## Testing Done

- [ ] Tested in Chrome
- [ ] All tests pass
- [ ] Lint checks pass
- [ ] Type checks pass

## Related Issues

Closes #123
```

### Review Process

1. **Automated Checks** - CI runs linting, type checking, and tests
2. **Code Review** - Maintainers review code quality and architecture
3. **Manual Testing** - Changes tested as Chrome extension
4. **Approval** - Requires at least one maintainer approval
5. **Merge** - Squash and merge into `main`

---

## Testing

### Unit Tests (Vitest)

Located in `src/**/*.{test,spec}.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatTime } from './time';

describe('formatTime', () => {
  it('formats 24-hour time correctly', () => {
    expect(formatTime(14, 30, true)).toBe('14:30');
  });

  it('formats 12-hour time correctly', () => {
    expect(formatTime(14, 30, false)).toBe('2:30 PM');
  });
});
```

### E2E Tests (Playwright)

Located in `tests/`:

```typescript
import { test, expect } from '@playwright/test';

test('omnibar opens and accepts input', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const input = page.locator('input[type="text"]');
  await input.fill('g svelte');

  await expect(input).toHaveValue('g svelte');
});
```

### Manual Testing Checklist

When testing as a Chrome extension:

- [ ] Extension loads without errors
- [ ] Clock displays and updates
- [ ] Top sites load correctly
- [ ] Omnibar accepts commands
- [ ] Settings persist after reload
- [ ] Keyboard shortcuts work
- [ ] No console errors
- [ ] Performance is smooth

---

## Questions?

- **Issues**: Open an issue for bugs or features
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact [@Zayan-Mohamed](https://github.com/Zayan-Mohamed)

---

## Recognition

All contributors will be recognized in our README and release notes. Thank you for helping make DevDash better! 🚀

---

<div align="center">
  <strong>Happy Contributing! 🎉</strong>
</div>
