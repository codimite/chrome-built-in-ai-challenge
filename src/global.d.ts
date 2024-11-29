/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

export {};

declare global {
  type AIModelAvailability = 'readily' | 'after-download' | 'no';

  interface LanguageModelCapabilities {
    available: AIModelAvailability;
    defaultTemperature: number;
    defaultTopK: number;
    maxTopK: number;
  }

  interface LanguageModel {
    capabilities: (options?: any) => Promise<LanguageModelCapabilities>;
    create: (options?: any) => Promise<any>;
  }

  interface RewriterOptions {
    tone: 'as-is' | 'more-formal' | 'more-casual';
    length: 'as-is' | 'shorter' | 'longer';
    format: 'as-is' | 'plain-text' | 'markdown';
    sharedContext: string;
  }

  interface Rewriter {
    rewrite: (input: string) => Promise<string>;
  }

  interface RewriterModel {
    create: (options: RewriterOptions) => Promise<Rewriter>;
  }

  interface Summarizer {
    summarize: (input: string) => Promise<string>;
  }

  interface SummarizerModel {
    create: () => Promise<Summarizer>;
  }

  interface AI {
    languageModel: LanguageModel;
    rewriter: RewriterModel;
    summarizer: SummarizerModel;
  }

  const ai: AI;
}
