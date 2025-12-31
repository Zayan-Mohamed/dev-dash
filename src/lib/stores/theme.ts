import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeState {
	theme: Theme;
	resolvedTheme: 'light' | 'dark';
}

const THEME_STORAGE_KEY = 'theme-preference';

function getSystemTheme(): 'light' | 'dark' {
	if (!browser) return 'dark';
	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getStoredTheme(): Theme {
	if (!browser) return 'auto';
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === 'light' || stored === 'dark' || stored === 'auto') {
		return stored;
	}
	return 'auto';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
	if (theme === 'auto') {
		return getSystemTheme();
	}
	return theme;
}

function createThemeStore() {
	const initialTheme = getStoredTheme();
	const initialState: ThemeState = {
		theme: initialTheme,
		resolvedTheme: resolveTheme(initialTheme)
	};

	const { subscribe, set, update } = writable<ThemeState>(initialState);

	// Apply theme to document
	function applyTheme(resolvedTheme: 'light' | 'dark') {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', resolvedTheme);
	}

	// Listen for system theme changes
	if (browser) {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
		mediaQuery.addEventListener('change', (e) => {
			update((state) => {
				if (state.theme === 'auto') {
					const newResolvedTheme = e.matches ? 'light' : 'dark';
					applyTheme(newResolvedTheme);
					return { ...state, resolvedTheme: newResolvedTheme };
				}
				return state;
			});
		});

		// Apply initial theme
		applyTheme(initialState.resolvedTheme);
	}

	return {
		subscribe,
		setTheme: (theme: Theme) => {
			if (!browser) return;

			const resolvedTheme = resolveTheme(theme);
			localStorage.setItem(THEME_STORAGE_KEY, theme);
			applyTheme(resolvedTheme);

			set({ theme, resolvedTheme });
		},
		toggleTheme: () => {
			update((state) => {
				const newTheme: Theme = state.resolvedTheme === 'dark' ? 'light' : 'dark';
				const resolvedTheme = resolveTheme(newTheme);

				if (browser) {
					localStorage.setItem(THEME_STORAGE_KEY, newTheme);
					applyTheme(resolvedTheme);
				}

				return { theme: newTheme, resolvedTheme };
			});
		}
	};
}

export const themeStore = createThemeStore();
