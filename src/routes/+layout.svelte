<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	let isDarkMode = $state(false);

	let { children } = $props();

	if (typeof localStorage !== 'undefined') {
		const savedDarkMode = localStorage.getItem('skim-dark-mode');
		if (savedDarkMode) {
			isDarkMode = savedDarkMode === 'true';
		}
	}

	$effect(() => {
		localStorage.setItem('skim-dark-mode', isDarkMode.toString());
		document.body.classList.toggle('dark', isDarkMode);
	});

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<main class:dark={isDarkMode}>
	<button class="dark-mode-toggle" onclick={toggleDarkMode}>
		{isDarkMode ? '☀️' : '🌙'}
	</button>
	{@render children?.()}
</main>

<style>
	main {
		width: 100%;
		max-width: 900px;
		min-height: 100vh;
		background-color: #f5f5f5;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		/* center */
		margin: auto 0;
		margin-left: auto;
		margin-right: auto;
		padding: 1rem;

		transition: all 0.3s ease;
		min-height: 100vh;
		padding: 20px;
		color: #333333;
	}

	:global(main.dark) {
		background-color: #1a1a1a;
		color: #e0e0e0;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #f5f5f5;
		transition: background-color 0.3s ease;
	}

	:global(body.dark) {
		background-color: #121212;
	}

	.dark-mode-toggle {
		background: none;
		border: 2px solid #ccc;
		border-radius: 8px;
		padding: 8px 12px;
		cursor: pointer;
		font-size: 1.2em;
		transition: all 0.2s ease;
	}

	.dark-mode-toggle:hover {
		background-color: #f0f0f0;
	}

	.dark-mode-toggle {
		border-color: #555;
		color: #e0e0e0;
	}

	.dark-mode-toggle:hover {
		background-color: #333;
	}

	* {
		box-sizing: border-box;
	}

	:global(button) {
		background-color: #ecf0f1;
		border: 1px solid #bdc3c7;
		color: #2c3e50;
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}

	:global(button:hover) {
		background-color: #d5dbdb;
	}

	:global(button.selected) {
		background-color: #3498db;
		color: white;
		border-color: #2980b9;
	}

	:global(button.negative) {
		background-color: #e74c3c;
		color: white;
		border-color: #c0392b;
	}

	:global(textarea) {
		width: 100%;
		margin: 10px 0;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-family: inherit;
		resize: vertical;
		background-color: #ffffff;
		color: #333;
	}

	:global(main.dark) :global(textarea) {
		background-color: #2a2a2a;
		border-color: #555;
		color: #e0e0e0;
	}

	:global(input[type='range']) {
		width: 200px;
		margin: 0 10px;
	}

	:global(input[type='number']) {
		width: 80px;
		padding: 5px;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 1em;
		background-color: #ffffff;
		color: #333;
	}

	:global(main.dark) :global(input[type='number']) {
		width: 80px;
		padding: 5px;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 1em;
		background-color: #ffffff;
		color: #333;
	}

	:global(main.dark) :global(input[type='number']) {
		background-color: #2a2a2a;
		border-color: #555;
		color: #e0e0e0;
	}
</style>
