<script lang="ts">
	import type { Site } from '$lib/services/topSites';
	import Card from './Card.svelte';

	let { sites, loading = false, animationDelay = 0 }: { sites: Site[]; loading?: boolean; animationDelay?: number } = $props();
</script>

<Card variant="medium" elevation="low" class="top-sites-card" {animationDelay}>
	<div class="top-sites-header">
		<h3 class="top-sites-title">Quick Access</h3>
		<span class="top-sites-count">{sites.length} sites</span>
	</div>

	{#if loading}
		<div class="top-sites-grid">
			{#each Array(6) as _, i}
				<div class="top-site-skeleton">
					<div class="top-site-skeleton__icon"></div>
					<div class="top-site-skeleton__text"></div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="top-sites-grid">
			{#each sites as site (site.url)}
				<a href={site.url} class="top-site">
					<div class="top-site__icon-wrapper">
						<img
							src={`https://www.google.com/s2/favicons?domain=${site.url}&sz=32`}
							alt=""
							class="top-site__icon"
							loading="lazy"
						/>
					</div>
					<span class="top-site__title">{site.title}</span>
				</a>
			{/each}
		</div>
	{/if}
</Card>

<style>
	:global(.top-sites-card) {
		width: 100%;
		max-width: 720px;
		margin: 0 auto;
	}

	.top-sites-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-3);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}

	.top-sites-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
	}

	.top-sites-count {
		font-size: var(--font-size-xs);
		font-family: 'Courier New', monospace;
		color: var(--color-text-muted);
		background: var(--color-surface-2);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.top-sites-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: var(--space-2);
		width: 100%;
	}

	.top-site {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: all var(--duration-fast) var(--easing-standard);
		overflow: hidden;
		/* Touch-friendly minimum size */
		min-height: 72px;
	}

	.top-site::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			rgba(88, 166, 255, 0.05) 0%,
			transparent 100%
		);
		opacity: 0;
		transition: opacity var(--duration-fast) var(--easing-standard);
	}

	.top-site::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at center, rgba(88, 166, 255, 0.3) 0%, transparent 70%);
		opacity: 0;
		transform: scale(0);
		transition: all var(--duration-normal) var(--easing-decelerate);
	}

	.top-site:hover {
		background: var(--color-surface-3);
		border-color: var(--color-accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.top-site:hover::before {
		opacity: 1;
	}

	.top-site:active::after {
		opacity: 1;
		transform: scale(2);
		transition-duration: 0s;
	}

	.top-site:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.top-site__icon-wrapper {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--color-surface-1);
		border-radius: var(--radius-sm);
		transition: all var(--duration-fast) var(--easing-standard);
	}

	.top-site:hover .top-site__icon-wrapper {
		transform: scale(1.1);
		box-shadow: 0 0 12px rgba(88, 166, 255, 0.3);
	}

	.top-site__icon {
		width: 20px;
		height: 20px;
		border-radius: var(--radius-sm);
	}

	.top-site__title {
		position: relative;
		z-index: 1;
		width: 100%;
		font-size: var(--font-size-xs);
		font-family: 'Courier New', monospace;
		color: var(--color-text-secondary);
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition: color var(--duration-fast) var(--easing-standard);
	}

	.top-site:hover .top-site__title {
		color: var(--color-text-primary);
	}

	/* Loading skeleton */
	.top-site-skeleton {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.top-site-skeleton__icon {
		width: 32px;
		height: 32px;
		background: linear-gradient(
			90deg,
			var(--color-surface-3) 0%,
			var(--color-surface-4) 50%,
			var(--color-surface-3) 100%
		);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
		border-radius: var(--radius-sm);
	}

	.top-site-skeleton__text {
		width: 80%;
		height: 12px;
		background: linear-gradient(
			90deg,
			var(--color-surface-3) 0%,
			var(--color-surface-4) 50%,
			var(--color-surface-3) 100%
		);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s ease-in-out infinite;
		border-radius: var(--radius-sm);
	}

	@keyframes skeleton-loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.top-sites-grid {
			grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
			gap: var(--space-2);
		}

		.top-site {
			padding: var(--space-2);
			min-height: 68px;
		}

		.top-site__icon-wrapper {
			width: 28px;
			height: 28px;
		}

		.top-site__icon {
			width: 18px;
			height: 18px;
		}

		.top-sites-title {
			font-size: var(--font-size-sm);
		}
	}

	@media (max-width: 480px) {
		.top-sites-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-2);
		}

		.top-site {
			padding: var(--space-2);
		}

		.top-sites-header {
			margin-bottom: var(--space-2);
		}
	}

	@media (min-width: 769px) and (max-width: 1024px) {
		.top-sites-grid {
			grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
		}
	}

	@media (min-width: 1025px) {
		.top-sites-grid {
			grid-template-columns: repeat(8, 1fr);
		}
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
		.top-site {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.top-site:active {
			background: var(--color-surface-3);
			transform: scale(0.95);
		}

		.top-site:active::after {
			opacity: 1;
			transform: scale(2);
			transition-duration: 0s;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.top-site,
		.top-site__icon-wrapper,
		.top-site__title,
		.top-site::before {
			transition: none;
		}

		.top-site:hover {
			transform: none;
		}

		.top-site:hover .top-site__icon-wrapper {
			transform: none;
		}

		.top-site-skeleton__icon,
		.top-site-skeleton__text {
			animation: none;
		}
	}
</style>
