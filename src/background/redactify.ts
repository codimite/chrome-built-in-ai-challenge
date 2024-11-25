// interface 
import { RedactifyQueueItem } from './interfaces';

var redactifyModel: any; 

// Queues and busy flags
let redactifyQueue: RedactifyQueueItem[] = [];
let redactifyModelBusy: boolean = false;


export async function initRedactifyModel() {
    console.log("running redactify v11")

    const redactifySystemPrompt = `I want you to identify specific types of information in the text I provide and return the results in JSON format. Each result should include the following:
    1. **type**: What kind of information it is (e.g., "Company Name," "Email Address," etc.).
    2. **value**: The actual piece of information extracted from the input.

    Make sure to output the data in the following JSON format:
    {
    "type": "<Type of Information>",
    "value": "<Extracted Information>"
    }

    ### Examples:

    Input:  
    Write an email to Sadness Company.  
    Output:  
    {
    "type": "Company Name",
    "value": "Sadness"
    }

    Input:  
    Send a message to john.doe@example.com.  
    Output:  
    {
    "type": "Email Address",
    "value": "john.doe@example.com"
    }

    Input:  
    Call Mike at +1234567890.  
    Output:  
    {
    "type": "Phone Number",
    "value": "+1234567890"
    },
    {
    "type": "Name",
    "value": "Mike"
    }

    If you are not confident about extracting the information, simply return an empty JSON: {}

    ### Now your task:
    Given the input I provide, extract the sensitive information, identify its type, and return the result in the JSON format shown above.`

    const redactifyCapabilities = await ai.languageModel.capabilities();
    redactifyModel = await ai.languageModel.create({
        temperature: redactifyCapabilities.defaultTemperature,
        topK: redactifyCapabilities.defaultTopK,
        systemPrompt: redactifySystemPrompt,
    });
    // redactifyModel = await redactifyModelV1.init();
    console.log("Redactify model initialized");
}

export function enqueueRedact(prompt: string, sendResponse: (response: any) => void) {
    redactifyQueue.push({ prompt, sendResponse });
    processRedactQueue();
}

function processRedactQueue() {
    if (redactifyModelBusy || redactifyQueue.length === 0) {
      return; // Either the model is busy or there's nothing to process
    }
  
    redactifyModelBusy = true;
    const { prompt, sendResponse } = redactifyQueue.shift() as RedactifyQueueItem;
  
    redactify(prompt)
        .then((result) => {
        sendResponse({ result: result });
        })
        .catch((error) => {
        console.error('Error in rewrite:', error);
        sendResponse({ error: error.message });
        })
        .finally(() => {
        redactifyModelBusy = false;
        processRedactQueue(); // Process the next item in the queue
        });
}

async function redactify(prompt: string) {
    //TODO: handle if redactifyModel not initialized
    try {
        console.log("prompt in redactify:", prompt)
        const result = await redactifyModel.prompt(prompt);
        console.log("result in redactify:", result)
        // return result;
        return prompt;//TODO: replace prompt with result added just for testing
    } catch (error) {
        console.error('Error during redactify:', error);
        // return prompt;
        throw error; // Rethrow the error to be caught in the .catch() above
    }
}