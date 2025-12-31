<script lang="ts">
	import { X } from 'lucide-svelte';
	import { settings } from '$lib/stores/settings';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	interface Props {
		isOpen: boolean;
	}

	let { isOpen = $bindable() }: Props = $props();
	let dialogElement = $state<HTMLDivElement>();

	function close() {
		isOpen = false;
	}

	// Focus trap for accessibility
	onMount(() => {
		if (isOpen && dialogElement) {
			const focusableElements = dialogElement.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0] as HTMLElement;
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

			firstElement?.focus();

			const handleTabKey = (e: KeyboardEvent) => {
				if (e.key !== 'Tab') return;

				if (e.shiftKey) {
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement?.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement?.focus();
					}
				}
			};

			document.addEventListener('keydown', handleTabKey);
			return () => document.removeEventListener('keydown', handleTabKey);
		}
	});
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
		onclick={close}
		role="presentation"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={dialogElement}
			transition:fly={{ y: 20, duration: 200 }}
			class="bg-[#161b22] border border-[#30363d] rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="settings-title"
			tabindex="-1"
		>
			<div class="flex justify-between items-center mb-6">
				<h2 id="settings-title" class="text-xl font-mono font-bold text-[#c9d1d9]">Settings</h2>
				<button
					onclick={close}
					class="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 p-1.5 rounded-lg transition-all duration-200 cursor-pointer"
					aria-label="Close settings"
					type="button"
				>
					<X size={20} aria-hidden="true" />
				</button>
			</div>

			<div class="space-y-4" role="group" aria-label="Settings options">
				<label class="flex items-center justify-between cursor-pointer group">
					<span class="text-zinc-400 font-mono group-hover:text-zinc-300">24-Hour Clock</span>
					<input
						type="checkbox"
						checked={$settings.use24Hour}
						onchange={(e) => settings.update(s => ({ ...s, use24Hour: e.currentTarget.checked }))}
						class="accent-[#58a6ff] w-4 h-4 cursor-pointer"
						aria-label="Toggle 24-hour clock format"
					/>
				</label>

				<label class="flex items-center justify-between cursor-pointer group">
					<span class="text-zinc-400 font-mono group-hover:text-zinc-300">Show Greeting</span>
					<input
						type="checkbox"
						checked={$settings.showGreeting}
						onchange={(e) => settings.update(s => ({ ...s, showGreeting: e.currentTarget.checked }))}
						class="accent-[#58a6ff] w-4 h-4 cursor-pointer"
						aria-label="Toggle greeting message"
					/>
				</label>

				<label class="flex items-center justify-between cursor-pointer group">
					<span class="text-zinc-400 font-mono group-hover:text-zinc-300">Show Pomodoro</span>
					<input
						type="checkbox"
						checked={$settings.showPomodoro}
						onchange={(e) => settings.update(s => ({ ...s, showPomodoro: e.currentTarget.checked }))}
						class="accent-[#58a6ff] w-4 h-4 cursor-pointer"
						aria-label="Toggle Pomodoro timer widget"
					/>
				</label>

				<label class="flex items-center justify-between cursor-pointer group">
					<span class="text-zinc-400 font-mono group-hover:text-zinc-300">Show Scratchpad</span>
					<input
						type="checkbox"
						checked={$settings.showNotepad}
						onchange={(e) => settings.update(s => ({ ...s, showNotepad: e.currentTarget.checked }))}
						class="accent-[#58a6ff] w-4 h-4 cursor-pointer"
						aria-label="Toggle scratchpad widget"
					/>
				</label>

				<div class="h-px bg-zinc-800 my-4" role="separator" aria-hidden="true"></div>

				<label class="flex items-center justify-between cursor-pointer group">
					<span class="text-zinc-400 font-mono group-hover:text-zinc-300">Show Weather</span>
					<input
						type="checkbox"
						checked={$settings.showWeather}
						onchange={(e) => settings.update(s => ({ ...s, showWeather: e.currentTarget.checked }))}
						class="accent-[#58a6ff] w-4 h-4 cursor-pointer"
						aria-label="Toggle weather widget"
					/>
				</label>

				<label class="flex items-center justify-between cursor-pointer group">
					<span class="text-zinc-400 font-mono group-hover:text-zinc-300">Show Tech News</span>
					<input
						type="checkbox"
						checked={$settings.showTechNews}
						onchange={(e) => settings.update(s => ({ ...s, showTechNews: e.currentTarget.checked }))}
						class="accent-[#58a6ff] w-4 h-4 cursor-pointer"
						aria-label="Toggle tech news widget"
					/>
				</label>

				<label class="flex items-center justify-between cursor-pointer group">
					<span class="text-zinc-400 font-mono group-hover:text-zinc-300">Show GitHub Stats</span>
					<input
						type="checkbox"
						checked={$settings.showGitHubStats}
						onchange={(e) => settings.update(s => ({ ...s, showGitHubStats: e.currentTarget.checked }))}
						class="accent-[#58a6ff] w-4 h-4 cursor-pointer"
						aria-label="Toggle GitHub stats widget"
					/>
				</label>

				<div class="h-px bg-zinc-800 my-4" role="separator" aria-hidden="true"></div>

				<div class="flex flex-col gap-2">
					<label for="github-username" class="text-xs font-mono text-zinc-500 uppercase">GitHub Username</label>
					<input
						id="github-username"
						type="text"
						value={$settings.githubUsername}
						oninput={(e) => settings.update(s => ({ ...s, githubUsername: e.currentTarget.value }))}
						placeholder="e.g. torvalds"
						class="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:border-blue-500 outline-none"
						aria-label="GitHub username"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label for="display-name" class="text-xs font-mono text-zinc-500 uppercase">Display Name</label>
					<input
						id="display-name"
						type="text"
						value={$settings.displayName}
						oninput={(e) => settings.update(s => ({ ...s, displayName: e.currentTarget.value }))}
						placeholder="e.g. Linus"
						class="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:border-blue-500 outline-none"
						aria-label="Display name for greeting"
					/>
				</div>
			</div>
		</div>
	</div>
{/if}
