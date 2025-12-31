import type { Reroute } from '@sveltejs/kit';

// Reroute /index.html to root for Chrome extension compatibility
export const reroute: Reroute = ({ url }) => {
	if (url.pathname === '/index.html') {
		return '/';
	}
};
