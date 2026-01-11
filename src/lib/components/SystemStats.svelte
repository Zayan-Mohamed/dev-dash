<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Cpu, MemoryStick } from 'lucide-svelte';

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

	// Wrap Chrome APIs in Promises to avoid callback hell
	const getCpuInfo = (): Promise<{
		processors: Array<{ usage: { user: number; kernel: number; idle: number; total: number } }>;
	}> => {
		return new Promise((resolve, reject) => {
			if (!chromeSystem?.system?.cpu) {
				reject(new Error('Chrome System CPU API not available'));
				return;
			}
			chromeSystem.system.cpu.getInfo((info) => {
				resolve(info);
			});
		});
	};

	const getMemoryInfo = (): Promise<{ capacity: number; availableCapacity: number }> => {
		return new Promise((resolve, reject) => {
			if (!chromeSystem?.system?.memory) {
				reject(new Error('Chrome System Memory API not available'));
				return;
			}
			chromeSystem.system.memory.getInfo((info) => {
				resolve(info);
			});
		});
	};

	let cpuUsage = $state<number | null>(null);
	let memoryUsagePercent = $state<number | null>(null);
	let mounted = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let inFlightRequest = $state(false);

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
		// Guard against updates on unmounted component
		if (!mounted) return;

		// Prevent race conditions by checking if a request is already in flight
		if (inFlightRequest) return;

		if (!chromeSystem?.system?.cpu || !chromeSystem?.system?.memory) {
			// Only update state if component is still mounted
			if (!mounted) return;
			cpuUsage = null;
			memoryUsagePercent = null;
			return;
		}

		try {
			inFlightRequest = true;

			// Fetch both CPU and Memory info in parallel
			const [cpuInfo, memoryInfo] = await Promise.all([getCpuInfo(), getMemoryInfo()]);

			// Guard against updates on unmounted component
			if (!mounted) return;

			cpuUsage = calculateCpuUsage(cpuInfo);

			const usedMemory = memoryInfo.capacity - memoryInfo.availableCapacity;
			memoryUsagePercent = Math.round((usedMemory / memoryInfo.capacity) * 100);
		} catch (err) {
			// Guard against updates on unmounted component
			if (!mounted) return;
			console.error('Failed to fetch system stats:', err);
			cpuUsage = null;
			memoryUsagePercent = null;
		} finally {
			// Guard against updates on unmounted component
			if (mounted) {
				inFlightRequest = false;
			}
		}
	}

	onMount(() => {
		mounted = true;
		fetchSystemStats();

		// Update stats every 8 seconds (reduced from 2s to save battery)
		intervalId = setInterval(() => {
			if (mounted && !inFlightRequest) {
				fetchSystemStats();
			}
		}, 8000);

		return () => {
			mounted = false;
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
		};
	});

	onDestroy(() => {
		mounted = false;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	});
</script>

<div class="system-stats">
	<div class="system-stats__item" title="CPU Usage">
		<Cpu size={16} class="system-stats__icon" />
		<span class="system-stats__value">{cpuUsage !== null ? `${cpuUsage}%` : '--'}</span>
	</div>
	<div class="system-stats__item" title="Memory Usage">
		<MemoryStick size={16} class="system-stats__icon" />
		<span class="system-stats__value"
			>{memoryUsagePercent !== null ? `${memoryUsagePercent}%` : '--'}</span
		>
	</div>
</div>

<style>
	.system-stats {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.system-stats__item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-md);
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		transition: all var(--duration-fast) var(--easing-standard);
	}

	.system-stats__item:hover {
		background: var(--color-surface-2);
		border-color: var(--color-accent);
	}

	.system-stats__icon {
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.system-stats__value {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		font-family: 'Courier New', monospace;
		white-space: nowrap;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.system-stats {
			gap: var(--space-2);
		}

		.system-stats__item {
			padding: var(--space-1);
		}

		.system-stats__icon {
			width: 14px;
			height: 14px;
		}

		.system-stats__value {
			font-size: var(--font-size-xs);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.system-stats__item {
			transition: none;
		}
	}
</style>
