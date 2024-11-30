import { Task } from './TaskQueue';
import { rewriterContext } from '../constants';

export class RewriterModel {
  private model: any;

  async init() {
    console.log("Initializing RewriterModel");

    this.model = await ai.rewriter.create({
      tone: 'as-is',
      length: 'as-is',
      format: 'as-is',
      sharedContext: rewriterContext,
    });
    console.log("Rewriter model initialized");
  }

  isModelAvailable() {
    return this.model !== undefined && this.model !== null;
  }

  async processTask(task: Task<string>) {
    if (!this.model) {
      task.sendResponse({ error: 'Rewriter model not initialized' });
      return;
    }
    try {
      console.log('Prompt in rewrite:', task.data);
      const result = await this.model.rewrite(task.data);

      if (result.includes(task.data)) {
        console.log('Result includes the given prompt, returning the prompt as it is:', result);
        task.sendResponse({ result: task.data });
      } else {
        task.sendResponse({ result });
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes(
          'The model attempted to output text in an untested language, and was prevented from doing so.'
        )
      ) {
        console.log('Error in rewrite. Returning the prompt as it is', error);
        task.sendResponse({ result: task.data });
      } else {
        console.error('Error during rewrite:', error);
        //if error return the prompt as it is //TODO: make error handling better 
        task.sendResponse({ result: task.data });
      }
    }
  }
}
