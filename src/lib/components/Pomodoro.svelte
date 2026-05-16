<script lang="ts">
	import { Play, Pause, RotateCcw, Coffee, Briefcase, Timer } from 'lucide-svelte';
	import Card from './Card.svelte';
	import { pomodoroState, pomodoroActions } from '$lib/stores/pomodoro.svelte';

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	function formatTime(seconds: number) {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}
	let progress = $derived(
		pomodoroState.timeLeft / (pomodoroState.mode === 'work' ? 25 * 60 : 5 * 60)
	);
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
			{#if pomodoroState.mode === 'work'}
				<Briefcase size={14} class="text-blue-400" />
				<span class="text-blue-400">Work</span>
			{:else}
				<Coffee size={14} class="text-green-400" />
				<span class="text-green-400">Break</span>
			{/if}
		</div>

		<!-- Compact Timer Display with Vertical Gooey Bar -->
		<div class="pomodoro-timer-wrapper">
			<div class="pomodoro-timer">
				{formatTime(pomodoroState.timeLeft)}
			</div>

			<!-- Vertical Gooey Bar -->
			<div class="gooey-vertical-wrapper">
				<svg width="0" height="0">
					<filter id="goo-pomo">
						<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
						<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
						<feBlend in="SourceGraphic" in2="goo" />
					</filter>
				</svg>

				<div class="gooey-vertical-container">
					<div class="gooey-track"></div>
					<!-- The liquid filling upwards -->
					<div class="gooey-fill" 
						 class:bg-blue-400={pomodoroState.mode === 'work'}
						 class:bg-green-400={pomodoroState.mode === 'break'}
						 style="height: {progress * 100}%; bottom: 0;"></div>
					<!-- Bubbles rising -->
					<div class="gooey-bubble gb-1"
						 class:bg-blue-400={pomodoroState.mode === 'work'}
						 class:bg-green-400={pomodoroState.mode === 'break'}
						 style="bottom: {progress * 100}%"></div>
					<div class="gooey-bubble gb-2"
						 class:bg-blue-400={pomodoroState.mode === 'work'}
						 class:bg-green-400={pomodoroState.mode === 'break'}
						 style="bottom: {progress * 100}%"></div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="pomodoro-actions">
			<button
				onclick={pomodoroActions.toggle}
				class="pomodoro-button pomodoro-button--primary"
				title={pomodoroState.isRunning ? 'Pause' : 'Start'}
				aria-label={pomodoroState.isRunning ? 'Pause timer' : 'Start timer'}
			>
				{#if pomodoroState.isRunning}
					<Pause size={20} />
				{:else}
					<Play size={20} />
				{/if}
			</button>

			<button
				onclick={pomodoroActions.reset}
				class="pomodoro-button pomodoro-button--secondary"
				title="Reset"
				aria-label="Reset timer"
			>
				<RotateCcw size={20} />
			</button>

			<button
				onclick={pomodoroActions.toggleMode}
				class="pomodoro-button pomodoro-button--secondary"
				title="Switch Mode"
				aria-label={pomodoroState.mode === 'work' ? 'Switch to break mode' : 'Switch to work mode'}
			>
				{#if pomodoroState.mode === 'work'}
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
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-4) 0;
		min-height: 280px;
		height: 100%;
	}

	.pomodoro-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
		width: fit-content;
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
	}

	.pomodoro-timer-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		flex: 1; /* Stretch to occupy middle space natively matching Clock layout */
		width: 100%;
	}

	.gooey-vertical-wrapper {
		position: relative;
		width: 24px;
		height: 80px; /* fixed neat height for the vertical tube */
		display: flex;
		justify-content: center;
	}

	.gooey-vertical-container {
		position: relative;
		width: 6px;
		height: 100%;
		filter: url('#goo-pomo');
	}

	.gooey-track {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--color-surface-3);
		border-radius: var(--radius-full);
		opacity: 0.3;
	}

	.gooey-fill {
		position: absolute;
		left: 0;
		width: 100%;
		border-radius: var(--radius-full);
		transition: height 1s linear, background-color 0.3s ease;
	}

	.gooey-bubble {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 50%;
		transition: background-color 0.3s ease;
	}

	.gb-1 {
		width: 10px;
		height: 10px;
		animation: float-bubble 3s infinite ease-in;
	}

	.gb-2 {
		width: 6px;
		height: 6px;
		animation: float-bubble 2s infinite ease-in 1s;
	}

	@keyframes float-bubble {
		0% {
			transform: translate(-50%, 0) scale(1);
			opacity: 1;
		}
		50% {
			transform: translate(-50%, -15px) scale(0.6);
		}
		100% {
			transform: translate(-50%, -30px) scale(0);
			opacity: 0;
		}
	}

	/* Utility classes injected by Svelte class directives */
	.bg-blue-400 {
		background-color: var(--color-blue-400, #60a5fa);
		box-shadow: 0 0 10px rgba(96, 165, 250, 0.4);
	}

	.bg-green-400 {
		background-color: var(--color-green-400, #4ade80);
		box-shadow: 0 0 10px rgba(74, 222, 128, 0.4);
	}

	/* Utility classes injected by Svelte class directives */
	.bg-blue-400 {
		background-color: var(--color-blue-400, #60a5fa);
		box-shadow: 0 0 10px rgba(96, 165, 250, 0.4);
	}

	.bg-green-400 {
		background-color: var(--color-green-400, #4ade80);
		box-shadow: 0 0 10px rgba(74, 222, 128, 0.4);
	}

	.pomodoro-timer {
		font-size: clamp(3rem, 8vw, 4rem);
		font-family: var(--font-mono);
		font-weight: 700;
		color: var(--color-text-primary);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
		z-index: 1;
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
