/**
 * TopSites Service
 * Handles Chrome topSites API with fallback for dev environment
 */

export interface Site {
	title: string;
	url: string;
}

const MOCK_SITES: Site[] = [
	{ title: 'GitHub', url: 'https://github.com' },
	{ title: 'Stack Overflow', url: 'https://stackoverflow.com' },
	{ title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
	{ title: 'Dev.to', url: 'https://dev.to' },
	{ title: 'Reddit', url: 'https://reddit.com' },
	{ title: 'HackerNews', url: 'https://news.ycombinator.com' }
];

const isExtension = typeof chrome !== 'undefined' && chrome.topSites;

/**
 * Fetches top sites from Chrome API or returns mock data in dev
 */
export async function getTopSites(): Promise<Site[]> {
	if (!isExtension) {
		return Promise.resolve(MOCK_SITES);
	}

	try {
		const sites = await chrome.topSites.get();
		return sites.map((site) => ({
			title: site.title,
			url: site.url
		}));
	} catch (error) {
		console.error('Failed to fetch top sites:', error);
		return MOCK_SITES;
	}
}
