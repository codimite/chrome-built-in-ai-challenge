import { Task } from './TaskQueue';

export class RedactifyModel {
  private model: any;

  async init() {
    console.log("Initializing RedactifyModel");

    const redactifySystemPrompt = `I want you to identify specific types of information in the text I provide and return the results in JSON format. Each result should include the following:
    1. **type**: What kind of information it is (e.g., "Company Name," "Email Address," etc.).
    2. **value**: The actual piece of information extracted from the input.
    
    Make sure to output the data in a valid JSON format like this:
    [
      {
        "type": "<Type of Information>",
        "value": "<Extracted Information>"
      },
      {
        "type": "<Another Type>",
        "value": "<Another Extracted Information>"
      }
    ]
    
    ### Examples:
    
    Input:  
    Write an email to Sadness Company.  
    Output:  
    [
      {
        "type": "Company Name",
        "value": "Sadness"
      }
    ]
    
    Input:  
    Send a message to john.doe@example.com.  
    Output:  
    [
      {
        "type": "Email Address",
        "value": "john.doe@example.com"
      }
    ]
    
    Input:  
    Call Mike at +1234567890.  
    Output:  
    [
      {
        "type": "Phone Number",
        "value": "+1234567890"
      },
      {
        "type": "Name",
        "value": "Mike"
      }
    ]
    
    If you are not confident about extracting the information, simply return an empty JSON array: [].
    
    ### Now your task:
    Given the input I provide, extract the sensitive information, identify its type, and return the result as a valid JSON array following the examples above. Make sure the output is always properly formatted JSON.`;
    

    const redactifyCapabilities = await ai.languageModel.capabilities();
    this.model = await ai.languageModel.create({
      temperature: redactifyCapabilities.defaultTemperature,
      topK: redactifyCapabilities.defaultTopK,
      systemPrompt: redactifySystemPrompt,
    });

    console.log("Redactify model initialized v4");
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
