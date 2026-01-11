<script lang="ts">
	import { Settings as SettingsIcon } from 'lucide-svelte';
	import CompactWeather from './CompactWeather.svelte';
	import SystemStats from './SystemStats.svelte';
	import { settings } from '$lib/stores/settings';

	interface Props {
		onSettingsToggle: () => void;
	}

	let { onSettingsToggle }: Props = $props();
</script>

<nav class="nav-header" aria-label="Main navigation">
	<div class="nav-header__container">
		<div class="nav-header__brand">
			<span class="nav-header__logo" aria-hidden="true">⚡</span>
			<h1 class="nav-header__title">Dev Dash</h1>
		</div>

		<div class="nav-header__actions">
			{#if $settings.showSystemStats}
				<SystemStats />
			{/if}
			<CompactWeather />
			<button
				onclick={onSettingsToggle}
				class="nav-header__settings-btn"
				aria-label="Open settings (Keyboard shortcut: Control comma)"
				title="Settings (Ctrl+,)"
				type="button"
			>
				<SettingsIcon size={20} aria-hidden="true" />
			</button>
		</div>
	</div>
</nav>

<style>
	.nav-header {
		width: 100%;
		background-color: var(--color-background);
		border-bottom: 1px solid var(--color-border);
	}

	.nav-header__container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-6);
		max-width: 100%;
	}

	.nav-header__brand {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.nav-header__logo {
		font-size: var(--font-size-2xl);
		line-height: 1;
	}

	.nav-header__title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		letter-spacing: var(--letter-spacing-tight);
	}

	.nav-header__actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.nav-header__settings-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		background-color: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--duration-normal) var(--easing-standard);
		/* Touch-friendly minimum size */
		min-width: 44px;
		min-height: 44px;
	}

	.nav-header__settings-btn:hover {
		background-color: var(--color-surface-1);
		color: var(--color-text-primary);
		border-color: var(--color-accent);
		transform: rotate(90deg);
		box-shadow: 0 0 12px rgba(88, 166, 255, 0.3);
	}

	.nav-header__settings-btn:active {
		transform: rotate(90deg) scale(0.95);
		transition-duration: var(--duration-fast);
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
		.nav-header__settings-btn {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.nav-header__settings-btn:active {
			background-color: var(--color-surface-2);
			transform: scale(0.95);
		}
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.nav-header__container {
			padding: var(--space-3) var(--space-4);
		}

		.nav-header__title {
			font-size: var(--font-size-base);
		}

		.nav-header__logo {
			font-size: var(--font-size-xl);
		}

		.nav-header__settings-btn {
			padding: var(--space-2);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.nav-header__settings-btn {
			transition: none;
		}

		.nav-header__settings-btn:active {
			transform: none;
		}
	}
</style>
