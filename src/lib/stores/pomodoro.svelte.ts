/**
 * Pomodoro Timer Store with Cross-Tab Synchronization
 * Persists timer state to localStorage and syncs across browser tabs
 */

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const STORAGE_KEY = 'pomodoro-state';

interface PomodoroState {
	timeLeft: number;
	isRunning: boolean;
	mode: 'work' | 'break';
	lastUpdateTime: number; // Timestamp for calculating elapsed time
}

// Load initial state from localStorage
function loadState(): PomodoroState {
	if (typeof window === 'undefined') {
		return {
			timeLeft: WORK_TIME,
			isRunning: false,
			mode: 'work',
			lastUpdateTime: Date.now()
		};
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const state = JSON.parse(stored) as PomodoroState;

			// If timer was running, calculate elapsed time
			if (state.isRunning) {
				const elapsed = Math.floor((Date.now() - state.lastUpdateTime) / 1000);
				state.timeLeft = Math.max(0, state.timeLeft - elapsed);

				// If time expired while tab was closed/inactive
				if (state.timeLeft === 0) {
					state.isRunning = false;
					state.mode = state.mode === 'work' ? 'break' : 'work';
					state.timeLeft = state.mode === 'work' ? WORK_TIME : BREAK_TIME;
				}
			}

			return state;
		}
	} catch (error) {
		console.error('Failed to load Pomodoro state:', error);
	}

	return {
		timeLeft: WORK_TIME,
		isRunning: false,
		mode: 'work',
		lastUpdateTime: Date.now()
	};
}

// Create reactive state using Svelte 5 runes
export const pomodoroState = $state<PomodoroState>(loadState());

// Save state to localStorage
function saveState() {
	if (typeof window === 'undefined') return;

	try {
		const stateToSave = {
			...pomodoroState,
			lastUpdateTime: Date.now()
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));

		// Dispatch custom event for cross-tab communication
		window.dispatchEvent(
			new StorageEvent('storage', {
				key: STORAGE_KEY,
				newValue: JSON.stringify(stateToSave),
				storageArea: localStorage
			})
		);
	} catch (error) {
		console.error('Failed to save Pomodoro state:', error);
	}
}

// Timer interval reference
let timerInterval: ReturnType<typeof setInterval> | undefined;

// Timer actions
export const pomodoroActions = {
	start() {
		if (pomodoroState.isRunning) return;

		pomodoroState.isRunning = true;
		pomodoroState.lastUpdateTime = Date.now();
		saveState();

		// Start countdown interval
		timerInterval = setInterval(() => {
			if (pomodoroState.timeLeft > 0) {
				pomodoroState.timeLeft--;
				pomodoroState.lastUpdateTime = Date.now();

				// Save periodically (every 5 seconds to reduce writes)
				if (pomodoroState.timeLeft % 5 === 0) {
					saveState();
				}
			} else {
				// Timer finished
				pomodoroActions.complete();
			}
		}, 1000);
	},

	pause() {
		if (!pomodoroState.isRunning) return;

		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = undefined;
		}

		pomodoroState.isRunning = false;
		pomodoroState.lastUpdateTime = Date.now();
		saveState();
	},

	toggle() {
		if (pomodoroState.isRunning) {
			pomodoroActions.pause();
		} else {
			pomodoroActions.start();
		}
	},

	reset() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = undefined;
		}

		pomodoroState.isRunning = false;
		pomodoroState.timeLeft = pomodoroState.mode === 'work' ? WORK_TIME : BREAK_TIME;
		pomodoroState.lastUpdateTime = Date.now();
		saveState();
	},

	toggleMode() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = undefined;
		}

		pomodoroState.isRunning = false;
		pomodoroState.mode = pomodoroState.mode === 'work' ? 'break' : 'work';
		pomodoroState.timeLeft = pomodoroState.mode === 'work' ? WORK_TIME : BREAK_TIME;
		pomodoroState.lastUpdateTime = Date.now();
		saveState();
	},

	complete() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = undefined;
		}

		// Show notification
		if (
			typeof window !== 'undefined' &&
			'Notification' in window &&
			Notification.permission === 'granted'
		) {
			new Notification(`${pomodoroState.mode === 'work' ? 'Work' : 'Break'} session completed!`, {
				body: pomodoroState.mode === 'work' ? 'Time for a break!' : 'Back to work!',
				icon: '/icons/icon128.png'
			});
		}

		// Auto switch mode
		pomodoroState.mode = pomodoroState.mode === 'work' ? 'break' : 'work';
		pomodoroState.timeLeft = pomodoroState.mode === 'work' ? WORK_TIME : BREAK_TIME;
		pomodoroState.isRunning = false;
		pomodoroState.lastUpdateTime = Date.now();
		saveState();
	},

	// Sync state from another tab
	syncFromStorage(newState: PomodoroState) {
		// Stop current timer if running
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = undefined;
		}

		// Update state
		pomodoroState.timeLeft = newState.timeLeft;
		pomodoroState.mode = newState.mode;
		pomodoroState.lastUpdateTime = newState.lastUpdateTime;

		// Calculate elapsed time since last update
		if (newState.isRunning) {
			const elapsed = Math.floor((Date.now() - newState.lastUpdateTime) / 1000);
			pomodoroState.timeLeft = Math.max(0, newState.timeLeft - elapsed);

			if (pomodoroState.timeLeft > 0) {
				pomodoroState.isRunning = true;
				// Restart timer interval
				pomodoroActions.start();
			} else {
				// Timer expired
				pomodoroState.isRunning = false;
				pomodoroActions.complete();
			}
		} else {
			pomodoroState.isRunning = false;
		}
	}
};

// Setup cross-tab synchronization
if (typeof window !== 'undefined') {
	// Listen for storage changes from other tabs
	window.addEventListener('storage', (event) => {
		if (event.key === STORAGE_KEY && event.newValue) {
			try {
				const newState = JSON.parse(event.newValue) as PomodoroState;
				pomodoroActions.syncFromStorage(newState);
			} catch (error) {
				console.error('Failed to sync Pomodoro state:', error);
			}
		}
	});

	// Request notification permission
	if ('Notification' in window && Notification.permission === 'default') {
		Notification.requestPermission();
	}

	// Cleanup on page unload
	window.addEventListener('beforeunload', () => {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
		// Save final state
		saveState();
	});
}
