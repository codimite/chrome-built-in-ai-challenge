console.log('Background is running')

import { MESSAGE_ACTIONS } from '../constants'

import { TaskQueue } from './TaskQueue'
import { RedactifyModel } from './RedactifyModel'
import { RewriterModel } from './RewriterModel'
import { SummarizerModel } from './SummarizerModel'

// Instantiate and initialize models
const redactifyModel = new RedactifyModel()
const rewriterModel = new RewriterModel()
const summarizerModel = new SummarizerModel()

async function initModels() {
    try {
        console.log('Initializing models...')
        await Promise.all([redactifyModel.init(), rewriterModel.init(), summarizerModel.init()])
        console.log('Models initialized successfully')
    } catch (error) {
        console.error('Error initializing models:', error)
    }
}
initModels()

// Create task queues
const redactifyQueue = new TaskQueue<string>((task) => redactifyModel.processTask(task))
const rewriterQueue = new TaskQueue<string>((task) => rewriterModel.processTask(task))
const summarizerQueue = new TaskQueue<string>((task) => summarizerModel.processTask(task))

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === MESSAGE_ACTIONS.REWRITE) {
        rewriterQueue.enqueue(request.data, sendResponse)
        return true
    }

    if (request.action === MESSAGE_ACTIONS.REDACTIFY) {
        redactifyQueue.enqueue(request.data, sendResponse)
        return true
    }

    if (request.action === MESSAGE_ACTIONS.SUMMARIZE) {
        summarizerQueue.enqueue(request.data, sendResponse)
        return true
    }

    if (request.action === MESSAGE_ACTIONS.IS_APIS_READY) {
        sendResponse({
            rewriter: rewriterModel.isModelAvailable(),
            summarizer: summarizerModel.isModelAvailable(),
            prompt: redactifyModel.isModelAvailable(), // redactifyModel uses prompt API
        })
        return
    }

    if (request.action === MESSAGE_ACTIONS.RE_INIT) {
        if (
            !rewriterModel.isModelAvailable() &&
            !redactifyModel.isModelAvailable() &&
            !summarizerModel.isModelAvailable()
        ) {
            initModels()
        }
        sendResponse({
            rewriter: rewriterModel.isModelAvailable(),
            summarizer: summarizerModel.isModelAvailable(),
            prompt: redactifyModel.isModelAvailable(),
        })
        return
    }

    console.warn(`Unhandled action: ${request.action}`)
    sendResponse({ error: 'Unknown action' })
})
