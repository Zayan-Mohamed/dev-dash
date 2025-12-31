/**
 * Storage Service
 * Wraps chrome.storage.local with fallback to localStorage
 */

const isExtension = typeof chrome !== 'undefined' && chrome.storage;

export interface StorageData {
	commandHistory: string[];
	notepadContent: string;
	settings: {
		use24Hour: boolean;
		showGreeting: boolean;
		showPomodoro: boolean;
		showNotepad: boolean;
		showWeather: boolean;
		showTechNews: boolean;
		showGitHubStats: boolean;
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
		showWeather: false,
		showTechNews: false,
		showGitHubStats: false,
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
		const result = await chrome.storage.local.get(key);
		return (result[key] as StorageData[K]) ?? DEFAULT_DATA[key];
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
		await chrome.storage.local.set({ [key]: value });
	} catch (error) {
		console.error('Failed to set data:', error);
	}
}
