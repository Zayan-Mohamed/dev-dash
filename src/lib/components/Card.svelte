<script lang="ts">
	export let variant: 'small' | 'medium' | 'large' | 'hero' = 'medium';
	export let elevation: 'low' | 'medium' | 'high' = 'medium';
	export let interactive: boolean = false;
	export let loading: boolean = false;
	export let animationDelay: number = 0; // Staggered animation delay in ms
	let className: string = '';
	export { className as class };
</script>

<div
	class="card card--{variant} card--elevation-{elevation} {className}"
	class:card--interactive={interactive}
	class:card--loading={loading}
	style="--animation-delay: {animationDelay}ms"
>
	{#if loading}
		<div class="card__skeleton">
			<div class="skeleton__line skeleton__line--title"></div>
			<div class="skeleton__line skeleton__line--text"></div>
			<div class="skeleton__line skeleton__line--text"></div>
		</div>
	{:else}
		<slot />
	{/if}
</div>

<style>
	.card {
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		transition: all var(--duration-normal) var(--easing-standard);
		overflow: hidden;
		animation: card-enter var(--duration-slow) var(--easing-decelerate);
		animation-delay: var(--animation-delay, 0ms);
		animation-fill-mode: both;
	}

	@keyframes card-enter {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Variant sizes */
	.card--small {
		padding: var(--space-3);
		min-height: 120px;
	}

	.card--medium {
		padding: var(--space-3);
		min-height: auto;
	}

	.card--large {
		padding: var(--space-6);
		min-height: 300px;
	}

	.card--hero {
		padding: var(--space-4);
		min-height: 160px;
		background: linear-gradient(135deg, var(--color-surface-2) 0%, var(--color-surface-1) 100%);
	}

	/* Mobile responsive adjustments */
	@media (max-width: 768px) {
		.card--small {
			padding: var(--space-2);
			min-height: 100px;
		}

		.card--medium {
			padding: var(--space-2);
			min-height: auto;
		}

		.card--large {
			padding: var(--space-4);
			min-height: auto;
		}

		.card--hero {
			padding: var(--space-3);
			min-height: 140px;
		}
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
		.card--interactive {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.card--interactive:active {
			transform: scale(0.98);
			transition-duration: var(--duration-fast);
		}
	}

	/* Elevation shadows */
	.card--elevation-low {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
	}

	.card--elevation-medium {
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
	}

	.card--elevation-high {
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
	}

	/* Interactive hover effects */
	.card--interactive {
		cursor: pointer;
	}

	.card--interactive:hover {
		transform: translateY(-2px) scale(1.02);
		border-color: var(--color-accent);
	}

	.card--interactive:active {
		transform: translateY(0) scale(0.98);
		transition-duration: var(--duration-fast);
	}

	.card--interactive.card--elevation-low:hover {
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
	}

	.card--interactive.card--elevation-medium:hover {
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
	}

	.card--interactive.card--elevation-high:hover {
		box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
	}

	/* Loading skeleton */
	.card--loading {
		pointer-events: none;
	}

	.card__skeleton {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		animation: skeleton-fade-in var(--duration-normal) var(--easing-decelerate);
	}

	@keyframes skeleton-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.skeleton__line {
		background: linear-gradient(
			90deg,
			var(--color-surface-2) 0%,
			var(--color-surface-3) 50%,
			var(--color-surface-2) 100%
		);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
		border-radius: 4px;
		height: 16px;
	}

	.skeleton__line--title {
		width: 60%;
		height: 24px;
		animation-delay: 0.1s;
	}

	.skeleton__line--text {
		width: 100%;
		animation-delay: 0.2s;
	}

	.skeleton__line--text:last-child {
		width: 80%;
		animation-delay: 0.3s;
	}

	@keyframes skeleton-loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.card {
			animation: none;
		}

		.card--interactive:hover {
			transform: none;
		}

		.card--interactive:active {
			transform: none;
		}

		.card__skeleton {
			animation: none;
		}

		.skeleton__line {
			animation: none;
		}
	}
</style>
