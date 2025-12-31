<script lang="ts">
	import { onMount } from 'svelte';
	import { Github, Star, GitFork, BookOpen, RefreshCw } from 'lucide-svelte';
	import { settings } from '$lib/stores/settings';
	import Card from './Card.svelte';

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	interface Repo {
		name: string;
		full_name: string;
		description: string;
		stargazers_count: number;
		forks_count: number;
		html_url: string;
		language: string;
		updated_at: string;
	}

	interface UserStats {
		public_repos: number;
		followers: number;
		following: number;
		login: string;
		avatar_url: string;
		public_gists: number;
		created_at: string;
		bio: string | null;
	}

	let userRepos = $state<Repo[]>([]);
	let userStats = $state<UserStats | null>(null);
	let totalStars = $state(0);
	let totalForks = $state(0);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let refreshing = $state(false);

	async function fetchGitHubData() {
		try {
			loading = true;
			error = null;
			
			// Fetch User Stats if username is set
			if ($settings.githubUsername) {
				const userRes = await fetch(`https://api.github.com/users/${$settings.githubUsername}`);
				if (userRes.ok) {
					userStats = await userRes.json();
					
					// Fetch user's repos
					const reposRes = await fetch(
						`https://api.github.com/users/${$settings.githubUsername}/repos?sort=updated&per_page=5`
					);
					if (reposRes.ok) {
						userRepos = await reposRes.json();
						// Calculate total stars and forks
						totalStars = userRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
						totalForks = userRepos.reduce((sum, repo) => sum + repo.forks_count, 0);
					}
				} else {
					error = 'User not found';
				}
			}
		} catch (err) {
			error = 'Failed to load GitHub data';
			console.error(err);
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	onMount(() => {
		fetchGitHubData();
	});

	async function handleRefresh() {
		refreshing = true;
		await fetchGitHubData();
	}

	function getTimeAgo(dateString: string): string {
		const now = new Date();
		const updated = new Date(dateString);
		const days = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
		if (days === 0) return 'today';
		if (days === 1) return '1d ago';
		if (days < 30) return `${days}d ago`;
		const months = Math.floor(days / 30);
		if (months === 1) return '1mo ago';
		return `${months}mo ago`;
	}
</script>

<Card variant="medium" elevation="medium" {loading} {animationDelay}>
	{#if error}
		<div class="github-stats__error">
			<Github size={24} class="text-zinc-600" />
			<p class="text-xs font-mono text-red-400 text-center mt-2">{error}</p>
			<button onclick={handleRefresh} class="github-stats__refresh-btn mt-3">
				<RefreshCw size={14} class={refreshing ? 'animate-spin' : ''} />
				Retry
			</button>
		</div>
	{:else if $settings.githubUsername && userStats}
		<div class="github-stats">
			<!-- Header with refresh button -->
			<div class="github-stats__header">
				<div class="flex items-center gap-2">
					<Github size={16} class="text-zinc-400" />
					<h3 class="text-sm font-semibold text-zinc-200">GitHub</h3>
				</div>
				<button 
					onclick={handleRefresh} 
					class="github-stats__icon-btn"
					disabled={refreshing}
					aria-label="Refresh GitHub stats"
				>
					<RefreshCw size={14} class={refreshing ? 'animate-spin' : ''} />
				</button>
			</div>

			<!-- User Profile -->
			<div class="github-stats__profile">
				<a href={`https://github.com/${userStats.login}`} target="_blank" rel="noopener noreferrer">
					<img 
						src={userStats.avatar_url} 
						alt={userStats.login} 
						class="github-stats__avatar" 
					/>
				</a>
				<div class="github-stats__user-info">
					<a 
						href={`https://github.com/${userStats.login}`} 
						target="_blank" 
						rel="noopener noreferrer" 
						class="github-stats__username"
					>
						{userStats.login}
					</a>
					{#if userStats.bio}
						<p class="github-stats__bio">{userStats.bio}</p>
					{/if}
				</div>
			</div>

			<!-- Stats Grid -->
			<div class="github-stats__grid">
				<div class="github-stats__stat">
					<BookOpen size={14} class="text-blue-400" />
					<span class="github-stats__stat-value">{userStats.public_repos}</span>
					<span class="github-stats__stat-label">Repos</span>
				</div>
				<div class="github-stats__stat">
					<Star size={14} class="text-yellow-400" />
					<span class="github-stats__stat-value">{totalStars}</span>
					<span class="github-stats__stat-label">Stars</span>
				</div>
				<div class="github-stats__stat">
					<span class="github-stats__stat-value">{userStats.followers}</span>
					<span class="github-stats__stat-label">Followers</span>
				</div>
				<div class="github-stats__stat">
					<GitFork size={14} class="text-green-400" />
					<span class="github-stats__stat-value">{totalForks}</span>
					<span class="github-stats__stat-label">Forks</span>
				</div>
			</div>

			<!-- Recent Repos -->
			{#if userRepos.length > 0}
				<div class="github-stats__repos">
					<h4 class="github-stats__repos-title">Recent Repos</h4>
					<div class="github-stats__repos-list">
						{#each userRepos as repo}
							<a 
								href={repo.html_url} 
								target="_blank" 
								rel="noopener noreferrer"
								class="github-stats__repo"
							>
								<div class="github-stats__repo-header">
									<span class="github-stats__repo-name">{repo.name}</span>
									<span class="github-stats__repo-time">{getTimeAgo(repo.updated_at)}</span>
								</div>
								{#if repo.description}
									<p class="github-stats__repo-desc">{repo.description}</p>
								{/if}
								<div class="github-stats__repo-footer">
									{#if repo.language}
										<span class="github-stats__repo-lang">{repo.language}</span>
									{/if}
									<div class="github-stats__repo-stats">
										<span class="flex items-center gap-1">
											<Star size={10} />
											{repo.stargazers_count}
										</span>
										<span class="flex items-center gap-1">
											<GitFork size={10} />
											{repo.forks_count}
										</span>
									</div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="github-stats__empty">
			<Github size={32} class="text-zinc-600" />
			<p class="text-xs font-mono text-zinc-500 text-center mt-3">
				Set your GitHub username in settings
			</p>
		</div>
	{/if}
</Card>

<style>
	.github-stats {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: 100%;
	}

	.github-stats__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-border);
	}

	.github-stats__icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast) var(--easing-standard);
		/* Touch-friendly minimum size */
		min-width: 44px;
		min-height: 44px;
	}

	.github-stats__icon-btn:hover:not(:disabled) {
		background: var(--color-surface-2);
		color: var(--color-text-primary);
	}

	.github-stats__icon-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.github-stats__profile {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
	}

	.github-stats__avatar {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-full);
		border: 2px solid var(--color-border);
		transition: border-color var(--duration-fast) var(--easing-standard);
	}

	.github-stats__avatar:hover {
		border-color: var(--color-accent);
	}

	.github-stats__user-info {
		flex: 1;
		min-width: 0;
	}

	.github-stats__username {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		text-decoration: none;
		transition: color var(--duration-fast) var(--easing-standard);
	}

	.github-stats__username:hover {
		color: var(--color-accent);
	}

	.github-stats__bio {
		margin-top: var(--space-1);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.github-stats__grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2);
	}

	.github-stats__stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-3);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		transition: background var(--duration-fast) var(--easing-standard);
	}

	.github-stats__stat:hover {
		background: var(--color-surface-3);
	}

	.github-stats__stat-value {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
	}

	.github-stats__stat-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.github-stats__repos {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.github-stats__repos-title {
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.github-stats__repos-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.github-stats__repo {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: all var(--duration-fast) var(--easing-standard);
		/* Touch-friendly minimum height */
		min-height: 72px;
	}

	.github-stats__repo:hover {
		background: var(--color-surface-3);
		border-color: var(--color-accent);
		transform: translateX(2px);
	}

	.github-stats__repo-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.github-stats__repo-name {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.github-stats__repo-time {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-family: 'Courier New', monospace;
		flex-shrink: 0;
	}

	.github-stats__repo-desc {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.github-stats__repo-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		margin-top: var(--space-1);
	}

	.github-stats__repo-lang {
		font-size: var(--font-size-xs);
		color: var(--color-accent);
		font-family: 'Courier New', monospace;
	}

	.github-stats__repo-stats {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-family: 'Courier New', monospace;
	}

	.github-stats__error,
	.github-stats__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 200px;
	}

	.github-stats__refresh-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-xs);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--duration-fast) var(--easing-standard);
	}

	.github-stats__refresh-btn:hover {
		background: var(--color-surface-3);
		border-color: var(--color-accent);
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.github-stats__grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-2);
		}

		.github-stats__stat {
			padding: var(--space-2);
		}

		.github-stats__stat-value {
			font-size: var(--font-size-base);
		}

		.github-stats__repo {
			padding: var(--space-2);
			min-height: 64px;
		}

		.github-stats__repo-desc {
			-webkit-line-clamp: 1;
			line-clamp: 1;
		}
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
		.github-stats__icon-btn {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.github-stats__repo {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.github-stats__repo:active {
			background: var(--color-surface-3);
			transform: scale(0.98);
		}

		.github-stats__refresh-btn {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.github-stats__refresh-btn:active {
			background: var(--color-surface-3);
			transform: scale(0.95);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.github-stats__repo:hover {
			transform: none;
		}

		:global(.animate-spin) {
			animation: none;
		}
	}
</style>
