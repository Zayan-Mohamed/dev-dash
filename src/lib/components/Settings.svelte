<script lang="ts">
	import { X, Settings as SettingsIcon, Globe, Layout, User } from 'lucide-svelte';
	import { settings } from '$lib/stores/settings';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		isOpen: boolean;
	}

	let { isOpen = $bindable() }: Props = $props();

	function close() {
		isOpen = false;
	}

	const settingsSections = [
		{
			title: 'Display',
			icon: Layout,
			settings: [
				{ key: 'use24Hour', label: '24-Hour Clock', description: 'Use 24-hour time format' },
				{
					key: 'showGreeting',
					label: 'Show Greeting',
					description: 'Display personalized greeting'
				}
			]
		},
		{
			title: 'Components',
			icon: Globe,
			settings: [
				{ key: 'showWeather', label: 'Weather Widget', description: 'Show weather information' },
				{ key: 'showGitHubStats', label: 'GitHub Stats', description: 'Display GitHub statistics' },
				{
					key: 'showTopSites',
					label: 'Top Sites',
					description: 'Display frequently visited sites'
				},
				{ key: 'showPomodoro', label: 'Pomodoro Timer', description: 'Enable focus timer' },
				{ key: 'showNotepad', label: 'Notepad', description: 'Enable quick notes' },
				{ key: 'showTechNews', label: 'Tech News', description: 'Show latest tech news' }
			]
		},
		{
			title: 'Profile',
			icon: User,
			inputs: [
				{
					key: 'displayName',
					label: 'Display Name',
					placeholder: 'e.g. Linus',
					description: 'Name shown in greeting'
				},
				{
					key: 'githubUsername',
					label: 'GitHub Username',
					placeholder: 'e.g. torvalds',
					description: 'Username for GitHub stats'
				},
				{
					key: 'githubToken',
					label: 'GitHub Token (Optional)',
					placeholder: 'github_pat_xxxxxxxxxxxx',
					description: 'Avoids rate limits (5k/hr vs 60/hr)',
					type: 'password'
				}
			]
		}
	];
</script>

{#if isOpen}
	<!-- Backdrop -->
	<button
		class="settings-backdrop"
		onclick={close}
		transition:fade={{ duration: 200 }}
		aria-label="Close settings"
	></button>

	<!-- Settings Panel -->
	<div
		class="settings-panel"
		transition:fly={{ x: 400, duration: 300, opacity: 1 }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="settings-title"
	>
		<!-- Header -->
		<div class="settings-header">
			<div class="settings-header-content">
				<div class="settings-icon-wrapper">
					<SettingsIcon size={24} />
				</div>
				<div>
					<h2 id="settings-title" class="settings-title">Settings</h2>
					<p class="settings-subtitle">Customize your dashboard</p>
				</div>
			</div>
			<button onclick={close} class="settings-close" aria-label="Close settings" type="button">
				<X size={20} />
			</button>
		</div>

		<!-- Content -->
		<div class="settings-content">
			{#each settingsSections as section, i}
				{@const IconComponent = section.icon}
				<div class="settings-section" style="--section-delay: {i * 50}ms">
					<div class="settings-section-header">
						<IconComponent size={18} />
						<h3>{section.title}</h3>
					</div>

					{#if section.settings}
						<div class="settings-list">
							{#each section.settings as setting, j}
								<label class="settings-item" style="--item-delay: {i * 50 + j * 30}ms">
									<div class="settings-item-content">
										<span class="settings-item-label">{setting.label}</span>
										<span class="settings-item-description">{setting.description}</span>
									</div>
									<div class="settings-toggle">
										<input
											type="checkbox"
											checked={$settings[setting.key as keyof typeof $settings] as boolean}
											onchange={(e) =>
												settings.update((s) => ({ ...s, [setting.key]: e.currentTarget.checked }))}
											class="settings-toggle-input"
										/>
										<div class="settings-toggle-slider"></div>
									</div>
								</label>
							{/each}
						</div>
					{/if}

					{#if section.inputs}
						<div class="settings-inputs">
							{#each section.inputs as input, j}
								<div class="settings-input-item" style="--item-delay: {i * 50 + j * 30}ms">
									<label for={input.key} class="settings-input-label">
										{input.label}
									</label>
									<span class="settings-input-description">{input.description}</span>
									<input
										id={input.key}
										type={input.type || 'text'}
										value={$settings[input.key as keyof typeof $settings] as string}
										oninput={(e) =>
											settings.update((s) => ({ ...s, [input.key]: e.currentTarget.value }))}
										placeholder={input.placeholder}
										class="settings-input-field"
									/>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Footer -->
		<div class="settings-footer">
			<p class="settings-footer-text">Changes are saved automatically</p>
		</div>
	</div>
{/if}

<style>
	.settings-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: var(--z-modal-backdrop, 1000);
		border: none;
		cursor: default;
	}

	.settings-panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 480px;
		max-width: 90vw;
		background: rgba(22, 27, 34, 0.98);
		backdrop-filter: blur(24px) saturate(180%);
		-webkit-backdrop-filter: blur(24px) saturate(180%);
		border-left: 1px solid rgba(48, 54, 61, 0.8);
		box-shadow:
			-8px 0 32px -8px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		z-index: var(--z-modal, 1100);
		display: flex;
		flex-direction: column;
	}

	.settings-header {
		padding: var(--space-6, 1.5rem);
		border-bottom: 1px solid rgba(48, 54, 61, 0.5);
		background: rgba(22, 27, 34, 0.95);
	}

	.settings-header-content {
		display: flex;
		align-items: center;
		gap: var(--space-4, 1rem);
		margin-bottom: var(--space-2, 0.5rem);
	}

	.settings-icon-wrapper {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
		border-radius: var(--radius-xl, 16px);
		color: white;
		box-shadow: 0 4px 12px rgba(88, 166, 255, 0.4);
	}

	.settings-title {
		font-size: var(--font-size-xl, 1.25rem);
		font-weight: var(--font-weight-bold, 700);
		color: var(--color-text-primary, #c9d1d9);
		margin: 0;
	}

	.settings-subtitle {
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text-secondary, #8b949e);
		margin: 0;
	}

	.settings-close {
		position: absolute;
		top: var(--space-4, 1rem);
		right: var(--space-4, 1rem);
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(48, 54, 61, 0.8);
		border: 1px solid rgba(88, 166, 255, 0.3);
		border-radius: var(--radius-lg, 12px);
		color: var(--color-text-secondary, #8b949e);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.settings-close:hover {
		background: rgba(88, 166, 255, 0.1);
		border-color: rgba(88, 166, 255, 0.6);
		color: var(--color-accent-blue, #58a6ff);
		transform: rotate(90deg);
	}

	.settings-content {
		flex: 1;
		padding: var(--space-6, 1.5rem);
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(88, 166, 255, 0.3) transparent;
	}

	.settings-content::-webkit-scrollbar {
		width: 6px;
	}

	.settings-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.settings-content::-webkit-scrollbar-thumb {
		background: rgba(88, 166, 255, 0.3);
		border-radius: 3px;
	}

	.settings-content::-webkit-scrollbar-thumb:hover {
		background: rgba(88, 166, 255, 0.5);
	}

	.settings-section {
		margin-bottom: var(--space-8, 2rem);
		animation: slideIn var(--duration-normal) var(--easing-decelerate) var(--section-delay, 0ms)
			both;
	}

	.settings-section-header {
		display: flex;
		align-items: center;
		gap: var(--space-3, 0.75rem);
		margin-bottom: var(--space-4, 1rem);
		padding-bottom: var(--space-2, 0.5rem);
		border-bottom: 1px solid rgba(48, 54, 61, 0.3);
	}

	.settings-section-header h3 {
		font-size: var(--font-size-lg, 1.125rem);
		font-weight: var(--font-weight-semibold, 600);
		color: var(--color-text-primary, #c9d1d9);
		margin: 0;
	}

	.settings-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3, 0.75rem);
	}

	.settings-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4, 1rem);
		background: rgba(48, 54, 61, 0.3);
		border: 1px solid rgba(48, 54, 61, 0.5);
		border-radius: var(--radius-lg, 12px);
		cursor: pointer;
		transition: all var(--duration-fast) var(--easing-standard);
		animation: fadeIn var(--duration-normal) var(--easing-decelerate) var(--item-delay, 0ms) both;
	}

	.settings-item:hover {
		background: rgba(88, 166, 255, 0.05);
		border-color: rgba(88, 166, 255, 0.3);
		transform: translateX(4px);
	}

	.settings-item-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1, 0.25rem);
		flex: 1;
	}

	.settings-item-label {
		font-size: var(--font-size-base, 1rem);
		font-weight: var(--font-weight-medium, 500);
		color: var(--color-text-primary, #c9d1d9);
	}

	.settings-item-description {
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text-secondary, #8b949e);
	}

	.settings-toggle {
		position: relative;
		width: 52px;
		height: 28px;
		flex-shrink: 0;
	}

	.settings-toggle-input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
		z-index: 2;
	}

	.settings-toggle-slider {
		position: absolute;
		inset: 0;
		background: rgba(48, 54, 61, 0.8);
		border: 1px solid rgba(48, 54, 61, 0.5);
		border-radius: 14px;
		transition: all var(--duration-fast) var(--easing-standard);
	}

	.settings-toggle-slider::before {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		background: var(--color-text-secondary, #8b949e);
		border-radius: 10px;
		transition: all var(--duration-fast) var(--easing-standard);
	}

	.settings-toggle-input:checked + .settings-toggle-slider {
		background: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
		border-color: rgba(88, 166, 255, 0.5);
		box-shadow: 0 0 12px rgba(88, 166, 255, 0.4);
	}

	.settings-toggle-input:checked + .settings-toggle-slider::before {
		background: white;
		transform: translateX(24px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.settings-inputs {
		display: flex;
		flex-direction: column;
		gap: var(--space-4, 1rem);
	}

	.settings-input-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-4, 1rem);
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: var(--radius-lg, 12px);
		animation: item-enter var(--duration-fast) var(--easing-decelerate);
		animation-delay: var(--item-delay, 0ms);
		animation-fill-mode: both;
	}

	.settings-input-label {
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: var(--font-weight-medium, 500);
		color: var(--color-text-primary, #c9d1d9);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.settings-input-description {
		font-size: var(--font-size-xs, 0.75rem);
		color: var(--color-text-muted, #8b949e);
	}

	.settings-input-field {
		padding: var(--space-3, 0.75rem);
		background: rgba(22, 27, 34, 0.8);
		border: 1px solid rgba(48, 54, 61, 0.8);
		border-radius: var(--radius-md, 8px);
		color: var(--color-text-primary, #c9d1d9);
		font-size: var(--font-size-sm, 0.875rem);
		font-family: var(--font-mono, 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace);
		transition: all var(--duration-fast);
	}

	.settings-input-field:focus {
		outline: none;
		border-color: var(--color-accent-blue, #58a6ff);
		box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
		background: rgba(22, 27, 34, 0.9);
	}

	.settings-input-field::placeholder {
		color: var(--color-text-muted, #8b949e);
	}

	.settings-footer {
		padding: var(--space-6, 1.5rem);
		border-top: 1px solid rgba(48, 54, 61, 0.5);
		background: rgba(22, 27, 34, 0.95);
		text-align: center;
	}

	.settings-footer-text {
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text-secondary, #8b949e);
		margin: 0;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (max-width: 640px) {
		.settings-panel {
			width: 100vw;
			max-width: none;
		}

		.settings-header {
			padding: var(--space-4, 1rem);
		}

		.settings-content {
			padding: var(--space-4, 1rem);
		}

		.settings-footer {
			padding: var(--space-4, 1rem);
		}
	}
</style>
