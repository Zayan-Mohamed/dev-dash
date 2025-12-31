import type { HandleClientError } from '@sveltejs/kit';

// Handle client-side errors gracefully
export const handleError: HandleClientError = ({ error, event }) => {
	console.error('Client error:', error, event);

	return {
		message: 'An error occurred'
	};
};
