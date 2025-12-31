#!/usr/bin/env node

/**
 * Post-build script to extract inline scripts from index.html
 * Chrome extensions don't allow inline scripts due to CSP
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const buildDir = 'build';
const indexPath = join(buildDir, 'index.html');

// Read index.html
let html = readFileSync(indexPath, 'utf-8');

// Extract the inline script
const scriptRegex = /<script>\s*\{[\s\S]*?\}\s*<\/script>/;
const match = html.match(scriptRegex);

if (match) {
	const inlineScript = match[0];

	// Extract just the JavaScript content
	let scriptContent = inlineScript.replace(/<script>\s*/, '').replace(/\s*<\/script>/, '');

	// Fix global variable assignment - convert __sveltekit_xxx to window.__sveltekit_xxx
	scriptContent = scriptContent.replace(/(__sveltekit_\w+)\s*=/, 'window.$1 =');

	// Fix document.currentScript issue - it's null for module scripts
	// Instead, find the script's parent or use document.body
	scriptContent = scriptContent.replace(
		/const element = document\.currentScript\.parentElement;/,
		"const element = document.querySelector('div[data-sveltekit-preload-data]') || document.body;"
	);

	// Write to external file
	const initScriptPath = join(buildDir, 'app', 'init.js');
	writeFileSync(initScriptPath, scriptContent, 'utf-8');

	// Replace inline script with external script tag
	html = html.replace(scriptRegex, '<script type="module" src="/app/init.js"></script>');

	// Write updated HTML
	writeFileSync(indexPath, html, 'utf-8');

	console.log('✅ Extracted inline script to /app/init.js');
} else {
	console.log('ℹ️  No inline script found');
}

// Remove the CSP meta tag that SvelteKit generates - it conflicts with manifest.json CSP
html = html.replace(/<meta http-equiv="content-security-policy"[^>]*>/i, '');
writeFileSync(indexPath, html, 'utf-8');
console.log('✅ Removed conflicting CSP meta tag');
