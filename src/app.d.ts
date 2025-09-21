// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	class LanguageModel {
		static async create(config: { initialPrompts: { role: string; content: string }[] }): Promise<LanguageModel>;
		async prompt(message: string): Promise<string>;
		async promptStreaming(message: string): ReadableStream;
	}
}

export {};
