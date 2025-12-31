<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		header?: Snippet;
		leftSidebar?: Snippet;
		centerContent: Snippet;
		rightSidebar?: Snippet;
		bottomWidgets?: Snippet;
	}

	let { header, leftSidebar, centerContent, rightSidebar, bottomWidgets }: Props = $props();
</script>

<div class="viewport-layout">
	{#if header}
		<header class="viewport-layout__header">
			{@render header()}
		</header>
	{/if}

	<main class="viewport-layout__main">
		{#if leftSidebar}
			<aside class="viewport-layout__sidebar viewport-layout__sidebar--left">
				{@render leftSidebar()}
			</aside>
		{/if}

		<div class="viewport-layout__center">
			{@render centerContent()}
		</div>

		{#if rightSidebar}
			<aside class="viewport-layout__sidebar viewport-layout__sidebar--right">
				{@render rightSidebar()}
			</aside>
		{/if}
	</main>

	{#if bottomWidgets}
		<section class="viewport-layout__bottom">
			{@render bottomWidgets()}
		</section>
	{/if}
</div>

<style>
	.viewport-layout {
		display: grid;
		grid-template-rows: auto 1fr auto;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		background-color: var(--color-background);
	}

	.viewport-layout__header {
		grid-row: 1;
		z-index: var(--z-sticky);
		background-color: var(--color-background);
		border-bottom: 1px solid var(--color-border);
	}

	.viewport-layout__main {
		grid-row: 2;
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		gap: var(--gap-md);
		padding: var(--space-4);
		overflow: hidden;
		align-items: start;
	}

	.viewport-layout__sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--gap-md);
		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
	}

	.viewport-layout__sidebar--left {
		grid-column: 1;
	}

	.viewport-layout__center {
		grid-column: 2;
		display: flex;
		flex-direction: column;
		gap: var(--gap-sm);
		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
	}

	.viewport-layout__sidebar--right {
		grid-column: 3;
	}

	.viewport-layout__bottom {
		grid-row: 3;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--gap-lg);
		padding: 0 var(--space-6) var(--space-6);
		overflow: hidden;
	}

	/* Tablet layout (768px - 1024px) */
	@media (max-width: 1024px) {
		.viewport-layout__main {
			grid-template-columns: 1fr 2fr;
			gap: var(--gap-md);
			padding: var(--space-4);
		}

		.viewport-layout__sidebar--left {
			grid-column: 1;
		}

		.viewport-layout__center {
			grid-column: 2;
		}

		.viewport-layout__sidebar--right {
			display: none;
		}

		.viewport-layout__bottom {
			padding: 0 var(--space-4) var(--space-4);
			gap: var(--gap-md);
			grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		}
	}

	/* Small tablet layout (640px - 768px) */
	@media (max-width: 768px) {
		.viewport-layout__main {
			grid-template-columns: 1fr;
			gap: var(--gap-sm);
			padding: var(--space-3);
		}

		.viewport-layout__sidebar--left,
		.viewport-layout__sidebar--right {
			display: none;
		}

		.viewport-layout__center {
			grid-column: 1;
		}

		.viewport-layout__bottom {
			grid-template-columns: 1fr;
			padding: 0 var(--space-3) var(--space-3);
			gap: var(--gap-sm);
		}
	}

	/* Mobile layout (< 640px) */
	@media (max-width: 640px) {
		.viewport-layout {
			/* Allow scrolling on very small screens if needed */
			overflow-y: auto;
		}

		.viewport-layout__main {
			padding: var(--space-2);
			gap: var(--gap-xs);
		}

		.viewport-layout__bottom {
			padding: 0 var(--space-2) var(--space-2);
			gap: var(--gap-xs);
		}
	}

	/* Large desktop optimization (> 1440px) */
	@media (min-width: 1440px) {
		.viewport-layout__main {
			max-width: 1600px;
			margin: 0 auto;
			padding: var(--space-8);
		}

		.viewport-layout__bottom {
			max-width: 1600px;
			margin: 0 auto;
			padding: 0 var(--space-8) var(--space-8);
		}
	}

	/* Mobile landscape orientation */
	@media (max-width: 896px) and (orientation: landscape) {
		.viewport-layout {
			overflow-y: auto;
		}

		.viewport-layout__main {
			grid-template-columns: 1fr 1fr;
			padding: var(--space-3);
		}

		.viewport-layout__center {
			grid-column: 1 / -1;
		}

		.viewport-layout__bottom {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Tablet landscape optimization */
	@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
		.viewport-layout__main {
			grid-template-columns: 1fr 2.5fr;
		}
	}

	/* Custom scrollbar for sidebars and center content */
	.viewport-layout__sidebar::-webkit-scrollbar,
	.viewport-layout__center::-webkit-scrollbar {
		width: 6px;
	}

	.viewport-layout__sidebar::-webkit-scrollbar-track,
	.viewport-layout__center::-webkit-scrollbar-track {
		background: transparent;
	}

	.viewport-layout__sidebar::-webkit-scrollbar-thumb,
	.viewport-layout__center::-webkit-scrollbar-thumb {
		background: var(--color-surface-3);
		border-radius: var(--radius-full);
	}

	.viewport-layout__sidebar::-webkit-scrollbar-thumb:hover,
	.viewport-layout__center::-webkit-scrollbar-thumb:hover {
		background: var(--color-surface-4);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.viewport-layout__sidebar,
		.viewport-layout__center {
			scroll-behavior: auto;
		}
	}
</style>
