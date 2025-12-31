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
						location = geoData.city || geoData.locality || geoData.principalSubdivision || 'Unknown';
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

<Card variant="medium" elevation="medium" {loading} {animationDelay}>
	{#if error}
		<div class="weather__error">
			<Cloud size={32} class="text-zinc-600" />
			<p class="text-xs font-mono text-red-400 text-center mt-2">{error}</p>
			<button onclick={handleRefresh} class="weather__refresh-btn mt-3">
				<RefreshCw size={14} class={refreshing ? 'animate-spin' : ''} />
				Retry
			</button>
		</div>
	{:else}
		<div class="weather">
			<!-- Header -->
			<div class="weather__header">
				<div class="flex items-center gap-2">
					<Thermometer size={16} class="text-zinc-400" />
					<h3 class="text-sm font-semibold text-zinc-200">Weather</h3>
				</div>
				<button 
					onclick={handleRefresh} 
					class="weather__icon-btn"
					disabled={refreshing}
					aria-label="Refresh weather"
				>
					<RefreshCw size={14} class={refreshing ? 'animate-spin' : ''} />
				</button>
			</div>

			<!-- Main Weather Display -->
			<div class="weather__main">
				<div class="weather__icon-container">
					<Icon size={64} class="weather__icon" />
				</div>
				<div class="weather__temp-container">
					<span class="weather__temp">{temperature}°</span>
					<span class="weather__unit">C</span>
				</div>
				<p class="weather__description">{description}</p>
			</div>

			<!-- Location -->
			{#if location}
				<div class="weather__location">
					<MapPin size={12} />
					<span>{location}</span>
				</div>
			{/if}

			<!-- Additional Info -->
			<div class="weather__details">
				{#if windSpeed !== null}
					<div class="weather__detail">
						<Wind size={14} class="text-blue-400" />
						<div class="weather__detail-content">
							<span class="weather__detail-value">{windSpeed}</span>
							<span class="weather__detail-label">km/h</span>
						</div>
					</div>
				{/if}
				{#if humidity !== null}
					<div class="weather__detail">
						<Cloud size={14} class="text-cyan-400" />
						<div class="weather__detail-content">
							<span class="weather__detail-value">{humidity}</span>
							<span class="weather__detail-label">% humidity</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- Quick Tools Section -->
			<div class="weather__tools">
				<h4 class="weather__tools-title">Quick Tools</h4>
				<div class="weather__tools-grid">
					<a 
						href="https://github.com" 
						target="_blank" 
						rel="noopener noreferrer"
						class="weather__tool"
					>
						<span class="weather__tool-icon">🐙</span>
						<span class="weather__tool-label">GitHub</span>
					</a>
					<a 
						href="https://stackoverflow.com" 
						target="_blank" 
						rel="noopener noreferrer"
						class="weather__tool"
					>
						<span class="weather__tool-icon">📚</span>
						<span class="weather__tool-label">Stack</span>
					</a>
					<a 
						href="https://developer.mozilla.org" 
						target="_blank" 
						rel="noopener noreferrer"
						class="weather__tool"
					>
						<span class="weather__tool-icon">📖</span>
						<span class="weather__tool-label">MDN</span>
					</a>
					<a 
						href="https://www.npmjs.com" 
						target="_blank" 
						rel="noopener noreferrer"
						class="weather__tool"
					>
						<span class="weather__tool-icon">📦</span>
						<span class="weather__tool-label">npm</span>
					</a>
				</div>
			</div>
		</div>
	{/if}
</Card>

<style>
	.weather {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: 100%;
	}

	.weather__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-border);
	}

	.weather__icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast) var(--easing-standard);
		/* Touch-friendly minimum size */
		min-width: 44px;
		min-height: 44px;
	}

	.weather__icon-btn:hover:not(:disabled) {
		background: var(--color-surface-2);
		color: var(--color-text-primary);
	}

	.weather__icon-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.weather__main {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4) 0;
	}

	.weather__icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 96px;
		height: 96px;
		background: var(--color-surface-2);
		border-radius: var(--radius-full);
		border: 2px solid var(--color-border);
	}

	.weather__icon-container :global(svg) {
		color: var(--color-text-primary);
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.weather__temp-container {
		display: flex;
		align-items: flex-start;
		gap: var(--space-1);
	}

	.weather__temp {
		font-size: 3rem;
		font-weight: 700;
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
		line-height: 1;
	}

	.weather__unit {
		font-size: var(--font-size-xl);
		font-weight: 500;
		color: var(--color-text-secondary);
		margin-top: var(--space-2);
	}

	.weather__description {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		text-transform: capitalize;
	}

	.weather__location {
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

	.weather__details {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2);
	}

	.weather__detail {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.weather__detail-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.weather__detail-value {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
	}

	.weather__detail-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.weather__tools {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--color-border);
	}

	.weather__tools-title {
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.weather__tools-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2);
	}

	.weather__tool {
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
		/* Touch-friendly minimum size */
		min-height: 64px;
	}

	.weather__tool:hover {
		background: var(--color-surface-3);
		border-color: var(--color-accent);
		transform: translateY(-2px);
	}

	.weather__tool-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.weather__tool-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.weather__tool:hover .weather__tool-label {
		color: var(--color-text-primary);
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
		.weather__icon-container {
			width: 80px;
			height: 80px;
		}

		.weather__icon-container :global(svg) {
			width: 48px;
			height: 48px;
		}

		.weather__temp {
			font-size: 2.5rem;
		}

		.weather__tools-grid {
			grid-template-columns: repeat(4, 1fr);
		}

		.weather__tool {
			padding: var(--space-2);
			min-height: 56px;
		}

		.weather__tool-icon {
			font-size: 1.25rem;
		}
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
		.weather__icon-btn {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.weather__tool {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.weather__tool:active {
			background: var(--color-surface-3);
			transform: scale(0.95);
		}

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
		.weather__tool:hover {
			transform: none;
		}

		:global(.animate-spin) {
			animation: none;
		}
	}
</style>
