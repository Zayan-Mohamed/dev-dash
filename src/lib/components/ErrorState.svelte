<script lang="ts">
	import type { Snippet } from 'svelte';
	import { TriangleAlert } from 'lucide-svelte';
	
	let { message = 'An error occurred', className = '', children } = $props<{ message?: string; className?: string; children?: Snippet }>();
</script>

<div class="error-state {className}" role="alert">
	<span class="error-icon"><TriangleAlert size={32} /></span>
	<span class="error-text">{message}</span>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
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
		width: 100%;
		box-sizing: border-box;
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
</style>