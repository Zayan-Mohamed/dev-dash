<script lang="ts">
	import { onMount } from 'svelte';
	import ViewportLayout from '$lib/components/ViewportLayout.svelte';
	import NavigationHeader from '$lib/components/NavigationHeader.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import TopSites from '$lib/components/TopSites.svelte';
	import Omnibar from '$lib/components/Omnibar.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import Pomodoro from '$lib/components/Pomodoro.svelte';
	import Notepad from '$lib/components/Notepad.svelte';
	import Weather from '$lib/components/Weather.svelte';
	import GitHubStats from '$lib/components/GitHubStats.svelte';
	import TechNews from '$lib/components/TechNews.svelte';
	import { getTopSites } from '$lib/services/topSites';
	import type { Site } from '$lib/services/topSites';
	import { settings } from '$lib/stores/settings';

	let sites = $state<Site[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let settingsOpen = $state(false);

	// Derived state: show TechNews only when both Pomodoro and Notepad are not both visible
	let bothWidgetsVisible = $derived($settings.showPomodoro && $settings.showNotepad);
	let showTechNews = $derived($settings.showTechNews && !bothWidgetsVisible);

	onMount(async () => {
		// Initialize settings store
		await settings.init();
		
		// Load top sites
		try {
			const data = await getTopSites();
			sites = data;
		} catch (err) {
			console.error('Error loading sites:', err);
			error = err instanceof Error ? err.message : 'Failed to load sites';
		} finally {
			loading = false;
		}
	});

	function toggleSettings() {
		settingsOpen = !settingsOpen;
	}

	function handleKeydown(event: KeyboardEvent) {
		// Global keyboard shortcuts
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case ',':
					event.preventDefault();
					toggleSettings();
					break;
			}
		}
		
		// Escape key to close settings
		if (event.key === 'Escape' && settingsOpen) {
			settingsOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Skip to main content link for accessibility -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<ViewportLayout>
	{#snippet header()}
		<NavigationHeader onSettingsToggle={toggleSettings} />
	{/snippet}

	{#snippet leftSidebar()}
		{#if $settings.showGitHubStats}
			<GitHubStats animationDelay={0} />
		{/if}
	{/snippet}

	{#snippet centerContent()}
		<div id="main-content" tabindex="-1">
			<!-- Hero Clock Card -->
			<Clock use24Hour={$settings.use24Hour} showGreeting={$settings.showGreeting} animationDelay={100} />

			<!-- Search Card -->
			<Omnibar animationDelay={200} />

			<!-- Top Sites Grid -->
			{#if $settings.showTopSites}
				{#if loading}
					<div class="loading-state" role="status" aria-live="polite">
						<div class="loading-spinner"></div>
						<span class="loading-text">Loading your sites...</span>
					</div>
				{:else if error}
					<div class="error-state" role="alert">
						<span class="error-icon">⚠️</span>
						<span class="error-text">{error}</span>
					</div>
				{:else}
					<TopSites {sites} animationDelay={300} />
				{/if}
			{/if}

			<!-- Content Grid: Tech News and Scratchpad/Pomodoro -->
			<div class="content-grid" class:both-widgets={bothWidgetsVisible}>
				<!-- Tech News (hidden when both widgets are visible) -->
				{#if showTechNews}
					<div class="tech-news-wrapper">
						<TechNews animationDelay={400} />
					</div>
				{/if}

				<!-- Widget Area: Scratchpad or Pomodoro -->
				<div class="widget-wrapper">
					{#if $settings.showNotepad}
						<Notepad animationDelay={500} />
					{/if}
					{#if $settings.showPomodoro}
						<Pomodoro animationDelay={bothWidgetsVisible ? 600 : 500} />
					{/if}
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet rightSidebar()}
		{#if $settings.showWeather}
			<Weather animationDelay={100} />
		{/if}
	{/snippet}
</ViewportLayout>

<!-- Settings Modal -->
{#if settingsOpen}
	<Settings bind:isOpen={settingsOpen} />
{/if}

<style>
	.skip-link {
		position: absolute;
		top: -40px;
		left: 0;
		background: var(--color-accent);
		color: var(--color-background);
		padding: var(--space-2) var(--space-4);
		text-decoration: none;
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		border-radius: 0 0 var(--radius-md) 0;
		z-index: var(--z-tooltip);
		transition: top var(--duration-fast) var(--easing-standard);
	}

	.skip-link:focus {
		top: 0;
		outline: 2px solid var(--color-accent-hover);
		outline-offset: 2px;
	}

	#main-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: 100%;
	}

	#main-content:focus {
		outline: none;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		padding: var(--space-12);
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		min-height: 200px;
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-surface-3);
		border-top-color: var(--color-accent);
		border-radius: var(--radius-full);
		animation: spin 0.8s linear infinite;
	}

	.loading-text {
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-8);
		background: var(--color-surface-1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-lg);
		min-height: 200px;
	}

	.error-icon {
		font-size: var(--font-size-3xl);
	}

	.error-text {
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		color: var(--color-error);
		text-align: center;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.content-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	
	/* When both widgets are visible, make grid single column with widgets side by side */
	.content-grid.both-widgets {
		grid-template-columns: 1fr;
	}
	
	.content-grid.both-widgets .widget-wrapper {
		grid-column: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}

	.tech-news-wrapper {
		grid-column: 1;
	}

	/* Default: widget area takes column 2 and shows single widget at full width */
	.widget-wrapper {
		grid-column: 2;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	@media (max-width: 1024px) {
		.content-grid {
			grid-template-columns: 1fr;
		}

		.tech-news-wrapper,
		.widget-wrapper {
			grid-column: 1;
		}
		
		.widget-wrapper {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-spinner {
			animation: none;
			border-top-color: var(--color-accent);
		}
		
		.skip-link {
			transition: none;
		}
	}
</style>
