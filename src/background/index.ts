// import * from 'redactify';

console.log('background is running')

import * as redactify from './redactify';


// Global data or functions //TODO: add global variables 
let globalState = {
    userSettings: {},
    cache: {},
    // ... other global variables
};
  
var rewriterModel: Rewriter;
var redactifyModelV1: any; 

interface RedactifyQueueItem {
    prompt: string;
    sendResponse: (response: any) => void;
}

// Queues and busy flags
let rewriteQueue: RedactifyQueueItem[] = [];
let rewriteModelBusy: boolean = false;

async function initModels(){
    //Rewriter model
    const rewriterContext = "Rewrite given input in a way that is more understable grammatically accurate. You don't provide any additional information or answer to question. Don't provide additional information or answer to questions. Here are few examples: User: 'I came, she came before me' Your Response: 'I arrived, but she had arrived before"

    rewriterModel = await ai.rewriter.create({
        tone: 'as-is',
        length: 'as-is',
        format: 'as-is',
        sharedContext: rewriterContext
    });
    console.log("rewriter model initialized in the background")

    // //Redactify model
    // const redactifySystemPrompt = `You are an AI assistant that helps users redact sensitive information from given input. You don't provide any additional information or answer to questions. Here are few examples:

    // User: "My name is John Doe. I live in New York. My phone number is 123-456-7890."
    // Your Response: "My name is [NAME]. I live in [LOCATION]. My phone number is [CONTACT NUMBER]."

    // User: "API KEY: e3b0c44298"
    // Your Response: "[API KEY]"

    // User: "Write an email to Codimite company"
    // Your Response: "Write an email to [COMPANY NAME] company"

    // You need to replace the sensitive information with a placeholder. If you are unable to redact the information, just repeat the input.
    // `;
    // console.log("reactivy version: v10")
    // const redactifyCapabilities = await ai.languageModel.capabilities();
    // redactifyModelV1 = await ai.languageModel.create({
    //     temperature: redactifyCapabilities.defaultTemperature,
    //     topK: redactifyCapabilities.defaultTopK,
    //     systemPrompt: redactifySystemPrompt,
    // });
    redactify.initRedactifyModel()
    console.log("redactify model initialized in the background")
}

initModels()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'REWRITE') {
        enqueueRewrite(request.data, sendResponse);
        return true; // Keeps sendResponse valid for asynchronous use
    }
    if (request.action === 'REDACTIFY') {
        redactify.enqueueRedact(request.data, sendResponse);
    }
});

function enqueueRewrite(prompt: string, sendResponse: (response: any) => void) {
    rewriteQueue.push({ prompt, sendResponse });
    processRewriteQueue();
  }

  // Process queue functions
function processRewriteQueue() {
    if (rewriteModelBusy || rewriteQueue.length === 0) {
      return; // Either the model is busy or there's nothing to process
    }
  
    rewriteModelBusy = true;
    const { prompt, sendResponse } = rewriteQueue.shift() as RedactifyQueueItem;
  
    rewrite(prompt)
        .then((result) => {
        sendResponse({ result: result });
        })
        .catch((error) => {
        console.error('Error in rewrite:', error);
        sendResponse({ error: error.message });
        })
        .finally(() => {
        rewriteModelBusy = false;
        processRewriteQueue(); // Process the next item in the queue
        });
}

async function rewrite(prompt: string): Promise<string> {
    //TODO: handle if rewriterModel not initialized
    if (!rewriterModel) {
      throw new Error('Rewriter model not initialized');
    }
    try {
      console.log('Prompt in rewrite:', prompt);
      console.log('Model in rewrite:', rewriterModel);
      const result = await rewriterModel.rewrite(prompt);
  
      if (result.includes(prompt)) { // If the result includes the given prompt, it means the model was unable to generate a response and just repeated the prompt
        console.log('Result includes the given prompt, returning the prompt as it is:', result);
        return prompt; // Return the prompt as it is
      }
      return result;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes(
          'The model attempted to output text in an untested language, and was prevented from doing so.'
        )
      ) {
        console.log('Error in rewrite. Returning the prompt as it is', error);
        return prompt;
      }
      console.error('Error during rewrite:', error);
    //   throw error; // Rethrow the error to be caught in the .catch() above
        return prompt;
    }
}

// async function redactify(prompt: string) {
//     //TODO: handle if redactifyModel not initialized
//     try {
//         console.log("prompt in redactify:", prompt)
//         const result = await redactifyModelV1.prompt(prompt);
//         console.log("result in redactify:", result)
//         return result;
//     } catch (error) {
//         console.error('Error during redactify:', error);
//         // return prompt;
//         throw error; // Rethrow the error to be caught in the .catch() above
//     }
// }