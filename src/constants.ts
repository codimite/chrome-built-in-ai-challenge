export const MESSAGE_ACTIONS = {
    REWRITE: 'REWRITE',
    REDACTIFY: 'REDACTIFY',
    SUMMARIZE: 'SUMMARIZE',
    IS_APIS_READY: 'IS_APIS_READY',
    RE_INIT: 'RE_INIT',
};

export const VISIBLE_BUTTONS = {
    ALL: ['summarize', 'rewrite', 'redact'] as const,
    REWRITE_ONLY: ['rewrite'] as const,
    REDACT_ONLY: ['redact'] as const,
    SUMMARIZE_ONLY: ['summarize'] as const,
    REWRITE_AND_SUMMARIZE: ['rewrite', 'summarize'] as const,
    REWRITE_AND_REDACT: ['rewrite', 'redact'] as const,
    REDACT_AND_SUMMARIZE: ['redact','summarize'] as const,
  } as const;
  
export type VisibleButtons = readonly (typeof VISIBLE_BUTTONS[keyof typeof VISIBLE_BUTTONS])[number][];

export const redactifySystemPrompt = `I want you to identify specific types of information in the text I provide and return the results in JSON format. Each result should include the following:
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


export const rewriterContext = `Please rewrite the given input to improve its grammatical accuracy and clarity. You don't provide any additional information or answer to questions. Only give a single response. Here are a few examples:

User: 'I home came.'
Your Response: 'I came home.'

User: 'She happy very is.'
Your Response: 'She is very happy.'

User: 'Dog the barking is.'
Your Response: 'The dog is barking.'

User: 'Weather today good is the.'
Your Response: 'The weather is good today.'

User: 'This book reading I am.'
Your Response: 'I am reading this book.'

User: 'He to office the early goes always.'
Your Response: 'He always goes to the office early.'

User: 'The movie was amazing.'
Your Response: 'The film was incredible.'

User: 'This problem is hard to solve.'
Your Response: 'Solving this problem is challenging.'

User: 'The food tastes good.'
Your Response: 'The food is delicious.'

User: 'He is an intelligent student.'
Your Response: 'He is a bright learner.'
`;

export const REDACTIFY_ENABLED_SITES = [
    "chatgpt.com",
    "gemini.google.com",
    "claude.ai",
    "perplexity.ai",
    "character.ai",
    "dialogflow.cloud.google.com",
    "platform.openai.com",
    "chatbot.com",
    "copilot.microsoft.com",
]