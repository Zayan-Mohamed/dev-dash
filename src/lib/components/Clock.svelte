<script lang="ts">
	import { formatTime, getGreeting } from '$lib/utils/time';
	import Card from './Card.svelte';
	import { getData } from '$lib/services/storage';
	import { onMount } from 'svelte';

	let {
		use24Hour = false,
		showGreeting = true,
		animationDelay = 0
	}: {
		use24Hour?: boolean;
		showGreeting?: boolean;
		animationDelay?: number;
	} = $props();

	let time = $state('');
	let greeting = $state('');
	let date = $state('');
	let displayName = $state('');
	let secondsProgress = $state(0);
	
	let rafId: number;

	function updateTime() {
		const now = new Date();
		time = formatTime(now, use24Hour);
		greeting = getGreeting();
		date = now.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
		
		// Calculate seconds including milliseconds for smooth ring animation
		secondsProgress = (now.getSeconds() + now.getMilliseconds() / 1000) / 60;
		rafId = requestAnimationFrame(updateTime);
	}

	onMount(() => {
		// Load settings asynchronously
		getData('settings').then((settings) => {
			displayName = settings.displayName ?? '';
			showGreeting = settings.showGreeting ?? true;
		});

		rafId = requestAnimationFrame(updateTime);

		return () => cancelAnimationFrame(rafId);
	});

	// Calculate gooey horizontal progress values
	let strokeWidth = 10;
	let barWidth = 260;
</script>

<Card variant="hero" elevation="medium" class="clock-hero" {animationDelay}>
	<div class="clock-hero__content">
		{#if showGreeting}
			<h2 class="clock-hero__greeting">
				{greeting}{displayName ? `, ${displayName}` : ''}
			</h2>
		{/if}
		
		<div class="clock-hero__time-wrapper">
			<div class="clock-hero__time">
				{time}
			</div>

			<!-- Gooey Linear Seconds Progress Bar -->
			<div class="gooey-bar-wrapper">
				<svg width="0" height="0">
					<filter id="goo">
						<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
						<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -7" result="goo" />
						<feBlend in="SourceGraphic" in2="goo" />
					</filter>
				</svg>

				<div class="gooey-bar-container">
					<!-- Base Track -->
					<div class="gooey-track"></div>
					<!-- Filling track -->
					<div class="gooey-fill" style="width: {secondsProgress * 100}%"></div>
					<!-- Drops separating/merging at the tip -->
					<div class="gooey-drop drop-1" style="left: calc({secondsProgress * 100}% + 4px)"></div>
					<div class="gooey-drop drop-2" style="left: calc({secondsProgress * 100}% + 12px)"></div>
				</div>
			</div>
		</div>

		<div class="clock-hero__date">
			{date}
		</div>
	</div>
</Card>

<style>
	:global(.clock-hero) {
		background: linear-gradient(
			135deg,
			var(--color-surface-2) 0%,
			var(--color-surface-1) 50%,
			var(--color-surface-2) 100%
		);
		position: relative;
		overflow: hidden;
		max-width: 100%;
		margin: 0;
	}

	:global(.clock-hero)::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(88, 166, 255, 0.1) 0%, transparent 70%);
		animation: glow-pulse 4s ease-in-out infinite;
		pointer-events: none;
	}

	@keyframes glow-pulse {
		0%,
		100% {
			opacity: 0.5;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.1);
		}
	}

	.clock-hero__content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-height: 280px;
		padding: var(--space-4) 0;
	}

	.clock-hero__time-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		gap: var(--space-4);
		margin: var(--space-2) 0;
	}

	.gooey-bar-wrapper {
		width: 260px;
		position: relative;
		height: 20px; /* enough space for gooey blur */
		display: flex;
		align-items: center;
	}

	.gooey-bar-container {
		width: 100%;
		height: 4px;
		position: relative;
		filter: url('#goo');
		display: flex;
		align-items: center;
	}

	.gooey-track {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--color-surface-3);
		border-radius: var(--radius-full);
		opacity: 0.3;
	}

	.gooey-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: var(--color-accent);
		border-radius: var(--radius-full);
		box-shadow: 0 0 10px var(--color-accent);
		transition: width 0.1s linear; /* smooth out tiny frame jumps */
	}

	.gooey-drop {
		position: absolute;
		width: 6px;
		height: 6px;
		background: var(--color-accent);
		border-radius: 50%;
		top: 50%;
		transform: translateY(-50%);
	}

	.drop-1 {
		animation: pulse-drop 2s infinite ease-in-out;
	}

	.drop-2 {
		animation: pulse-drop 2s infinite ease-in-out reverse;
		width: 4px;
		height: 4px;
	}

	@keyframes pulse-drop {
		0%, 100% {
			transform: translate(0, -50%) scale(1);
			opacity: 1;
		}
		50% {
			transform: translate(10px, -50%) scale(0.5);
			opacity: 0.5;
		}
	}

	.clock-hero__greeting {
		font-size: var(--font-size-lg);
		font-family: 'Courier New', monospace;
		color: var(--color-text-secondary);
		letter-spacing: var(--letter-spacing-wide);
		font-weight: var(--font-weight-medium);
		/* text-transform: lowercase; */
		animation: fade-in var(--duration-slow) var(--easing-decelerate);
	}

	.clock-hero__time {
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-family: 'Courier New', monospace;
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--letter-spacing-tight);
		text-shadow:
			0 0 15px rgba(88, 166, 255, 0.4),
			0 0 30px rgba(88, 166, 255, 0.2);
		z-index: 1;
	}

	.clock-hero__date {
		font-size: var(--font-size-sm);
		font-family: 'Courier New', monospace;
		color: var(--color-text-muted);
		letter-spacing: var(--letter-spacing-normal);
		font-weight: var(--font-weight-normal);
		animation: fade-in var(--duration-slow) var(--easing-decelerate);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes time-transition {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
		100% {
			opacity: 1;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 1024px) {
		.clock-hero__content {
			min-height: 240px;
		}
	}

	@media (max-width: 768px) {
		.clock-hero__greeting {
			font-size: var(--font-size-base);
		}

		.clock-hero__time {
			font-size: clamp(2.25rem, 6vw, 3rem);
		}

		.clock-hero__date {
			font-size: var(--font-size-xs);
		}

		.clock-hero__content {
			min-height: 220px;
			padding: var(--space-3) 0;
		}
	}

	@media (max-width: 480px) {
		.clock-hero__greeting {
			font-size: var(--font-size-sm);
		}

		.clock-hero__time {
			font-size: clamp(1.75rem, 5.5vw, 2.25rem);
		}

		.clock-hero__date {
			font-size: var(--font-size-xs);
		}

		.clock-hero__content {
			min-height: 200px;
			gap: var(--space-2);
			padding: var(--space-2) 0;
		}
	}

	/* Tablet landscape */
	@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
		.clock-hero__content {
			min-height: 220px;
		}

		.clock-hero__time {
			font-size: clamp(2.5rem, 6vw, 3.5rem);
		}
	}

	/* Mobile landscape */
	@media (max-width: 896px) and (orientation: landscape) {
		.clock-hero__content {
			min-height: 200px;
			gap: var(--space-2);
			padding: var(--space-2) 0;
		}

		.clock-hero__greeting {
			font-size: var(--font-size-sm);
		}

		.clock-hero__time {
			font-size: clamp(1.75rem, 5.5vw, 2.25rem);
		}

		.clock-hero__date {
			font-size: var(--font-size-xs);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		:global(.clock-hero)::before,
		.clock-hero__greeting,
		.clock-hero__time,
		.clock-hero__date {
			animation: none;
		}

		.clock-hero__time {
			text-shadow: none;
		}
	}
</style>
