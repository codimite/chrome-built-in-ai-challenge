import { getSelectedText, replaceSelectedText, clearSelectionState } from '../utils/selectionUtils'
import { removeToolbar, renderSummarizerBlock } from '../utils/uiUtils'
import { MESSAGE_ACTIONS } from '../../constants'

/**
 * Handles the summarize action.
 */
export function handleSummarize(x: number, y: number): Promise<void> {
    const selectedText = getSelectedText()

    if (selectedText !== '') {
        const prompt = selectedText
        console.log(`Sending "${prompt}" as the selected text for summarization.`)

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: MESSAGE_ACTIONS.SUMMARIZE, data: prompt },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError)
                        reject(chrome.runtime.lastError)
                    } else {
                        let summarizedText = response.result
                        console.log(`Received summarized text: "${summarizedText}"`)

                        summarizedText = summarizedText.replace(/\*/g, '') // Remove asterisks

                        renderSummarizerBlock(x, y + 35, summarizedText)
                        resolve()
                    }
                },
            )
        })
    } else {
        removeToolbar()
        return Promise.resolve()
    }
}

/**
 * Handles the rewrite action.
 */
export function handleRewrite(): Promise<void> {
    const selectedText = getSelectedText()

    if (selectedText !== '') {
        const prompt = selectedText
        console.log(`Sending "${prompt}" as the selected text for rewriting.`)

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: MESSAGE_ACTIONS.REWRITE, data: prompt },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError)
                        reject(chrome.runtime.lastError)
                    } else {
                        const replacementText = response.result
                        console.log(`Received rewritten text: "${replacementText}"`)

                        replaceSelectedText(replacementText)
                        resolve()
                    }
                },
            )
        })
    } else {
        removeToolbar()
        return Promise.resolve()
    }
}

/**
 * Handles the redact action.
 */
export function handleRedact(): Promise<void> {
    const selectedText = getSelectedText()

    if (selectedText !== '') {
        const prompt = selectedText
        console.log(`Sending "${prompt}" as the selected text for redaction.`)

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: MESSAGE_ACTIONS.REDACTIFY, data: prompt },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError)
                        reject(chrome.runtime.lastError)
                    } else {
                        const replacementText = response.result
                        console.log(`Received redacted text: "${replacementText}"`)

                        replaceSelectedText(replacementText)
                        resolve()
                    }
                },
            )
        })
    } else {
        removeToolbar()
        return Promise.resolve()
    }
}
