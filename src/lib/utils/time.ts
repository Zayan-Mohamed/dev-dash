/**
 * Time Formatting Utilities
 */

export function formatTime(date: Date, use24Hour: boolean = false): string {
	const options: Intl.DateTimeFormatOptions = {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: !use24Hour
	};

	return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function getGreeting(): string {
	const hour = new Date().getHours();

	if (hour < 12) return 'Good Morning';
	if (hour < 18) return 'Good Afternoon';
	return 'Good Evening';
}
