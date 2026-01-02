import { writable } from 'svelte/store';
import { getData, setData, type StorageData } from '$lib/services/storage';

const DEFAULT_SETTINGS: StorageData['settings'] = {
	use24Hour: false,
	showGreeting: true,
	showPomodoro: false,
	showNotepad: false,
	showWeather: true,
	showTechNews: true,
	showGitHubStats: true,
	showTopSites: false,
	githubUsername: '',
	displayName: '',
	customLinks: []
};

function createSettingsStore() {
	const { subscribe, set, update } = writable<StorageData['settings']>(DEFAULT_SETTINGS);

	return {
		subscribe,
		set: (value: StorageData['settings']) => {
			set(value);
			setData('settings', value);
		},
		update: (updater: (value: StorageData['settings']) => StorageData['settings']) => {
			update((current: StorageData['settings']) => {
				const newValue = updater(current);
				setData('settings', newValue);
				return newValue;
			});
		},
		init: async () => {
			const data = await getData('settings');
			set(data);
		}
	};
}

export const settings = createSettingsStore();
