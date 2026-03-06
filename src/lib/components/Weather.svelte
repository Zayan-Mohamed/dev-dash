<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Cloud,
		Sun,
		CloudRain,
		CloudSnow,
		CloudLightning,
		Wind,
		MapPin,
		RefreshCw,
		Thermometer
	} from 'lucide-svelte';
	import Card from './Card.svelte';
	import { weatherState, weatherActions } from '$lib/stores/weather.svelte';

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	// WMO Weather interpretation codes (WW)
	function getWeatherIcon(code: number | null) {
		if (code === null) return Sun;
		if (code <= 1) return Sun; // Clear/Mainly Clear
		if (code <= 3) return Cloud; // Partly Cloudy/Overcast
		if (code <= 48) return Wind; // Fog
		if (code <= 67) return CloudRain; // Drizzle/Rain
		if (code <= 77) return CloudSnow; // Snow grains
		if (code <= 82) return CloudRain; // Rain showers
		if (code <= 86) return CloudSnow; // Snow showers
		if (code <= 99) return CloudLightning; // Thunderstorm
		return Sun;
	}

	function getWeatherDescription(code: number | null): string {
		if (code === null) return 'Unknown';
		if (code === 0) return 'Clear sky';
		if (code <= 1) return 'Mainly clear';
		if (code === 2) return 'Partly cloudy';
		if (code === 3) return 'Overcast';
		if (code <= 48) return 'Foggy';
		if (code <= 67) return 'Rainy';
		if (code <= 77) return 'Snowy';
		if (code <= 82) return 'Rain showers';
		if (code <= 86) return 'Snow showers';
		if (code <= 99) return 'Thunderstorm';
		return 'Unknown';
	}

	onMount(() => {
		// Fetch will use cache if available or deduplicate with other components
		weatherActions.fetch();
	});

	async function handleRefresh() {
		await weatherActions.refresh();
	}

	let Icon = $derived(getWeatherIcon(weatherState.data?.weatherCode ?? null));
	let description = $derived(getWeatherDescription(weatherState.data?.weatherCode ?? null));
</script>

<Card
	variant="medium"
	elevation="medium"
	loading={weatherState.loading}
	{animationDelay}
	class="weather-card"
>
	{#if weatherState.error}
		<div class="weather__error">
			<Cloud size={24} class="text-zinc-600" />
			<p class="mt-2 text-center font-mono text-xs text-red-400">{weatherState.error}</p>
			<button onclick={handleRefresh} class="weather__refresh-btn mt-3">
				<RefreshCw size={14} class={weatherState.refreshing ? 'animate-spin' : ''} />
				Retry
			</button>
		</div>
	{:else if weatherState.data}
		<div class="weather">
			<!-- Weather Header -->
			<div class="weather-header">
				<Icon size={20} class="text-orange-500" />
				<h3 class="weather-title">Weather</h3>
			</div>

			<!-- Main Temperature Display -->
			<div class="weather-main">
				<div class="weather-temp-display">
					<span class="weather-temp">{weatherState.data.temperature}°</span>
					<span class="weather-unit">C</span>
				</div>
				<p class="weather-description">{description}</p>
				{#if weatherState.data.location}
					<div class="weather-location">
						<MapPin size={12} />
						<span>{weatherState.data.location}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</Card>

<style>
	:global(.weather-card) {
		min-height: 400px;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.weather-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-bottom: var(--space-1);
		border-bottom: 1px solid var(--color-border);
		width: fit-content;
		margin-bottom: var(--space-1);
	}

	.weather-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.weather-main {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) 0 var(--space-2);
		flex: 1;
		justify-content: center;
	}

	.weather-temp-display {
		display: flex;
		align-items: flex-start;
		gap: var(--space-1);
	}

	.weather-temp {
		font-size: 4rem;
		font-weight: 700;
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
		line-height: 1;
	}

	.weather-unit {
		font-size: var(--font-size-xl);
		font-weight: 500;
		color: var(--color-text-secondary);
		margin-top: var(--space-2);
	}

	.weather-description {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		text-transform: capitalize;
		text-align: center;
	}

	.weather-location {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
	}

	.weather {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		flex: 1;
		min-height: 0;
		padding: var(--space-2) 0;
	}

	.weather__error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 200px;
	}

	.weather__refresh-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-xs);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--duration-fast) var(--easing-standard);
	}

	.weather__refresh-btn:hover {
		background: var(--color-surface-3);
		border-color: var(--color-accent);
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.weather-temp {
			font-size: 2.5rem;
		}
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
		.weather__refresh-btn {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.weather__refresh-btn:active {
			background: var(--color-surface-3);
			transform: scale(0.95);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		:global(.animate-spin) {
			animation: none;
		}
	}
</style>
