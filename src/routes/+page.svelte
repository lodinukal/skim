<script lang="ts">
	let wpm = $state(300);
	let currentWordIndex = $state(0);
	let text = $state('');
	let prompt = $state('');
	let words = $derived(
		text
			.trim()
			.split(/\s+/)
			.filter((word) => word.length > 0)
	);
	let isPlaying = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	if (typeof localStorage !== 'undefined') {
		const savedText = localStorage.getItem('skim-text');
		if (savedText) {
			text = savedText;
		}
		const savedWpm = localStorage.getItem('skim-wpm');
		if (savedWpm) {
			const parsedWpm = parseInt(savedWpm, 10);
			if (!isNaN(parsedWpm)) {
				wpm = parsedWpm;
			}
		}
	}

	$effect(() => {
		localStorage.setItem('skim-text', text);
		localStorage.setItem('skim-wpm', wpm.toString());
	});

	function startReading() {
		if (words.length === 0) return;
		currentWordIndex = Math.min(currentWordIndex, words.length - 1);

		isPlaying = true;
		intervalId = setInterval(() => {
			currentWordIndex++;
			if (currentWordIndex >= words.length) {
				stopReading();
			}
		}, 60000 / wpm);
	}

	function stopReading() {
		isPlaying = false;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function resetReading() {
		stopReading();
		currentWordIndex = 0;
	}

	function jumpToWord(index: number) {
		currentWordIndex = index;
	}

	function scrollCurrentWordIntoView() {
		const currentWordElement = document.querySelector('.word.current');
		if (currentWordElement) {
			currentWordElement.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'center'
			});
		}
	}

	// Auto-scroll when current word changes
	$effect(() => {
		if (currentWordIndex >= 0) {
			// Use setTimeout to ensure DOM is updated
			setTimeout(scrollCurrentWordIntoView, 10);
		}
	});

	// Language model is defined in chrome-types/index.d.ts --- IGNORE ---

	if (typeof LanguageModel === 'undefined') {
	}

	const session =
		typeof LanguageModel === 'undefined'
			? Promise.reject()
			: LanguageModel.create({
					initialPrompts: [
						{
							role: 'system',
							content:
								'You only ever output plain alphanumeric characters, no stars. You are a knowledgeable assistant who will give correct answers.'
						}
					]
				});

	let languageModelAvailable = $state(false);

	session
		.then(() => {
			languageModelAvailable = true;
		})
		.catch(() => {
			languageModelAvailable = false;
		});

	async function promptSession() {
		if (prompt.trim().length === 0) return;
		text = '';

		const stream = (await session).promptStreaming(prompt);
		for await (const chunk of stream as any) {
			let strippedChunk = chunk.replace(/[^a-zA-Z0-9.\s]/g, '');
			// strippedChunk = strippedChunk.replace(/\s+/g, ' ');
			strippedChunk = strippedChunk.replace(/\n+$/, '');
			if (strippedChunk.length === 0) continue;
			text += strippedChunk;
		}
	}

	$effect(() => {
		let _ = text;
		currentWordIndex = currentWordIndex >= words.length ? words.length - 1 : currentWordIndex;
	});
</script>

<div class="header">
	<h1>Skim</h1>
</div>

<label for="wpm">Words per minute</label>
<div class="wpm-controls">
	<input type="range" id="wpm" min="10" max="1000" bind:value={wpm} />
	<input type="number" min="10" max="1000" bind:value={wpm} />
</div>

{#if languageModelAvailable}
	<textarea rows="10" cols="50" placeholder="Prompt" bind:value={prompt}></textarea>
	<button onclick={promptSession}>Enter</button>
{/if}

<textarea rows="10" cols="50" placeholder="Paste text here..." bind:value={text}></textarea>

<!-- Word display area -->
{#if words.length > 0}
	<div class="word-display">
		<div class="word-container">
			{#each words as word, index}
				<span
					class="word"
					class:current={index === currentWordIndex}
					class:past={index < currentWordIndex}
					onclick={() => jumpToWord(index)}
					onkeydown={(e) => e.key === 'Enter' && jumpToWord(index)}
					role="button"
					tabindex="0"
				>
					{word}
				</span>
			{/each}
		</div>
	</div>

	<!-- Current word highlight -->
	<div class="current-word-highlight">
		{#if words[currentWordIndex]}
			<span class="highlighted-word">{words[currentWordIndex]}</span>
		{/if}
	</div>

	<!-- Progress indicator -->
	<div class="progress">
		{currentWordIndex + 1} / {words.length}
	</div>
{/if}

<!-- Controls -->
<div class="controls">
	{#if !isPlaying}
		<button onclick={startReading} disabled={words.length === 0}>Start</button>
	{:else}
		<button onclick={stopReading}>Pause</button>
	{/if}
	<button onclick={resetReading} disabled={words.length === 0}>Reset</button>
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.header h1 {
		margin: 0;
	}

	.word-display {
		margin: 20px 0;
		padding: 15px;
		border: 1px solid #ccc;
		border-radius: 5px;
		background-color: #f9f9f9;
		max-height: 200px;
		overflow-y: auto;
	}

	:global(main.dark) .word-display {
		background-color: #2a2a2a;
		border-color: #555;
	}

	.word-container {
		line-height: 1.6;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.word {
		display: inline-block;
		margin-right: 5px;
		margin-bottom: 2px;
		padding: 2px 4px;
		border-radius: 3px;
		transition: all 0.2s ease;
		word-break: break-word;
		cursor: pointer;
		user-select: none;
	}

	.word:hover {
		background-color: #e0e0e0;
		transform: scale(1.05);
	}

	:global(main.dark) .word:hover {
		background-color: #444;
	}

	.word:focus {
		outline: 2px solid #007cba;
		outline-offset: 1px;
	}

	.word.current {
		background-color: #ffeb3b;
		font-weight: bold;
		transform: scale(1.1);
	}

	:global(main.dark) .word.current {
		color: #1a1a1a;
	}

	.word.past {
		opacity: 0.5;
		color: #666;
	}

	:global(main.dark) .word.past {
		color: #888;
	}

	.current-word-highlight {
		text-align: center;
		margin: 20px 0;
		min-height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.highlighted-word {
		font-size: 2em;
		font-weight: bold;
		background: linear-gradient(45deg, #ffeb3b, #ffc107);
		padding: 10px 20px;
		border-radius: 10px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		animation: highlight-pulse 0.3s ease-in-out;
		color: #1a1a1a;
	}

	@keyframes highlight-pulse {
		0% {
			transform: scale(0.9);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
		}
	}

	.progress {
		text-align: center;
		margin: 10px 0;
		font-size: 0.9em;
		color: #666;
	}

	.controls {
		text-align: center;
		margin: 20px 0;
	}

	.controls button {
		margin: 0 5px;
		padding: 10px 20px;
		font-size: 1em;
		border: none;
		border-radius: 5px;
		background-color: #007cba;
		color: white;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.controls button:hover:not(:disabled) {
		background-color: #005a87;
	}

	.controls button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	:global(main.dark) textarea::placeholder {
		color: #888;
	}

	.wpm-controls {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 10px 0;
	}
</style>
