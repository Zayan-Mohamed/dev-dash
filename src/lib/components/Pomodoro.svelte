<script lang="ts">
	import { Play, Pause, RotateCcw, Coffee, Briefcase, Timer } from 'lucide-svelte';
	import Card from './Card.svelte';

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	const WORK_TIME = 25 * 60;
	const BREAK_TIME = 5 * 60;

	let timeLeft = $state(WORK_TIME);
	let isRunning = $state(false);
	let mode = $state<'work' | 'break'>('work');
	let interval: ReturnType<typeof setInterval> | undefined;

	function toggleTimer() {
		if (isRunning) {
			if (interval) clearInterval(interval);
			isRunning = false;
		} else {
			isRunning = true;
			interval = setInterval(() => {
				if (timeLeft > 0) {
					timeLeft--;
				} else {
					// Timer finished
					if (interval) clearInterval(interval);
					// Show notification
					if ('Notification' in window && Notification.permission === 'granted') {
						new Notification(`${mode === 'work' ? 'Work' : 'Break'} session completed!`, {
							body: mode === 'work' ? 'Time for a break!' : 'Back to work!',
							icon: '/icons/icon128.png'
						});
					}

					// Auto switch mode
					mode = mode === 'work' ? 'break' : 'work';
					timeLeft = mode === 'work' ? WORK_TIME : BREAK_TIME;
				}
			}, 1000);
		}
	}

	function resetTimer() {
		if (interval) clearInterval(interval);
		isRunning = false;
		timeLeft = mode === 'work' ? WORK_TIME : BREAK_TIME;
	}

	function toggleMode() {
		if (interval) clearInterval(interval);
		isRunning = false;
		mode = mode === 'work' ? 'break' : 'work';
		timeLeft = mode === 'work' ? WORK_TIME : BREAK_TIME;
	}

	function formatTime(seconds: number) {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	// Request notification permission on mount
	$effect(() => {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

<Card variant="hero" elevation="medium" class="pomodoro-card" {animationDelay}>
	<div class="pomodoro-container">
		<!-- Card Header -->
		<div class="pomodoro-header">
			<Timer size={20} class="text-orange-500" />
			<h3 class="pomodoro-title">Pomodoro Timer</h3>
		</div>

		<!-- Mode Indicator -->
		<div class="pomodoro-mode">
			{#if mode === 'work'}
				<Briefcase size={14} class="text-blue-400" />
				<span class="text-blue-400">Work</span>
			{:else}
				<Coffee size={14} class="text-green-400" />
				<span class="text-green-400">Break</span>
			{/if}
		</div>

		<!-- Timer Display -->
		<div class="pomodoro-timer">
			{formatTime(timeLeft)}
		</div>

		<!-- Action Buttons -->
		<div class="pomodoro-actions">
			<button
				onclick={toggleTimer}
				class="pomodoro-button pomodoro-button--primary"
				title={isRunning ? 'Pause' : 'Start'}
				aria-label={isRunning ? 'Pause timer' : 'Start timer'}
			>
				{#if isRunning}
					<Pause size={20} />
				{:else}
					<Play size={20} />
				{/if}
			</button>

			<button
				onclick={resetTimer}
				class="pomodoro-button pomodoro-button--secondary"
				title="Reset"
				aria-label="Reset timer"
			>
				<RotateCcw size={20} />
			</button>

			<button
				onclick={toggleMode}
				class="pomodoro-button pomodoro-button--secondary"
				title="Switch Mode"
				aria-label={mode === 'work' ? 'Switch to break mode' : 'Switch to work mode'}
			>
				{#if mode === 'work'}
					<Coffee size={20} />
				{:else}
					<Briefcase size={20} />
				{/if}
			</button>
		</div>
	</div>
</Card>

<style>
	.pomodoro-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-4) 0;
		min-height: 280px;
	}

	.pomodoro-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
		width: fit-content;
		margin-bottom: var(--space-3);
	}

	.pomodoro-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
		margin: 0;
	}

	.pomodoro-mode {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-xs);
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-2);
	}

	.pomodoro-timer {
		font-size: clamp(3rem, 8vw, 4rem);
		font-family: var(--font-mono);
		font-weight: 700;
		color: var(--color-text-primary);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pomodoro-actions {
		display: flex;
		gap: var(--space-3);
		width: 100%;
		justify-content: center;
		flex-shrink: 0;
		padding-bottom: var(--space-2);
	}

	.pomodoro-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-3);
		border-radius: var(--radius-md);
		background: transparent;
		border: 1px solid transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--duration-normal) var(--easing-standard);
		position: relative;
		overflow: hidden;
		/* Touch-friendly minimum size */
		min-width: 48px;
		min-height: 48px;
	}

	.pomodoro-button::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle, rgba(88, 166, 255, 0.2) 0%, transparent 70%);
		opacity: 0;
		transition: opacity var(--duration-normal) var(--easing-standard);
	}

	.pomodoro-button:hover {
		background: var(--color-surface-2);
		transform: scale(1.1);
	}

	.pomodoro-button:hover::before {
		opacity: 1;
	}

	.pomodoro-button:active {
		transform: scale(0.95);
		transition-duration: var(--duration-fast);
	}

	.pomodoro-button--primary:hover {
		color: var(--color-accent);
		border-color: var(--color-accent);
		box-shadow: 0 0 16px rgba(88, 166, 255, 0.4);
	}

	.pomodoro-button--secondary:hover {
		color: var(--color-text-primary);
	}

	/* Responsive adjustments */
	@media (max-width: 1024px) {
		.pomodoro-container {
			min-height: 240px;
			padding: var(--space-4) 0;
		}
	}

	@media (max-width: 768px) {
		.pomodoro-container {
			gap: var(--space-4);
			min-height: 220px;
			padding: var(--space-3) 0;
		}

		.pomodoro-timer {
			font-size: clamp(2.5rem, 10vw, 3rem);
		}

		.pomodoro-actions {
			gap: var(--space-2);
		}

		.pomodoro-button {
			padding: var(--space-2);
			min-width: 44px;
			min-height: 44px;
		}
	}

	@media (max-width: 480px) {
		.pomodoro-container {
			min-height: 200px;
			padding: var(--space-2) 0;
		}
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
		.pomodoro-button {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.pomodoro-button:active {
			background: var(--color-surface-3);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.pomodoro-button {
			transition: none;
		}

		.pomodoro-button:hover,
		.pomodoro-button:active {
			transform: none;
		}
	}
</style>
