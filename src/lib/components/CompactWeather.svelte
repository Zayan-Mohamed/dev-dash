<script lang="ts">
	import { onMount } from 'svelte';
	import { MapPin, RefreshCw, Thermometer } from 'lucide-svelte';

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	let temperature = $state<number | null>(null);
	let location = $state<string | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let refreshing = $state(false);

	async function fetchWeatherData() {
		try {
			loading = true;
			error = null;

			// Get user's location
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					timeout: 10000,
					enableHighAccuracy: false
				});
			});

			const { latitude, longitude } = position.coords;

			// Fetch weather data from Open-Meteo API
			const response = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto&forecast_days=1`
			);

			if (!response.ok) {
				throw new Error('Weather API request failed');
			}

			const data = await response.json();

			temperature = Math.round(data.current.temperature_2m);
			location = null; // We'll get location name from reverse geocoding

			// Try to get location name
			try {
				const locationResponse = await fetch(
					`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
				);
				if (locationResponse.ok) {
					const locationData = await locationResponse.json();
					location = locationData.city || locationData.locality || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
				}
			} catch {
				location = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
			}
		} catch (err) {
			console.error('Weather fetch error:', err);
			error = err instanceof Error ? err.message : 'Failed to fetch weather';
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	onMount(() => {
		fetchWeatherData();
	});

	async function handleRefresh() {
		refreshing = true;
		await fetchWeatherData();
	}
</script>

{#if loading}
	<div class="compact-weather compact-weather--loading">
		<div class="compact-weather__spinner"></div>
	</div>
{:else if error}
	<div class="compact-weather compact-weather--error">
		<span class="compact-weather__error-icon">⚠️</span>
	</div>
{:else}
	<div class="compact-weather" title="Weather">
		<div class="compact-weather__temp">
			<span class="compact-weather__temp-value">{temperature}°</span>
		</div>
		{#if location}
			<div class="compact-weather__location">
				<MapPin size={10} />
				<span class="compact-weather__location-text">{location}</span>
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