<script lang="ts">
	import { onMount } from 'svelte';
	import { Cpu, MemoryStick, RefreshCw } from 'lucide-svelte';
	import Card from './Card.svelte';

	let { animationDelay = 0 }: { animationDelay?: number } = $props();

	let cpuUsage = $state<number | null>(null);
	let availableMemory = $state<number | null>(null);
	let totalMemory = $state<number | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let refreshing = $state(false);

	// Declare Chrome System API types
	interface ChromeSystem {
		system?: {
			cpu?: {
				getInfo: (
					callback: (info: {
						numOfProcessors: number;
						archName: string;
						modelName: string;
						features: string[];
						processors: Array<{
							usage: { user: number; kernel: number; idle: number; total: number };
						}>;
					}) => void
				) => void;
			};
			memory?: {
				getInfo: (
					callback: (info: { capacity: number; availableCapacity: number }) => void
				) => void;
			};
		};
	}

	// Type assertion for chrome global
	const chromeSystem = (typeof chrome !== 'undefined' ? chrome : undefined) as
		| ChromeSystem
		| undefined;

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	}

	function calculateCpuUsage(cpuInfo: {
		processors: Array<{ usage: { user: number; kernel: number; idle: number; total: number } }>;
	}): number {
		if (!cpuInfo.processors || cpuInfo.processors.length === 0) return 0;

		let totalUsage = 0;
		let totalIdle = 0;

		cpuInfo.processors.forEach((processor) => {
			const usage = processor.usage;
			totalUsage += usage.user + usage.kernel;
			totalIdle += usage.idle;
		});

		const total = totalUsage + totalIdle;
		if (total === 0) return 0;

		return Math.round((totalUsage / total) * 100);
	}

	async function fetchSystemStats() {
		if (!chromeSystem || !chromeSystem.system?.cpu || !chromeSystem.system?.memory) {
			error = 'Chrome System API not available';
			loading = false;
			return;
		}

		try {
			loading = true;
			error = null;

			// Fetch CPU info
			chromeSystem.system.cpu.getInfo((cpuInfo) => {
				cpuUsage = calculateCpuUsage(cpuInfo);

				// Fetch Memory info
				if (chromeSystem.system?.memory) {
					chromeSystem.system.memory.getInfo((memoryInfo) => {
						totalMemory = memoryInfo.capacity;
						availableMemory = memoryInfo.availableCapacity;
						loading = false;
						refreshing = false;
					});
				} else {
					loading = false;
					refreshing = false;
				}
			});
		} catch (err) {
			error = 'Failed to fetch system stats';
			console.error(err);
			loading = false;
			refreshing = false;
		}
	}

	onMount(() => {
		fetchSystemStats();

		// Update stats every 2 seconds
		const interval = setInterval(() => {
			if (!refreshing) {
				fetchSystemStats();
			}
		}, 2000);

		return () => clearInterval(interval);
	});

	async function handleRefresh() {
		refreshing = true;
		await fetchSystemStats();
	}

	const memoryUsage = $derived(
		totalMemory && availableMemory ? totalMemory - availableMemory : null
	);
	const memoryUsagePercent = $derived(
		totalMemory && memoryUsage ? Math.round((memoryUsage / totalMemory) * 100) : null
	);
</script>

<Card variant="medium" elevation="medium" {loading} {animationDelay} class="system-stats-card">
	{#if error}
		<div class="system-stats__error">
			<Cpu size={24} class="text-zinc-600" />
			<p class="mt-2 text-center font-mono text-xs text-red-400">{error}</p>
			<button onclick={handleRefresh} class="system-stats__refresh-btn mt-3">
				<RefreshCw size={14} class={refreshing ? 'animate-spin' : ''} />
				Retry
			</button>
		</div>
	{:else}
		<div class="system-stats">
			<!-- Header -->
			<div class="system-stats-header">
				<Cpu size={20} class="text-blue-500" />
				<h3 class="system-stats-title">System Stats</h3>
			</div>

			<!-- CPU Usage -->
			<div class="system-stats-section">
				<div class="system-stats-label">
					<Cpu size={16} />
					<span>CPU Usage</span>
				</div>
				<div class="system-stats-value">
					<span class="system-stats-percentage">{cpuUsage ?? '--'}%</span>
				</div>
				<div class="system-stats-progress">
					<div
						class="system-stats-progress-bar system-stats-progress-bar--cpu"
						style="width: {cpuUsage ?? 0}%"
					></div>
				</div>
			</div>

			<!-- Memory Usage -->
			<div class="system-stats-section">
				<div class="system-stats-label">
					<MemoryStick size={16} />
					<span>Memory</span>
				</div>
				<div class="system-stats-value">
					<span class="system-stats-percentage">{memoryUsagePercent ?? '--'}%</span>
				</div>
				<div class="system-stats-memory-details">
					<span class="system-stats-memory-text">
						{memoryUsage !== null ? formatBytes(memoryUsage) : '--'} / {totalMemory !== null
							? formatBytes(totalMemory)
							: '--'}
					</span>
				</div>
				<div class="system-stats-progress">
					<div
						class="system-stats-progress-bar system-stats-progress-bar--memory"
						style="width: {memoryUsagePercent ?? 0}%"
					></div>
				</div>
			</div>
		</div>
	{/if}
</Card>

<style>
	:global(.system-stats-card) {
		min-height: 300px;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.system-stats-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-bottom: var(--space-1);
		border-bottom: 1px solid var(--color-border);
		width: fit-content;
		margin-bottom: var(--space-3);
	}

	.system-stats-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.system-stats {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		flex: 1;
		min-height: 0;
		padding: var(--space-2) 0;
	}

	.system-stats-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.system-stats-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
	}

	.system-stats-value {
		display: flex;
		align-items: baseline;
		gap: var(--space-1);
	}

	.system-stats-percentage {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
		line-height: 1;
	}

	.system-stats-memory-details {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-family: 'Courier New', monospace;
	}

	.system-stats-memory-text {
		display: block;
	}

	.system-stats-progress {
		width: 100%;
		height: 8px;
		background: var(--color-surface-2);
		border-radius: var(--radius-full);
		overflow: hidden;
		position: relative;
	}

	.system-stats-progress-bar {
		height: 100%;
		border-radius: var(--radius-full);
		transition: width var(--duration-normal) var(--easing-standard);
		position: relative;
	}

	.system-stats-progress-bar--cpu {
		background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
	}

	.system-stats-progress-bar--memory {
		background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
	}

	.system-stats__error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 200px;
	}

	.system-stats__refresh-btn {
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

	.system-stats__refresh-btn:hover {
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
		.system-stats-percentage {
			font-size: 1.5rem;
		}
	}

	/* Touch-friendly interactions on mobile */
	@media (max-width: 768px) and (hover: none) {
		.system-stats__refresh-btn {
			-webkit-tap-highlight-color: rgba(88, 166, 255, 0.2);
		}

		.system-stats__refresh-btn:active {
			background: var(--color-surface-3);
			transform: scale(0.95);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		:global(.animate-spin) {
			animation: none;
		}

		.system-stats-progress-bar {
			transition: none;
		}
	}
</style>
