export {};

declare global {
    type AIModelAvailability = 'readily' |  'after-download' | 'no';

    interface LanguageModel {
        capabilities: (options?: any) => Promise<{
          available: AIModelAvailability;
          defaultTemperature: number;
          defaultTopK: number;
          maxTopK: number;
          // Add other properties as needed
        }>;
        create: (options? :any) => Promise<any>;
        // Add other methods and properties if necessary
    }
    
    interface AI {
        languageModel: LanguageModel;
    }
    
    declare const ai: AI;
}
