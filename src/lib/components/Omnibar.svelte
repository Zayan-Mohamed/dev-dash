<script lang="ts">
	import { Terminal, Search } from 'lucide-svelte';
	import { getData, setData } from '$lib/services/storage';
	import Card from './Card.svelte';

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	let input = $state('');
	let history = $state<string[]>([]);
	let historyIndex = $state(-1);
	let showSuggestions = $state(false);
	let isFocused = $state(false);
	let inputElement: HTMLInputElement;

	// Expose focus function to parent
	export function focus() {
		if (inputElement) {
			inputElement.focus();
		}
	}

	// Load command history on mount
	$effect(() => {
		getData('commandHistory').then((data) => {
			history = data;
		});
	});

	// Filtered suggestions based on input
	const suggestions = $derived(() => {
		if (!input.trim() || !showSuggestions) return [];
		
		const commands = [
			{ prefix: 'g', description: 'Google search', example: 'g svelte tutorial' },
			{ prefix: 'gh', description: 'GitHub search', example: 'gh svelte' },
			{ prefix: 'l', description: 'Localhost', example: 'l 3000' },
			{ prefix: 'yt', description: 'YouTube search', example: 'yt coding music' },
			{ prefix: 'tw', description: 'Twitter search', example: 'tw javascript' },
			{ prefix: 'r', description: 'Reddit search', example: 'r programming' },
		];

		const inputLower = input.toLowerCase();
		return commands.filter(cmd => 
			cmd.prefix.startsWith(inputLower) || 
			cmd.description.toLowerCase().includes(inputLower)
		).slice(0, 5);
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (historyIndex < history.length - 1) {
				historyIndex++;
				input = history[history.length - 1 - historyIndex] || '';
			}
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (historyIndex > 0) {
				historyIndex--;
				input = history[history.length - 1 - historyIndex] || '';
			} else if (historyIndex === 0) {
				historyIndex = -1;
				input = '';
			}
		} else if (event.key === 'Escape') {
			showSuggestions = false;
			isFocused = false;
			(event.target as HTMLInputElement).blur();
		}
	}

	function handleFocus() {
		isFocused = true;
		showSuggestions = true;
	}

	function handleBlur() {
		// Delay to allow click on suggestions
		setTimeout(() => {
			isFocused = false;
			showSuggestions = false;
		}, 200);
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		if (!input.trim()) return;

		const command = input.trim();

		// Add to history
		if (command !== history[history.length - 1]) {
			history = [...history, command];
			setData('commandHistory', history.slice(-50)); // Keep last 50
		}

		// Reset
		historyIndex = -1;
		showSuggestions = false;

		// Execute command
		executeCommand(command);
		input = '';
	}

	function executeCommand(command: string) {
		// Command starts with /
		if (command.startsWith('/')) {
			const cmd = command.slice(1).toLowerCase();
			// Placeholder for custom commands
			console.log('Custom command:', cmd);
			return;
		}

		// Shortcut commands
		if (command.startsWith('g ')) {
			// Google search
			const query = command.slice(2);
			window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
			return;
		}

		if (command.startsWith('gh ')) {
			// GitHub search
			const query = command.slice(3);
			window.location.href = `https://github.com/search?q=${encodeURIComponent(query)}`;
			return;
		}

		if (command.startsWith('l ')) {
			// Localhost with port
			const port = command.slice(2) || '3000';
			window.location.href = `http://localhost:${port}`;
			return;
		}

		if (command.startsWith('yt ')) {
			// YouTube search
			const query = command.slice(3);
			window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
			return;
		}

		if (command.startsWith('tw ')) {
			// Twitter search
			const query = command.slice(3);
			window.location.href = `https://twitter.com/search?q=${encodeURIComponent(query)}`;
			return;
		}

		if (command.startsWith('r ')) {
			// Reddit search or subreddit
			const query = command.slice(2);
			if (query.startsWith('/')) {
				window.location.href = `https://reddit.com${query}`;
			} else {
				window.location.href = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`;
			}
			return;
		}

		if (command === 'clear') {
			history = [];
			setData('commandHistory', []);
			return;
		}

		// Default: open as URL or search
		if (command.includes('.') || command.startsWith('http')) {
			const url = command.startsWith('http') ? command : `https://${command}`;
			window.location.href = url;
		} else {
			window.location.href = `https://www.google.com/search?q=${encodeURIComponent(command)}`;
		}
	}
</script>

<Card variant="medium" elevation="medium" class="omnibar-card" {animationDelay}>
	<form onsubmit={handleSubmit} class="omnibar-form" class:omnibar-form--focused={isFocused}>
		<div class="omnibar-input-wrapper">
			<div class="omnibar-icon">
				<Search size={20} />
			</div>
			<input
				bind:this={inputElement}
				bind:value={input}
				onkeydown={handleKeyDown}
				onfocus={handleFocus}
				onblur={handleBlur}
				type="text"
				placeholder="Search or type a command... (g, gh, yt, tw, r, l)"
				class="omnibar-input"
				autocomplete="off"
				spellcheck="false"
				aria-label="Search or command input"
			/>
			<div class="omnibar-shortcuts">
				<kbd class="omnibar-kbd">⌘K</kbd>
			</div>
		</div>

		{#if showSuggestions && suggestions().length > 0}
			<div class="omnibar-suggestions">
				{#each suggestions() as suggestion}
					<button
						type="button"
						class="omnibar-suggestion"
						onclick={() => {
							input = suggestion.example;
							showSuggestions = false;
						}}
					>
						<div class="omnibar-suggestion-icon">
							<Terminal size={14} />
						</div>
						<div class="omnibar-suggestion-content"></div>
							<span class="omnibar-suggestion-prefix">{suggestion.prefix}</span>
							<span class="omnibar-suggestion-description">{suggestion.description}</span>
						<span class="omnibar-suggestion-example">{suggestion.example}</span>
					</button>
				{/each}
			</div>
		{/if}
	</form>
</Card>

<style>
	:global(.omnibar-card) {
		width: 100%;
		max-width: 720px;
		margin: 0 auto;
		padding: 0;
		overflow: visible;
	}

	.omnibar-form {
		position: relative;
		transition: all var(--duration-normal) var(--easing-standard);
	}

	.omnibar-input-wrapper {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: all var(--duration-normal) var(--easing-standard);
	}

	.omnibar-form--focused .omnibar-input-wrapper {
		border-color: var(--color-accent);
		background: var(--color-surface-1);
		box-shadow: 
			0 0 0 3px rgba(88, 166, 255, 0.1),
			0 8px 16px rgba(0, 0, 0, 0.3);
	}

	.omnibar-icon {
		flex-shrink: 0;
		color: var(--color-text-muted);
		transition: color var(--duration-fast) var(--easing-standard);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.omnibar-icon :global(svg) {
		color: inherit;
	}

	.omnibar-form--focused .omnibar-icon {
		color: var(--color-accent);
	}

	.omnibar-input {
		flex: 1;
		background: transparent;
		font-family: 'Courier New', monospace;
		font-size: var(--font-size-base);
		color: var(--color-text-primary);
		border: none;
		outline: none;
		min-width: 0;
	}

	.omnibar-input::placeholder {
		color: var(--color-text-muted);
	}

	.omnibar-shortcuts {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.omnibar-kbd {
		flex-shrink: 0;
		font-family: 'Courier New', monospace;
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		background: var(--color-surface-3);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		transition: all var(--duration-fast) var(--easing-standard);
	}

	.omnibar-form--focused .omnibar-kbd {
		color: var(--color-accent);
		background: rgba(88, 166, 255, 0.1);
		border-color: var(--color-accent);
	}

	.omnibar-suggestions {
		position: absolute;
		top: calc(100% + var(--space-2));
		left: 0;
		right: 0;
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		overflow: hidden;
		z-index: var(--z-dropdown);
		animation: suggestions-appear var(--duration-fast) var(--easing-decelerate);
	}

	@keyframes suggestions-appear {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.omnibar-suggestion {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-3) var(--space-4);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--color-border);
		cursor: pointer;
		transition: all var(--duration-fast) var(--easing-standard);
		text-align: left;
	}

	.omnibar-suggestion:last-child {
		border-bottom: none;
	}

	.omnibar-suggestion:hover {
		background: var(--color-surface-2);
	}

	.omnibar-suggestion:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
	}

	.omnibar-suggestion-icon {
		flex-shrink: 0;
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.omnibar-suggestion-icon :global(svg) {
		color: inherit;
	}

	.omnibar-suggestion-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.omnibar-suggestion-prefix {
		font-family: 'Courier New', monospace;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		color: var(--color-accent);
	}

	.omnibar-suggestion-description {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
	}

	.omnibar-suggestion-example {
		flex-shrink: 0;
		font-family: 'Courier New', monospace;
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		background: var(--color-surface-3);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.omnibar-input {
			font-size: var(--font-size-sm);
		}

		.omnibar-input::placeholder {
			font-size: var(--font-size-xs);
		}

		.omnibar-suggestion-example {
			display: none;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.omnibar-input-wrapper,
		.omnibar-icon,
		.omnibar-kbd,
		.omnibar-suggestion {
			transition: none;
		}

		.omnibar-suggestions {
			animation: none;
		}
	}
</style>
