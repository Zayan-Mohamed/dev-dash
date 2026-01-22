<script lang="ts">
	import { StickyNote, ChevronDown, ChevronUp, Save, Maximize2, Plus, X } from 'lucide-svelte';
	import Card from './Card.svelte';
	import FocusedNotepad from './FocusedNotepad.svelte';
	import { getData, setData } from '$lib/services/storage';
	import type { Notepad as NotepadType } from '$lib/services/storage';

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	let notepads = $state<NotepadType[]>([]);
	let activeNotepadId = $state<string | null>(null);
	let isCollapsed = $state(true);
	let isSaving = $state(false);
	let saveError = $state<string | null>(null);
	let isLoading = $state(true);
	let focusedNotepadId = $state<string | null>(null);
	let timeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		loadNotepads();
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	});

	async function loadNotepads() {
		if (!isLoading) return; // Already loaded
		try {
			const data = await getData('notepads');
			console.log('Loaded notepads from storage:', data);
			// getData already returns DEFAULT_DATA if nothing exists
			if (Array.isArray(data) && data.length > 0) {
				notepads = data;
				activeNotepadId = notepads[0].id;
			} else {
				// Shouldn't happen since DEFAULT_DATA has 3 notepads
				console.warn('No notepads found, this should not happen');
				notepads = [];
			}
			isLoading = false;
		} catch (err) {
			console.error('Error loading notepads:', err);
			notepads = [];
			saveError = 'Failed to load notepads';
			isLoading = false;
		}
	}

	function handleContentChange(notepadId: string) {
		const index = notepads.findIndex((n) => n.id === notepadId);
		if (index === -1) return;

		// Update timestamp directly on the reactive proxy
		notepads[index].updatedAt = Date.now();
		saveError = null;

		clearTimeout(timeout);
		isSaving = true;
		timeout = setTimeout(() => {
			saveNotepads();
		}, 500);
	}

	async function saveNotepads() {
		try {
			console.log('Saving notepads:', notepads.length, notepads);
			// Convert proxy to plain array for storage
			const plainNotepads = notepads.map(n => ({
				id: n.id,
				title: n.title,
				content: n.content,
				createdAt: n.createdAt,
				updatedAt: n.updatedAt
			}));
			await setData('notepads', plainNotepads);
			console.log('Notepads saved successfully');
			isSaving = false;
		} catch (err) {
			console.error('Error saving notepads:', err);
			saveError = 'Failed to save notepads';
			isSaving = false;
		}
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	function focusNotepad(id: string) {
		focusedNotepadId = id;
	}

	function closeFocusedNotepad() {
		focusedNotepadId = null;
	}

	function switchNotepad(id: string) {
		activeNotepadId = id;
	}

	function addNotepad() {
		try {
			const newNotepad: NotepadType = {
				id: Date.now().toString(),
				title: `Scratchpad ${notepads.length + 1}`,
				content: '',
				createdAt: Date.now(),
				updatedAt: Date.now()
			};
			// Use push() for better reactivity with $state proxies
			notepads.push(newNotepad);
			activeNotepadId = newNotepad.id;
			saveNotepads();
		} catch (err) {
			console.error('Error adding notepad:', err);
			saveError = 'Failed to add notepad';
		}
	}

	function deleteNotepad(id: string) {
		try {
			if (notepads.length <= 1) {
				return; // Keep at least one notepad
			}
			const currentIndex = notepads.findIndex((n) => n.id === id);
			if (currentIndex === -1) return;

			if (activeNotepadId === id) {
				const nextIndex = currentIndex > 0 ? currentIndex - 1 : 1;
				activeNotepadId = notepads[nextIndex]?.id || notepads[0]?.id;
			}
			// Use splice() for better reactivity with $state proxies
			notepads.splice(currentIndex, 1);
			saveNotepads();
		} catch (err) {
			console.error('Error deleting notepad:', err);
			saveError = 'Failed to delete notepad';
		}
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
				<h3 class="notepad-title">Scratchpads ({notepads.length})</h3>
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
				{#if !isCollapsed && activeNotepadId}
					<button
						onclick={() => focusNotepad(activeNotepadId!)}
						class="notepad-action-button"
						title="Focus Mode"
						aria-label="Open in focus mode"
					>
						<Maximize2 size={16} />
					</button>
				{/if}
				<button
					onclick={addNotepad}
					class="notepad-action-button"
					title="Add New Scratchpad"
					aria-label="Add new scratchpad"
				>
					<Plus size={16} />
				</button>
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

		<!-- Tabs -->
		<div class="notepad-tabs">
			{#each notepads as notepad (notepad.id)}
					<div class="notepad-tab-wrapper">
						<button
							onclick={() => switchNotepad(notepad.id)}
							class="notepad-tab {activeNotepadId === notepad.id ? 'notepad-tab--active' : ''}"
							title={notepad.title}
							aria-label="Switch to {notepad.title}"
						>
							<span class="notepad-tab-title">{notepad.title}</span>
						</button>
						{#if notepads.length > 1}
							<button
								onclick={() => deleteNotepad(notepad.id)}
								class="notepad-tab-delete"
								title="Delete {notepad.title}"
								aria-label="Delete {notepad.title}"
							>
								<X size={12} />
							</button>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Active Notepad Content -->
			{#if !isCollapsed && activeNotepadId}
				{@const activeNotepad = notepads.find((n) => n.id === activeNotepadId)}
				{#if activeNotepad}
					<div class="notepad-content">
						<textarea
						bind:value={activeNotepad.content}
						oninput={() => handleContentChange(activeNotepad.id)}
						class="notepad-textarea"
							placeholder="Start typing..."
							spellcheck="false"
							aria-label="{activeNotepad.title} content"
						></textarea>
					</div>
				{/if}
			{/if}
	</div>
</Card>

<!-- Focused Notepad Modal -->
{#if focusedNotepadId}
	{@const focusedNotepad = notepads.find((n) => n.id === focusedNotepadId)}
	{#if focusedNotepad}
		<FocusedNotepad
			notepad={focusedNotepad}
			isOpen={true}
			{isSaving}
			onClose={closeFocusedNotepad}
			onInput={() => handleContentChange(focusedNotepad.id)}
		/>
	{/if}
{/if}

<style>
	:global(.notepad-card) {
		min-height: 304px;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.notepad-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: 100%;
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
		gap: var(--space-2);
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

	.notepad-action-button,
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
		min-width: 36px;
		min-height: 36px;
	}

	.notepad-action-button:hover,
	.notepad-collapse-button:hover {
		background: var(--color-surface-2);
		color: var(--color-text-primary);
		border-color: var(--color-accent);
		transform: scale(1.05);
	}

	.notepad-action-button:active,
	.notepad-collapse-button:active {
		transform: scale(0.95);
		transition-duration: var(--duration-fast);
	}

	/* Tabs */
	.notepad-tabs {
		display: flex;
		gap: 4px;
		padding: var(--space-2);
		background: var(--color-surface-2);
		border-radius: var(--radius-sm);
		overflow-x: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
		margin-bottom: var(--space-2);
	}

	.notepad-tabs::-webkit-scrollbar {
		height: 4px;
	}

	.notepad-tabs::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: 2px;
	}

	.notepad-tab-wrapper {
		display: flex;
		align-items: center;
		gap: 2px;
		position: relative;
	}

	.notepad-tab {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: var(--radius-xs);
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast) var(--easing-standard);
		font-family: var(--font-mono);
		font-size: var(--font-size-xs);
		white-space: nowrap;
		font-weight: 500;
	}

	.notepad-tab:hover {
		background: var(--color-surface-2);
		color: var(--color-text-primary);
		border-color: var(--color-border);
	}

	.notepad-tab--active {
		background: var(--color-surface-3);
		color: var(--color-accent);
		border-color: var(--color-accent);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	.notepad-tab-title {
		user-select: none;
	}

	.notepad-tab-delete {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2px;
		border-radius: var(--radius-xs);
		background: transparent;
		border: 1px solid transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		opacity: 0;
		transition: all var(--duration-fast);
		min-width: 16px;
		min-height: 16px;
	}

	.notepad-tab-wrapper:hover .notepad-tab-delete {
		opacity: 1;
	}

	.notepad-tab-delete:hover {
		background: var(--color-error, #f85149);
		color: var(--color-surface-1);
		border-color: var(--color-error, #f85149);
	}

	/* Content */
	.notepad-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.notepad-textarea {
		width: 100%;
		height: 100%;
		flex: 1;
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

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.notepad-tabs {
			padding: 4px;
		}

		.notepad-tab {
			padding: 3px 6px;
			font-size: 11px;
		}

		.notepad-textarea {
			font-size: 16px; /* Prevent zoom on iOS */
		}

		.notepad-status span {
			display: none;
		}

		.notepad-action-button,
		.notepad-collapse-button {
			min-width: 32px;
			min-height: 32px;
		}
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
		.notepad-action-button,
		.notepad-collapse-button,
		.notepad-tab,
		.notepad-tab-delete {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.notepad-action-button:active,
		.notepad-collapse-button:active {
			background: var(--color-surface-3);
		}

		.notepad-tab-delete {
			opacity: 1; /* Always show on mobile */
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.notepad-action-button,
		.notepad-collapse-button,
		.notepad-tab,
		.notepad-tab-delete {
			transition: none;
		}

		.notepad-status--saving :global(.animate-pulse) {
			animation: none;
		}
	}
</style>
