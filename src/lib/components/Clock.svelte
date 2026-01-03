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
	}

	onMount(() => {
		// Load settings asynchronously
		getData('settings').then((settings) => {
			displayName = settings.displayName ?? '';
			showGreeting = settings.showGreeting ?? true;
		});

		updateTime();
		const interval = setInterval(updateTime, 1000);

		return () => clearInterval(interval);
	});
</script>

<Card variant="hero" elevation="medium" class="clock-hero" {animationDelay}>
	<div class="clock-hero__content">
		{#if showGreeting}
			<h2 class="clock-hero__greeting">
				{greeting}{displayName ? `, ${displayName}` : ''}
			</h2>
		{/if}
		<div class="clock-hero__time">
			{time}
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
		font-size: var(--font-size-4xl);
		font-family: 'Courier New', monospace;
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--letter-spacing-tight);
		text-shadow:
			0 0 20px rgba(88, 166, 255, 0.3),
			0 0 40px rgba(88, 166, 255, 0.2);
		animation: time-transition var(--duration-normal) var(--easing-standard);
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
	@media (max-width: 768px) {
		.clock-hero__greeting {
			font-size: var(--font-size-base);
		}

		.clock-hero__time {
			font-size: var(--font-size-3xl);
		}

		.clock-hero__date {
			font-size: var(--font-size-xs);
		}

		.clock-hero__content {
			min-height: 240px;
		}
	}

	@media (max-width: 480px) {
		.clock-hero__greeting {
			font-size: var(--font-size-sm);
		}

		.clock-hero__time {
			font-size: var(--font-size-2xl);
		}

		.clock-hero__date {
			font-size: var(--font-size-xs);
		}

		.clock-hero__content {
			min-height: 200px;
			gap: var(--space-2);
		}
	}

	/* Tablet landscape */
	@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
		.clock-hero__content {
			min-height: 240px;
		}

		.clock-hero__time {
			font-size: var(--font-size-3xl);
		}
	}

	/* Mobile landscape */
	@media (max-width: 896px) and (orientation: landscape) {
		.clock-hero__content {
			min-height: 200px;
			gap: var(--space-2);
		}

		.clock-hero__greeting {
			font-size: var(--font-size-sm);
		}

		.clock-hero__time {
			font-size: var(--font-size-2xl);
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
