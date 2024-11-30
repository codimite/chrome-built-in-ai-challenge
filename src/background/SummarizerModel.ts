import { Task } from './TaskQueue';

export class SummarizerModel {
  private model: any;

  async init() {
    console.log("Initializing SummarizerModel");
    try {
        if (!ai || !ai.summarizer) {
          throw new Error("AI is undefined or not properly initialized.");
        }
        
        this.model = await ai.summarizer.create();
        console.log("Summarizer model initialized");
    } catch (error) {
        console.warn("Failed to initialize SummarizerModel:", error);
        this.model = null;
    }
  }

  isModelAvailable() {
    return this.model !== null;
  }

  // Process a task using the summarizer model
  async processTask(task: Task<string>) {
    if (!this.model) {
      task.sendResponse({ error: 'Summarizer model not initialized' });
      return;
    }
    try {
      console.log('Text to summarize:', task.data);

      // Use the summarizer model to summarize the input text
      const result = await this.model.summarize(task.data);

      // Send the result back through the task's callback
      task.sendResponse({ result });
    } catch (error) {
      console.error('Error during summarization:', error);

      // On error, return the original text as it is (can customize error handling later)
      task.sendResponse({ result: task.data });
    }
  }
}
