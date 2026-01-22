<script lang="ts">
	import { X, Save, Check } from 'lucide-svelte';
	import type { Notepad } from '$lib/services/storage';

	interface Props {
		notepad: Notepad;
		isOpen: boolean;
		isSaving: boolean;
		onClose: () => void;
		onInput: () => void;
	}

	let { notepad, isOpen, isSaving, onClose, onInput }: Props = $props();

	function handleInput() {
		onInput();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div
		class="focused-notepad-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="focused-notepad-title"
		tabindex="-1"
	>
		<div class="focused-notepad-modal">
			<!-- Header -->
			<div class="focused-notepad-header">
				<h2 id="focused-notepad-title" class="focused-notepad-title">{notepad.title}</h2>
				<div class="focused-notepad-actions">
					{#if isSaving}
						<div class="focused-notepad-status">
							<Save size={14} class="animate-pulse" />
							<span>Saving...</span>
						</div>
					{:else}
						<div class="focused-notepad-status focused-notepad-status--saved">
							<Check size={14} />
							<span>Saved</span>
						</div>
					{/if}
					<button
						onclick={onClose}
						class="focused-notepad-close"
						title="Close (Esc)"
						aria-label="Close focused notepad"
					>
						<X size={20} />
					</button>
				</div>
			</div>

			<!-- Content -->
			<div class="focused-notepad-content">
				<textarea
					bind:value={notepad.content}
					oninput={handleInput}
					class="focused-notepad-textarea"
					placeholder="Start typing..."
					spellcheck="false"
					aria-label="Notepad content"
				></textarea>
			</div>

			<!-- Footer hint -->
			<div class="focused-notepad-footer">
				<span class="focused-notepad-hint">Press <kbd>Esc</kbd> to close</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.focused-notepad-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.focused-notepad-modal {
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		width: 100%;
		max-width: 900px;
		height: 80vh;
		max-height: 700px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.focused-notepad-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.focused-notepad-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		font-family: var(--font-mono);
		margin: 0;
	}

	.focused-notepad-actions {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.focused-notepad-status {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-sm);
		font-family: var(--font-mono);
		color: var(--color-accent);
	}

	.focused-notepad-status--saved {
		color: var(--color-success, #3fb950);
	}

	.focused-notepad-close {
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

	.focused-notepad-close:hover {
		background: var(--color-surface-2);
		color: var(--color-text-primary);
		border-color: var(--color-border);
		transform: scale(1.05);
	}

	.focused-notepad-close:active {
		transform: scale(0.95);
	}

	.focused-notepad-content {
		flex: 1;
		padding: var(--space-6);
		overflow: hidden;
		display: flex;
	}

	.focused-notepad-textarea {
		width: 100%;
		height: 100%;
		background: transparent;
		resize: none;
		outline: none;
		border: none;
		font-family: var(--font-mono);
		font-size: var(--font-size-base);
		line-height: 1.8;
		color: var(--color-text-primary);
		padding: 0;
	}

	.focused-notepad-textarea::placeholder {
		color: var(--color-text-muted);
	}

	.focused-notepad-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-3);
		border-top: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.focused-notepad-hint {
		font-size: var(--font-size-xs);
		font-family: var(--font-mono);
		color: var(--color-text-muted);
	}

	kbd {
		display: inline-block;
		padding: 2px 6px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xs);
		font-family: var(--font-mono);
		font-size: var(--font-size-xs);
		color: var(--color-text-primary);
		margin: 0 2px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.focused-notepad-backdrop {
			padding: 0;
		}

		.focused-notepad-modal {
			max-width: 100%;
			height: 100vh;
			max-height: 100vh;
			border-radius: 0;
		}

		.focused-notepad-content {
			padding: var(--space-4);
		}

		.focused-notepad-textarea {
			font-size: var(--font-size-sm);
		}

		.focused-notepad-status span {
			display: none;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.focused-notepad-backdrop,
		.focused-notepad-modal {
			animation: none;
		}

		.focused-notepad-close {
			transition: none;
		}
	}
</style>
