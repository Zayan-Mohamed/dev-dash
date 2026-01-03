<script lang="ts">
	import Clock from './Clock.svelte';
	import Pomodoro from './Pomodoro.svelte';
	import { settings } from '$lib/stores/settings';

	let {
		use24Hour = false,
		showGreeting = true,
		animationDelay = 0
	}: {
		use24Hour?: boolean;
		showGreeting?: boolean;
		animationDelay?: number;
	} = $props();

	// Card flips when Pomodoro is enabled
	let isFlipped = $derived($settings.showPomodoro);
</script>

<div class="flippable-clock" class:flipped={isFlipped}>
	<div class="card-inner">
		<!-- Front: Clock -->
		<div class="card-face card-face--front">
			<Clock {use24Hour} {showGreeting} {animationDelay} />
		</div>

		<!-- Back: Pomodoro -->
		<div class="card-face card-face--back">
			<Pomodoro {animationDelay} />
		</div>
	</div>
</div>

<style>
	.flippable-clock {
		perspective: 1000px;
		width: 100%;
		min-height: 280px;
		margin-bottom: var(--space-2);
	}

	.card-inner {
		position: relative;
		width: 100%;
		min-height: 280px;
		transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
		transform-style: preserve-3d;
	}

	.flippable-clock.flipped .card-inner {
		transform: rotateY(180deg);
	}

	.card-face {
		width: 100%;
		min-height: 280px;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		padding: var(--space-1);
		box-sizing: border-box;
	}

	.card-face--front {
		position: relative;
	}

	.card-face--back {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		min-height: 280px;
		transform: rotateY(180deg);
		padding: var(--space-1);
		box-sizing: border-box;
	}

	/* Responsive adjustments */
	@media (max-width: 1024px) {
		.flippable-clock {
			min-height: 240px;
			margin-bottom: var(--space-3);
		}

		.card-inner {
			min-height: 240px;
		}

		.card-face,
		.card-face--back {
			min-height: 240px;
		}
	}

	@media (max-width: 768px) {
		.flippable-clock {
			min-height: 220px;
			margin-bottom: var(--space-2);
		}

		.card-inner {
			min-height: 220px;
		}

		.card-face,
		.card-face--back {
			min-height: 220px;
			padding: var(--space-2);
		}
	}

	@media (max-width: 480px) {
		.flippable-clock {
			min-height: 200px;
			margin-bottom: var(--space-2);
		}

		.card-inner {
			min-height: 200px;
		}

		.card-face,
		.card-face--back {
			min-height: 200px;
			padding: var(--space-1);
		}
	}

	/* Tablet landscape */
	@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
		.flippable-clock {
			min-height: 220px;
		}

		.card-inner {
			min-height: 220px;
		}

		.card-face,
		.card-face--back {
			min-height: 220px;
		}
	}

	/* Mobile landscape */
	@media (max-width: 896px) and (orientation: landscape) {
		.flippable-clock {
			min-height: 200px;
		}

		.card-inner {
			min-height: 200px;
		}

		.card-face,
		.card-face--back {
			min-height: 200px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.card-inner {
			transition: none;
		}

		.flippable-clock.flipped .card-inner {
			transform: none;
		}

		.card-face--back {
			display: none;
		}

		.flippable-clock.flipped .card-face--front {
			display: none;
		}

		.flippable-clock.flipped .card-face--back {
			display: block;
			position: relative;
			transform: none;
		}
	}
</style>
