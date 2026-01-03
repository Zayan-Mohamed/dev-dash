/**
 * Storage Service
 * Wraps chrome.storage.local with fallback to localStorage
 */

// Declare chrome types for extension environment
declare const chrome: any;

// Type guard for chrome extension environment
const isExtension = typeof chrome !== 'undefined' && typeof chrome?.storage !== 'undefined';

export interface StorageData {
	commandHistory: string[];
	notepadContent: string;
	settings: {
		use24Hour: boolean;
		showGreeting: boolean;
		showPomodoro: boolean;
		showNotepad: boolean;
		showWeather: boolean;
		showGitHubStats: boolean;
		showTopSites: boolean;
		showTechNews: boolean;
		githubUsername: string;
		displayName: string;
		customLinks: Array<{ title: string; url: string }>;
	};
}

const DEFAULT_DATA: StorageData = {
	commandHistory: [],
	notepadContent: '',
	settings: {
		use24Hour: false,
		showGreeting: true,
		showPomodoro: false,
		showNotepad: false,
		showWeather: true,
		showGitHubStats: true,
		showTopSites: true,
		showTechNews: true,
		githubUsername: '',
		displayName: '',
		customLinks: []
	}
};

/**
 * Get data from storage
 */
export async function getData<K extends keyof StorageData>(key: K): Promise<StorageData[K]> {
	if (!isExtension) {
		const stored = localStorage.getItem(key);
		return stored ? JSON.parse(stored) : DEFAULT_DATA[key];
	}

	try {
		if (chrome?.storage?.local) {
			const result = await chrome.storage.local.get(key);
			return (result[key] as StorageData[K]) ?? DEFAULT_DATA[key];
		}
		return DEFAULT_DATA[key];
	} catch (error) {
		console.error('Failed to get data:', error);
		return DEFAULT_DATA[key];
	}
}

/**
 * Set data in storage
 */
export async function setData<K extends keyof StorageData>(
	key: K,
	value: StorageData[K]
): Promise<void> {
	if (!isExtension) {
		localStorage.setItem(key, JSON.stringify(value));
		return;
	}

	try {
		if (chrome?.storage?.local) {
			await chrome.storage.local.set({ [key]: value });
		}
	} catch (error) {
		console.error('Failed to set data:', error);
	}
}
