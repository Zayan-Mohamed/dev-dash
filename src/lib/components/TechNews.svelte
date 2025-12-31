<script lang="ts">
	import { onMount } from 'svelte';
	import { Newspaper, ExternalLink } from 'lucide-svelte';

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

<div class="flex flex-col gap-4 p-5 border border-zinc-800/80 rounded-xl bg-zinc-900/40 backdrop-blur-sm w-full hover:border-zinc-700 transition-all duration-200">
	<div class="flex items-center gap-2 text-zinc-400 text-xs font-mono uppercase tracking-wider">
		<Newspaper size={14} class="text-orange-400" /> Hacker News
	</div>

	{#if loading}
		<div class="space-y-3">
			{#each Array(5) as _}
				<div class="h-16 bg-zinc-800/50 rounded-lg animate-pulse"></div>
			{/each}
		</div>
	{:else if error}
		<div class="text-sm font-mono text-red-400 py-4 text-center">{error}</div>
	{:else}
		<div class="flex flex-col gap-1">
			{#each stories as story}
				<a
					href={story.url}
					class="group flex flex-col gap-2 hover:bg-zinc-800/40 p-3 rounded-lg transition-all duration-200"
				>
					<span class="text-sm font-mono text-zinc-300 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
						{story.title}
					</span>
					<div class="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
						<span class="flex items-center gap-1">
							<span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
							{story.score} pts
						</span>
						<span>by {story.by}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
