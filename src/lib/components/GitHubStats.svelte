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

					// Fetch ALL user's repos to calculate accurate totals
					const allReposRes = await fetch(
						`https://api.github.com/users/${$settings.githubUsername}/repos?per_page=100`
					);
					if (allReposRes.ok) {
						const allRepos = await allReposRes.json();
						// Calculate total stars and forks from all repos
						totalStars = allRepos.reduce((sum: number, repo: Repo) => sum + repo.stargazers_count, 0);
						totalForks = allRepos.reduce((sum: number, repo: Repo) => sum + repo.forks_count, 0);
					}

					// Fetch recent repos (limit to 2 for display)
					const recentReposRes = await fetch(
						`https://api.github.com/users/${$settings.githubUsername}/repos?sort=updated&per_page=5`
					);
					if (recentReposRes.ok) {
						userRepos = await recentReposRes.json();
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

	// Fetch data when username changes
	$effect(() => {
		if ($settings.githubUsername) {
			fetchGitHubData();
		}
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

<Card variant="medium" elevation="medium" {loading} {animationDelay} class="github-stats-card">
	{#snippet children()}
		{#if !$settings.githubUsername}
			<div class="github-stats__empty">
				<Github size={32} class="text-zinc-600" />
				<p class="mt-3 text-center font-mono text-xs text-zinc-500">
					Set your GitHub username in settings
				</p>
			</div>
		{:else if error}
			<div class="github-stats__error">
				<Github size={24} class="text-zinc-600" />
				<p class="mt-2 text-center font-mono text-xs text-red-400">{error}</p>
				<button onclick={handleRefresh} class="github-stats__refresh-btn mt-3">
					<RefreshCw size={14} class={refreshing ? 'animate-spin' : ''} />
					Retry
				</button>
			</div>
		{:else if userStats}
			<div class="github-stats">
				<!-- User Profile Section -->
				<div class="user-profile">
					<img src={userStats.avatar_url} alt={userStats.login} class="user-avatar" />
					<div class="user-info">
						<h3 class="user-name">{userStats.login}</h3>
						{#if userStats.bio}
							<p class="user-bio">{userStats.bio}</p>
						{/if}
					</div>
				</div>

				<!-- Stats Labels -->
				<div class="repos-stats-row">
					<div class="stat-item">
						<span class="stat-value">{userStats.public_repos}</span>
						<span class="stat-label">REPOS</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{totalStars}</span>
						<span class="stat-label">STARS</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{userStats.followers}</span>
						<span class="stat-label">FOLLOWERS</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{userStats.following}</span>
						<span class="stat-label">FOLLOWING</span>
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
				<p class="mt-3 text-center font-mono text-xs text-zinc-500">
					Loading GitHub data...
				</p>
			</div>
		{/if}
	{/snippet}
</Card>

<style>
	:global(.github-stats-card) {
		min-height: 400px;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.user-profile {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-border);
	}

	.user-avatar {
		width: 60px;
		height: 60px;
		border-radius: var(--radius-lg);
		border: 2px solid var(--color-border);
		flex-shrink: 0;
		object-fit: cover;
	}

	.user-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.user-name {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.user-bio {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin: 0;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.repos-stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-3);
		padding: var(--space-2) 0;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		text-align: center;
	}

	.stat-value {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.stat-label {
		font-size: 0.65rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.github-stats {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		flex: 1;
		min-height: 0;
	}

	.github-stats__repos {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: 1;
		min-height: 0;
	}

	.github-stats__repos-title {
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.github-stats__repos-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		overflow-y: auto;
		overflow-x: hidden;
		max-height: 240px; /* Approximately 2 repos height */
		padding-right: var(--space-1);
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}

	.github-stats__repos-list::-webkit-scrollbar {
		width: 6px;
	}

	.github-stats__repos-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.github-stats__repos-list::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: var(--radius-sm);
		scrollbar-color: transparent;
	}

	.github-stats__repos-list::-webkit-scrollbar-thumb:hover {
		background: var(--color-text-tertiary);
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
		.user-avatar {
			width: 48px;
			height: 48px;
		}

		.user-name {
			font-size: var(--font-size-base);
		}

		.user-bio {
			font-size: var(--font-size-xs);
		}

		.repos-stats-row {
			gap: var(--space-2);
		}

		.stat-value {
			font-size: var(--font-size-base);
		}

		.stat-label {
			font-size: 0.6rem;
		}

		.github-stats__repos-list {
			max-height: 170px; /* Adjust for smaller repo cards on mobile */
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

	@media (max-width: 480px) {
		.user-profile {
			gap: var(--space-2);
		}

		.user-avatar {
			width: 40px;
			height: 40px;
		}

		.repos-stats-row {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-3);
		}

		.github-stats__repos-list {
			max-height: 150px; /* Further adjust for very small screens */
		}
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
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
