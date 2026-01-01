<script lang="ts">
	import { onMount } from 'svelte';
	import { Newspaper, ExternalLink } from 'lucide-svelte';
	import Card from './Card.svelte';

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	interface Story {
		id: number;
		title: string;
		url: string;
		score: number;
		by: string;
	}

	let stories = $state<Story[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			// Fetch top stories IDs
			const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
			const ids = await res.json();
			
			// Fetch details for top 5 stories
			const top5Ids = ids.slice(0, 5);
			const storyPromises = top5Ids.map((id: number) =>
				fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`).then(r => r.json())
			);
			
			stories = await Promise.all(storyPromises);
		} catch (err) {
			error = 'Failed to load news';
		} finally {
			loading = false;
		}
	});
</script>

<Card variant="medium" elevation="low" class="tech-news-card" {animationDelay}>
	<div class="tech-news">
		<div class="tech-news__header">
			<Newspaper size={14} class="text-orange-400" />
			<h3 class="tech-news__title">Hacker News</h3>
		</div>

		{#if loading}
			<div class="tech-news__loading">
				{#each Array(5) as _}
					<div class="tech-news__skeleton"></div>
				{/each}
			</div>
		{:else if error}
			<div class="tech-news__error">{error}</div>
		{:else}
			<div class="tech-news__list">
				{#each stories as story}
					<a href={story.url} target="_blank" rel="noopener noreferrer" class="tech-news__story">
						<span class="tech-news__story-title">{story.title}</span>
						<div class="tech-news__story-meta">
							<span class="tech-news__story-score">
								<span class="tech-news__score-dot"></span>
								{story.score} pts
							</span>
							<span>by {story.by}</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</Card>

<style>
	:global(.tech-news-card) {
		width: 100%;
		max-width: 720px;
		margin: 0 auto;
	}

	.tech-news {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-height: 400px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	/* Hide scrollbar but keep functionality */
	.tech-news::-webkit-scrollbar {
		width: 0;
		height: 0;
	}

	.tech-news {
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE and Edge */
	}

	.tech-news__header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-border);
	}

	.tech-news__title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.tech-news__loading {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.tech-news__skeleton {
		height: 64px;
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		animation: skeleton-loading 1.5s ease-in-out infinite;
	}

	@keyframes skeleton-loading {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}

	.tech-news__error {
		padding: var(--space-4);
		text-align: center;
		font-family: 'Courier New', monospace;
		font-size: var(--font-size-sm);
		color: var(--color-error);
	}

	.tech-news__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.tech-news__story {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		background: transparent;
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: all var(--duration-fast) var(--easing-standard);
	}

	.tech-news__story:hover {
		background: var(--color-surface-2);
	}

	.tech-news__story-title {
		font-size: var(--font-size-sm);
		font-family: 'Courier New', monospace;
		color: var(--color-text-secondary);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		transition: color var(--duration-fast) var(--easing-standard);
	}

	.tech-news__story:hover .tech-news__story-title {
		color: var(--color-accent);
	}

	.tech-news__story-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--font-size-xs);
		font-family: 'Courier New', monospace;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.tech-news__story-score {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.tech-news__score-dot {
		width: 6px;
		height: 6px;
		border-radius: var(--radius-full);
		background: #ff6600;
	}

	@media (prefers-reduced-motion: reduce) {
		.tech-news__skeleton {
			animation: none;
		}
		
		.tech-news__story {
			transition: none;
		}
	}
</style>
