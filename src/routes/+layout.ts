import { browser } from '$app/environment';

export const load = async () => {
	// Prevent SvelteKit from trying to fetch data server-side
	if (!browser) {
		return {};
	}

	return {};
};

export const ssr = false;
export const prerender = false;
export const csr = true;
