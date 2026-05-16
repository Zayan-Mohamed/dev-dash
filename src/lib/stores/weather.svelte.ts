/**
 * Weather Store with Caching and Request Deduplication
 * Eliminates duplicate API calls between Weather and CompactWeather components
 */

interface WeatherData {
	temperature: number;
	weatherCode: number;
	windSpeed: number;
	humidity: number | null;
	location: string;
	latitude: number;
	longitude: number;
}

interface WeatherState {
	data: WeatherData | null;
	loading: boolean;
	error: string | null;
	lastFetch: number | null;
	refreshing: boolean;
}

// Cache duration: 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;
const STORAGE_KEY = 'weather-cache';

// Per-request timeout: 8 seconds
const FETCH_TIMEOUT_MS = 8000;

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;

/**
 * Wraps fetch() with an AbortController-based timeout.
 * Throws a descriptive error if the request exceeds FETCH_TIMEOUT_MS.
 */
async function fetchWithTimeout(url: string): Promise<Response> {
	const controller = new AbortController();
	const timerId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	try {
		const res = await fetch(url, { signal: controller.signal });
		return res;
	} catch (err) {
		if (err instanceof DOMException && err.name === 'AbortError') {
			throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS / 1000}s`);
		}
		throw err;
	} finally {
		clearTimeout(timerId);
	}
}

/**
 * Retries an async operation up to MAX_RETRIES times with exponential backoff.
 * Only retries on network/timeout errors; passes through HTTP-level errors immediately.
 */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
	let lastError: unknown;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastError = err;

			const isRetryable =
				err instanceof TypeError || // network error
				(err instanceof Error && err.message.includes('timed out'));

			if (!isRetryable || attempt === MAX_RETRIES) break;

			// Exponential backoff: 500 ms, 1000 ms
			await new Promise((r) => setTimeout(r, RETRY_BASE_DELAY_MS * 2 ** attempt));
		}
	}

	throw lastError;
}

// Track in-flight request to prevent duplicate fetches
let inFlightRequest: Promise<void> | null = null;

// Load cached data from localStorage
function loadCachedData(): WeatherState | null {
	if (typeof window === 'undefined') return null;

	try {
		const cached = localStorage.getItem(STORAGE_KEY);
		if (cached) {
			const state = JSON.parse(cached) as WeatherState;

			// Check if cache is still valid
			if (state.lastFetch && Date.now() - state.lastFetch < CACHE_DURATION) {
				return state;
			}
		}
	} catch (error) {
		console.error('Failed to load weather cache:', error);
	}

	return null;
}

// Initialize state with cached data or defaults
const initialState: WeatherState = loadCachedData() || {
	data: null,
	loading: false,
	error: null,
	lastFetch: null,
	refreshing: false
};

// Create reactive state using Svelte 5 runes
export const weatherState = $state<WeatherState>(initialState);

// Save state to cache
function saveToCache() {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(weatherState));
	} catch (error) {
		console.error('Failed to save weather cache:', error);
	}
}

// Fetch weather data
async function fetchWeatherData(latitude: number, longitude: number): Promise<void> {
	try {
		// Fire both requests in parallel — they are fully independent
		const [weatherRes, geoRes] = await Promise.all([
			withRetry(() =>
				fetchWithTimeout(
					`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto&forecast_days=1`
				)
			),
			// Geocoding failure is non-fatal — wrap in a separate try/catch
			fetchWithTimeout(
				`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
			).catch((err) => {
				console.warn('Geocoding request failed:', err);
				return null;
			})
		]);

		if (!weatherRes.ok) {
			throw new Error(`Weather API responded with status ${weatherRes.status}`);
		}

		const weatherData = await weatherRes.json();

		// Resolve location name from geocoding response (non-fatal if unavailable)
		let locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
		if (geoRes && geoRes.ok) {
			try {
				const geoData = await geoRes.json();
				locationName =
					geoData.city || geoData.locality || geoData.principalSubdivision || locationName;
			} catch {
				// JSON parse failure — keep coordinate fallback
			}
		}

		// Update state with fetched data
		weatherState.data = {
			temperature: Math.round(
				weatherData.current_weather?.temperature ?? weatherData.current?.temperature_2m
			),
			weatherCode:
				weatherData.current_weather?.weathercode ?? weatherData.current?.weather_code ?? 0,
			windSpeed: weatherData.current_weather?.windspeed ?? weatherData.current?.wind_speed_10m ?? 0,
			humidity: weatherData.hourly?.relative_humidity_2m?.[0] ?? null,
			location: locationName,
			latitude,
			longitude
		};
		weatherState.error = null;
		weatherState.lastFetch = Date.now();

		// Save to cache
		saveToCache();
	} catch (err) {
		weatherState.error = err instanceof Error ? err.message : 'Failed to fetch weather';
		console.error('Weather fetch error:', err);
		throw err;
	}
}

async function getGeolocation(): Promise<{ latitude: number; longitude: number }> {
	try {
		// First try HTML5 Geolocation with a short timeout
		if (navigator.geolocation) {
			const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					timeout: 5000,
					enableHighAccuracy: false,
					maximumAge: 5 * 60 * 1000
				});
			});
			return {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude
			};
		}
	} catch (error) {
		console.warn('HTML5 Geolocation failed/denied, falling back to IP geolocation', error);
	}

	// Fallback to IP-based geolocation
	try {
		const ipGeoRes = await fetchWithTimeout('https://get.geojs.io/v1/ip/geo.json');
		if (!ipGeoRes.ok) throw new Error('IP Geolocation failed');
		const ipGeoData = await ipGeoRes.json();
		return {
			latitude: parseFloat(ipGeoData.latitude),
			longitude: parseFloat(ipGeoData.longitude)
		};
	} catch (fallbackError) {
		console.error('IP Geolocation fallback failed:', fallbackError);
		throw new Error('Location unavailable');
	}
}

// Weather actions
export const weatherActions = {
	/**
	 * Fetch weather data with request deduplication and caching
	 * @param force - Force fetch even if cache is valid
	 */
	async fetch(force = false) {
		// If already fetching, return the in-flight request
		if (inFlightRequest) {
			return inFlightRequest;
		}

		// Check if cached data is still valid
		if (
			!force &&
			weatherState.data &&
			weatherState.lastFetch &&
			Date.now() - weatherState.lastFetch < CACHE_DURATION
		) {
			// Cache is still valid, no need to fetch
			return;
		}

		// Start fetching
		weatherState.loading = true;
		weatherState.error = null;

		// Create the fetch promise
		inFlightRequest = (async () => {
			try {
				const { latitude, longitude } = await getGeolocation();
				await fetchWeatherData(latitude, longitude);
			} catch (err) {
				weatherState.error = err instanceof Error ? err.message : 'Failed to fetch weather';
				weatherState.data = null;
			} finally {
				weatherState.loading = false;
				weatherState.refreshing = false;
				inFlightRequest = null;
			}
		})();

		return inFlightRequest;
	},

	/**
	 * Refresh weather data (force fetch)
	 */
	async refresh() {
		weatherState.refreshing = true;
		await this.fetch(true);
	},

	/**
	 * Clear cached data
	 */
	clearCache() {
		if (typeof window === 'undefined') return;

		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			console.error('Failed to clear weather cache:', error);
		}

		weatherState.data = null;
		weatherState.lastFetch = null;
	}
};

// Auto-fetch weather data on initialization if no valid cache
if (typeof window !== 'undefined' && !weatherState.data) {
	weatherActions.fetch();
}
