import { Task } from './TaskQueue';
import { redactifySystemPrompt } from '../constants';

export class RedactifyModel {
  private model: any = null;

  async init() {
    console.log("Initializing RedactifyModel");
    try {
      if (!ai || !ai.languageModel) {
        throw new Error("AI is undefined or not properly initialized.");
      }

      const redactifyCapabilities = await ai.languageModel.capabilities();
      this.model = await ai.languageModel.create({
        temperature: redactifyCapabilities.defaultTemperature,
        topK: redactifyCapabilities.defaultTopK,
        systemPrompt: redactifySystemPrompt,
      });

      console.log("Redactify model initialized");
    } catch (error) {
      console.error("Failed to initialize RedactifyModel:", error);
      this.model = null;
    }
  }

  isModelAvailable() {
    return this.model !== null;
  }

  async processTask(task: Task<string>) {
    try {
        console.log("Prompt in redactify:", task.data);

        const cost = await this.model.countPromptTokens(task.data.trim());
        if (cost === undefined || cost === null) {
          console.error("Failed to calculate token cost.");
          return;
        }
        console.log("Cost in redactify model:", cost);
    
        // Access the tokens left in the current session
        let tokensLeft = this.model.tokensLeft;
    
        // Check if the model can handle the prompt's cost
        if (cost > tokensLeft) {
          console.warn(
            `Cost (${cost}) exceeds tokens left (${tokensLeft}). Updating session...`
          );
    
          // Destroy the current session
          await this.model.destroy();
    
          // Create a new session with desired parameters
          await this.init();
    
          // Update tokensLeft after creating a new session
          tokensLeft = this.model.tokensLeft;
          console.log("New session created. Tokens left:", tokensLeft);
        }else{
            console.log("No need to update session. Tokens left:", tokensLeft);
        }

      
      const result = await this.model.prompt(task.data);
      console.log("Result in redactify:", result);
        console.log("logging the model", this.model);
      // Attempt to parse the model's result as JSON
      let parsedResult;
      try {
        parsedResult = JSON.parse(result);
      } catch {
        console.warn("Model output is not valid JSON. Returning original data.");
        task.sendResponse({ result: task.data });
        return;
      }
  
      // Check if the parsed result is an array or single object
      const replacements = Array.isArray(parsedResult) ? parsedResult : [parsedResult];
  
      // Replace content in task.data based on the parsedResult
      let updatedData = task.data;
      for (const replacement of replacements) {
        if (replacement.type && replacement.value) {
          // Escape special regex characters in the value
          const escapedValue = replacement.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedValue, 'g'); // Match all occurrences
          updatedData = updatedData.replace(regex, `[${replacement.type}]`);
        }
      }
  
      // Send the updated data back in the response
      task.sendResponse({ result: updatedData });
    } catch (error) {
      console.error('Error during redactify:', error);
      if (error instanceof Error) {
        task.sendResponse({ error: error.message });
      } else {
        task.sendResponse({ error }); // TODO: Make error handling better
      }
    }
  }
}
