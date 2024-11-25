export interface RedactifyQueueItem {
    prompt: string;
    sendResponse: (response: any) => void;
}