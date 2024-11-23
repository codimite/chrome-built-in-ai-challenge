console.log('background is running')

// Global data or functions //TODO: add global variables 
let globalState = {
    userSettings: {},
    cache: {},
    // ... other global variables
};
  
var rewriterModel: any; //TODO: currently we use PromptAPI to simulate what RewriterAPI would do because RewriterAPI has a known bug: https://issues.chromium.org/issues/374942272
var redactifyModel: any; 

async function initApp(){
    //Rewriter model
    const rewriterSystemPrompt = `You are an AI assistant that helps users rewrite given input in a way that is more understable grammatically accurate. You don't provide any additional information or answer to questions. Here are few examples:

    User: "I came, she came before me"
    Your Response: "I arrived, but she had arrived before me."

    User: "Can you write a simple for loop to print numbers from 1 to 10?"
    Your Response: "Write a simple for loop that prints numbers from 1 to 10."

    User: "Rewrite this"
    Your Response: "Rewrite this"
    `;
    const rewriterCapabilities = await ai.languageModel.capabilities();
    rewriterModel = await ai.languageModel.create({
        temperature: rewriterCapabilities.defaultTemperature,
        topK: rewriterCapabilities.defaultTopK,
        systemPrompt: rewriterSystemPrompt,
    });
    console.log("rewriter model initialized in the background")

    //Redactify model
    const redactifySystemPrompt = `You are an AI assistant that helps users redact sensitive information from given input. You don't provide any additional information or answer to questions. Here are few examples:

    User: "My name is John Doe. I live in New York. My phone number is 123-456-7890."
    Your Response: "My name is [NAME]. I live in [LOCATION]. My phone number is [CONTACT NUMBER]."

    User: "API KEY: e3b0c44298"
    Your Response: "[API KEY]"

    User: "Write an email to Codimite company"
    Your Response: "Write an email to [COMPANY NAME] company"

    You need to replace the sensitive information with a placeholder. If you are unable to redact the information, just repeat the input.
    `;
    console.log("reactivy version: v10")
    const redactifyCapabilities = await ai.languageModel.capabilities();
    redactifyModel = await ai.languageModel.create({
        temperature: redactifyCapabilities.defaultTemperature,
        topK: redactifyCapabilities.defaultTopK,
        systemPrompt: redactifySystemPrompt,
    });
    console.log("redactify model initialized in the background")
}

initApp()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'REWRITE') {
        rewrite(request.data)
            .then((result) => {
                sendResponse({ result: result });
            })
            .catch((error) => {
                console.error('Error in rewrite:', error);
                sendResponse({ error: error.message });
            });
        return true;
    }
    if (request.action === 'REDACTIFY') {
        redactify(request.data)
            .then((result) => {
                sendResponse({ result: result });
            })
            .catch((error) => {
                console.error('Error in redactify:', error);
                sendResponse({ error: error.message });
            });
        return true;
    }
});

async function rewrite(prompt: string) {
    //TODO: handle if rewriterModel not initialized
    try {
        console.log("prompt in rewrite:", prompt)
        // const result = await rewriterModel.prompt(prompt);//DEBUG: remove

        // sleep for 5 seconds
        function sleep(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await sleep(5000);
        const result = "test string" //DEBUG: remove
        console.log("result in rewrite:", result)
        return result;
    } catch (error) {
        console.error('Error during rewrite:', error);
        throw error; // Rethrow the error to be caught in the .catch() above
    }
}

async function redactify(prompt: string) {
    //TODO: handle if redactifyModel not initialized
    try {
        console.log("prompt in redactify:", prompt)
        const result = await redactifyModel.prompt(prompt);
        console.log("result in redactify:", result)
        return result;
    } catch (error) {
        console.error('Error during redactify:', error);
        throw error; // Rethrow the error to be caught in the .catch() above
    }
}