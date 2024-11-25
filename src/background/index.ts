console.log('background is running')

import { TaskQueue } from './TaskQueue';
import { RedactifyModel } from './RedactifyModel';
import { RewriterModel } from './RewriterModel';

// Instantiate models
const redactifyModel = new RedactifyModel();
const rewriterModel = new RewriterModel();

// Initialize models
async function initModels() {
  await Promise.all([redactifyModel.init(), rewriterModel.init()]);
  console.log("Models initialized");
}
initModels();

// Create queues with respective processing functions
const redactifyQueue = new TaskQueue<string>((task) => redactifyModel.processTask(task));
const rewriterQueue = new TaskQueue<string>((task) => rewriterModel.processTask(task));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'REWRITE') {
    rewriterQueue.enqueue(request.data, sendResponse);
    return true; // Keeps sendResponse valid for asynchronous use
  }
  if (request.action === 'REDACTIFY') {
    redactifyQueue.enqueue(request.data, sendResponse);
    return true;
  }
});