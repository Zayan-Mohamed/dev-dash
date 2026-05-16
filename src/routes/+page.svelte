<script lang="ts">
	import { onMount } from 'svelte';
	import ViewportLayout from '$lib/components/ViewportLayout.svelte';
	import NavigationHeader from '$lib/components/NavigationHeader.svelte';
	import FlippableClock from '$lib/components/FlippableClock.svelte';
	import TopSites from '$lib/components/TopSites.svelte';
	import Omnibar from '$lib/components/Omnibar.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import Notepad from '$lib/components/Notepad.svelte';
	import Weather from '$lib/components/Weather.svelte';
	import TechNews from '$lib/components/TechNews.svelte';
	import GitHubStats from '$lib/components/GitHubStats.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import { getTopSites } from '$lib/services/topSites';
	import type { Site } from '$lib/services/topSites';
	import { settings } from '$lib/stores/settings';

	let sites = $state<Site[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let settingsOpen = $state(false);
	let omnibarRef: Omnibar;
	let screenWidth = $state(0);

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

	$effect(() => {
		// Set initial screen width
		screenWidth = window.innerWidth;

		// Listen for resize
		const handleResize = () => {
			screenWidth = window.innerWidth;
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	function toggleSettings() {
		settingsOpen = !settingsOpen;
	}

	function handleKeydown(event: KeyboardEvent) {
		// Prevent focus if user is typing in another input
		const target = event.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
			// Allow global shortcuts with modifiers
			if (event.ctrlKey || event.metaKey) {
				if (event.key === ',') {
					event.preventDefault();
					toggleSettings();
				} else if (event.key === 'k') {
					event.preventDefault();
					omnibarRef?.focus();
				}
			}
			return;
		}

		// Global keyboard shortcuts
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case ',':
					event.preventDefault();
					toggleSettings();
					break;
				case 'k':
					event.preventDefault();
					if (omnibarRef) {
						omnibarRef.focus();
					}
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
		{#if $settings.showNotepad}
			<Notepad animationDelay={100} />
		{/if}
		{#if screenWidth <= 1024 && $settings.showTechNews}
			<TechNews animationDelay={200} />
		{/if}
	{/snippet}

	{#snippet centerContent()}
		<div id="main-content">
			<!-- Flippable Clock/Pomodoro Card -->
			<FlippableClock
				use24Hour={$settings.use24Hour}
				showGreeting={$settings.showGreeting}
				animationDelay={100}
			/>

			<!-- Search Card -->
			<Omnibar bind:this={omnibarRef} animationDelay={200} />

			<!-- Top Sites Grid -->
			{#if $settings.showTopSites}
				{#if loading}
					<LoadingState message="Loading your sites..." />
				{:else if error}
					<ErrorState message={error} />
				{:else}
					<TopSites {sites} animationDelay={300} />
				{/if}
			{/if}
		</div>
	{/snippet}

	{#snippet rightSidebar()}
		{#if $settings.showWeather}
			<Weather animationDelay={100} />
		{/if}
		{#if screenWidth > 1024 && $settings.showTechNews}
			<TechNews animationDelay={200} />
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
		gap: var(--space-5);
		width: 100%;
	}

	#main-content:focus {
		outline: none;
	}

	/* Responsive adjustments */
	@media (max-width: 1024px) {
		#main-content {
			gap: var(--space-4);
		}
	}

	@media (max-width: 768px) {
		#main-content {
			gap: var(--space-4);
			max-width: 100%;
		}
	}

	@media (max-width: 640px) {
		#main-content {
			gap: var(--space-3);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skip-link {
			transition: none;
		}
	}
</style>
