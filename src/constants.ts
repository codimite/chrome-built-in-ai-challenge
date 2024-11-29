export const MESSAGE_ACTIONS = {
    REWRITE: 'REWRITE',
    REDACTIFY: 'REDACTIFY',
    SUMMARIZE: 'SUMMARIZE',
    IS_APIS_READY: 'IS_APIS_READY',
    RE_INIT: 'RE_INIT',
};

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


export const rewriterContext = `Please rewrite the given input to improve its grammatical accuracy and clarity. You don't provide any additional information or answer to question. Don't provide additional information or answer to questions. Only give single response. Here are few examples: 
    
User: 'I came, she came before me' 
Your Response: 'I arrived, but she had arrived before'

User: 'Birds are flying high in the sky.'
Your Response: 'The birds are flying high in the sky.'
`
;
