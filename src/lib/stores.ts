import { writable } from 'svelte/store';

// Define the shape of our data
export interface Site {
  title: string;
  url: string;
}

// Create a writable store
export const topSites = writable<Site[]>([]);

// Function to populate data (Robust logic with fallbacks)
export const loadSites = () => {
  if (typeof chrome !== 'undefined' && chrome.topSites) {
    chrome.topSites.get((sites) => {
      // Map and slice to ensure strict data shape
      const cleanSites = sites.slice(0, 8).map(s => ({
        title: s.title,
        url: s.url
      }));
      topSites.set(cleanSites);
    });
  } else {
    // Dev fallback
    topSites.set([
        { title: "Localhost", url: "http://localhost:5173" },
        { title: "GitHub", url: "https://github.com" },
        { title: "Hacker News", url: "https://news.ycombinator.com" }
    ]);
  }
};