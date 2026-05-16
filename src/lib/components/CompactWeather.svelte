<script lang="ts">
	import { onMount } from 'svelte';
	import { MapPin, TriangleAlert } from 'lucide-svelte';
	import { weatherState, weatherActions } from '$lib/stores/weather.svelte';

	onMount(() => {
		// Fetch will use cache if available or deduplicate with Weather component
		weatherActions.fetch();
	});
</script>

{#if weatherState.loading}
	<div class="compact-weather compact-weather--loading">
		<div class="compact-weather__spinner"></div>
	</div>
{:else if weatherState.error}
	<div class="compact-weather compact-weather--error">
		<span class="compact-weather__error-icon"><TriangleAlert size={14} /></span>
	</div>
{:else if weatherState.data}
	<div class="compact-weather" title="Weather">
		<div class="compact-weather__temp">
			<span class="compact-weather__temp-value">{weatherState.data.temperature}°</span>
		</div>
		{#if weatherState.data.location}
			<div class="compact-weather__location">
				<MapPin size={10} />
				<span class="compact-weather__location-text">{weatherState.data.location}</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	.compact-weather {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		min-height: 32px;
	}

	.compact-weather--loading {
		justify-content: center;
	}

	.compact-weather--error {
		justify-content: center;
		padding: var(--space-1) var(--space-3);
	}

	.compact-weather__spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-surface-3);
		border-top-color: var(--color-accent);
		border-radius: var(--radius-full);
		animation: spin 0.8s linear infinite;
	}

	.compact-weather__error-icon {
		font-size: var(--font-size-sm);
	}

	.compact-weather__temp {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.compact-weather__temp-value {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
		font-size: var(--font-size-sm);
	}

	.compact-weather__location {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		color: var(--color-text-secondary);
	}

	.compact-weather__location-text {
		font-size: var(--font-size-xs);
		max-width: 80px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Hide on larger screens */
	@media (min-width: 1025px) {
		.compact-weather {
			display: none;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.compact-weather__spinner {
			animation: none;
		}
	}
</style>
