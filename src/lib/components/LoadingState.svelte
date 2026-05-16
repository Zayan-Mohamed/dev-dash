<script lang="ts">
	let { message = 'Loading...', className = '' } = $props<{ message?: string; className?: string }>();
</script>

<div class="loading-state {className}" role="status" aria-live="polite">
	<div class="loading-spinner"></div>
	<span class="loading-text">{message}</span>
</div>

<style>
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
		width: 100%;
		box-sizing: border-box;
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

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-spinner {
			animation: none;
			border-top-color: var(--color-accent);
		}
	}
</style>