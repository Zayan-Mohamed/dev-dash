<script lang="ts">
	import { StickyNote, ChevronDown, ChevronUp, Save } from 'lucide-svelte';
	import Card from './Card.svelte';
	import { getData, setData } from '$lib/services/storage';

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	let content = $state('');
	let isCollapsed = $state(true);
	let isSaving = $state(false);
	let saveError = $state<string | null>(null);
	let isLoading = $state(true);
	let timeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		getData('notepadContent')
			.then((data) => {
				content = data || '';
				isLoading = false;
			})
			.catch((err) => {
				console.error('Error loading notepad:', err);
				saveError = 'Failed to load notes';
				isLoading = false;
			});
	});

	function handleInput(e: Event) {
		const value = (e.target as HTMLTextAreaElement).value;
		content = value;
		saveError = null;

		clearTimeout(timeout);
		isSaving = true;
		timeout = setTimeout(() => {
			setData('notepadContent', value)
				.then(() => {
					isSaving = false;
				})
				.catch((err) => {
					console.error('Error saving notepad:', err);
					saveError = 'Failed to save notes';
					isSaving = false;
				});
		}, 500);
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}
</script>

<Card
	variant="medium"
	elevation="medium"
	class="notepad-card {isCollapsed ? '' : 'notepad-card--expanded'}"
	loading={isLoading}
	{animationDelay}
>
	<div class="notepad-container">
		<!-- Card Header -->
		<div class="notepad-header">
			<div class="notepad-header__main">
				<StickyNote size={20} class="text-orange-500" />
				<h3 class="notepad-title">Scratchpad</h3>
			</div>
			<div class="notepad-header__actions">
				{#if isSaving}
					<div class="notepad-status notepad-status--saving">
						<Save size={12} class="animate-pulse" />
						<span>Saving...</span>
					</div>
				{:else if saveError}
					<div class="notepad-status notepad-status--error">
						<span>{saveError}</span>
					</div>
				{/if}
				<button
					onclick={toggleCollapse}
					class="notepad-collapse-button"
					title={isCollapsed ? 'Expand' : 'Collapse'}
					aria-label={isCollapsed ? 'Expand notepad' : 'Collapse notepad'}
				>
					{#if isCollapsed}
						<ChevronDown size={16} />
					{:else}
						<ChevronUp size={16} />
					{/if}
				</button>
			</div>
		</div>

		<!-- Notepad Content -->
		{#if !isCollapsed}
			<div class="notepad-content">
				<textarea
					value={content}
					oninput={handleInput}
					class="notepad-textarea"
					placeholder="Type your notes here..."
					spellcheck="false"
					aria-label="Notepad text area"
				></textarea>
			</div>
		{/if}
	</div>
</Card>

<style>
	:global(.notepad-card) {
		min-height: 400px;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.notepad-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.notepad-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
		margin-bottom: var(--space-3);
	}

	.notepad-header__main {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.notepad-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
		margin: 0;
	}

	.notepad-header__actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.notepad-status {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-xs);
		font-family: var(--font-mono);
	}

	.notepad-status--saving {
		color: var(--color-accent);
	}

	.notepad-status--error {
		color: var(--color-error);
	}

	.notepad-collapse-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		background: transparent;
		border: 1px solid transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--duration-normal) var(--easing-standard);
		/* Touch-friendly minimum size */
		min-width: 44px;
		min-height: 44px;
	}

	.notepad-collapse-button:hover {
		background: var(--color-surface-2);
		color: var(--color-text-primary);
		border-color: var(--color-accent);
		transform: scale(1.1);
	}

	.notepad-collapse-button:active {
		transform: scale(0.9);
		transition-duration: var(--duration-fast);
	}

	.notepad-content {
		flex: 1;
		display: flex;
		min-height: 0;
	}

	.notepad-textarea {
		width: 100%;
		height: 100%;
		min-height: 160px;
		background: transparent;
		resize: none;
		outline: none;
		border: none;
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		line-height: 1.6;
		color: var(--color-text-primary);
		padding: 0;
	}

	.notepad-textarea::placeholder {
		color: var(--color-text-muted);
	}

	.notepad-textarea:focus::placeholder {
		opacity: 0.5;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.notepad-textarea {
			min-height: 100px;
			font-size: var(--font-size-xs);
			/* Prevent zoom on iOS */
			font-size: 16px;
		}

		.notepad-status span {
			display: none;
		}

		.notepad-collapse-button {
			min-width: 40px;
			min-height: 40px;
		}
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
		.notepad-collapse-button {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.notepad-collapse-button:active {
			background: var(--color-surface-3);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.notepad-collapse-button {
			transition: none;
		}

		.notepad-status--saving :global(.animate-pulse) {
			animation: none;
		}
	}
</style>
