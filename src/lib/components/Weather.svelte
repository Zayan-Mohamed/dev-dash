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

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	let temperature = $state<number | null>(null);
	let weatherCode = $state<number | null>(null);
	let location = $state<string | null>(null);
	let windSpeed = $state<number | null>(null);
	let humidity = $state<number | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let refreshing = $state(false);

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

	async function fetchWeatherData() {
		if (!navigator.geolocation) {
			error = 'Geolocation not supported';
			loading = false;
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					loading = true;
					error = null;

					const { latitude, longitude } = position.coords;

					// Fetch weather data
					const weatherRes = await fetch(
						`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m`
					);
					const weatherData = await weatherRes.json();

					temperature = weatherData.current_weather.temperature;
					weatherCode = weatherData.current_weather.weathercode;
					windSpeed = weatherData.current_weather.windspeed;

					// Get humidity from hourly data (first value)
					if (weatherData.hourly?.relative_humidity_2m?.[0]) {
						humidity = weatherData.hourly.relative_humidity_2m[0];
					}

					// Fetch location name using reverse geocoding
					try {
						const geoRes = await fetch(
							`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
						);
						const geoData = await geoRes.json();
						location =
							geoData.city || geoData.locality || geoData.principalSubdivision || 'Unknown';
					} catch {
						location = 'Unknown location';
					}
				} catch (err) {
					error = 'Failed to fetch weather';
					console.error(err);
				} finally {
					loading = false;
					refreshing = false;
				}
			},
			() => {
				error = 'Location access denied';
				loading = false;
				refreshing = false;
			}
		);
	}

	onMount(() => {
		fetchWeatherData();
	});

	async function handleRefresh() {
		refreshing = true;
		await fetchWeatherData();
	}

	let Icon = $derived(getWeatherIcon(weatherCode));
	let description = $derived(getWeatherDescription(weatherCode));
</script>

<Card variant="medium" elevation="medium" {loading} {animationDelay} class="weather-card">
	{#if error}
		<div class="weather__error">
			<Cloud size={24} class="text-zinc-600" />
			<p class="mt-2 text-center font-mono text-xs text-red-400">{error}</p>
			<button onclick={handleRefresh} class="weather__refresh-btn mt-3">
				<RefreshCw size={14} class={refreshing ? 'animate-spin' : ''} />
				Retry
			</button>
		</div>
	{:else}
		<div class="weather">
			<!-- Weather Header -->
			<div class="weather-header">
				<Icon size={20} class="text-orange-500" />
				<h3 class="weather-title">Weather</h3>
			</div>

			<!-- Main Temperature Display -->
			<div class="weather-main">
				<div class="weather-temp-display">
					<span class="weather-temp">{temperature}°</span>
					<span class="weather-unit">C</span>
				</div>
				<p class="weather-description">{description}</p>
				{#if location}
					<div class="weather-location">
						<MapPin size={12} />
						<span>{location}</span>
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
