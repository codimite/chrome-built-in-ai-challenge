import React from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import ActionsToolbar from '../components/ActionsToolbar'
import SummarizerBlock from '../components/SummarizerBlock'
import { VisibleButtons } from '../../constants'
import { handleSummarize, handleRewrite, handleRedact } from '../handlers/actionHandlers'

/**
 * Renders the ActionsToolbar component at the specified coordinates.
 */
export function renderActionsToolbar(x: number, y: number, visibleButtons: VisibleButtons, summarizeBtnLabel = 'Summarize'): void {
    let toolbarContainer = document.getElementById('toolbar-container')
    if (!toolbarContainer) {
        toolbarContainer = document.createElement('div')
        toolbarContainer.id = 'toolbar-container'
        document.body.appendChild(toolbarContainer)
    }

    toolbarContainer.style.position = 'absolute'
    toolbarContainer.style.left = `${x}px`
    toolbarContainer.style.top = `${y}px`
    toolbarContainer.style.zIndex = '1000'

    // Create a shadow root
    const shadowRoot = toolbarContainer.attachShadow({ mode: 'open' })

    // Create a container for React content in shadow DOM
    const shadowContent = document.createElement('div')
    shadowRoot.appendChild(shadowContent)

    const root = createRoot(shadowContent)

    root.render(
        <MantineProvider
            cssVariablesSelector=":host"
            withCssVariables={true}
            getRootElement={() => toolbarContainer}
            withStaticClasses={false}
            withGlobalClasses={false}
        >
            <ActionsToolbar
                onSummarize={() => handleSummarize(x, y)}
                onRewrite={handleRewrite}
                onRedact={handleRedact}
                onClose={removeToolbar}
                visibleButtons={visibleButtons}
                summarizeBtnLabel={summarizeBtnLabel}
            />
        </MantineProvider>,
    )

    // Detect clicks outside the toolbar
    document.addEventListener('mousedown', handleToolbarOutsideClick)
}

/**
 * Renders the SummarizerBlock component at the specified coordinates.
 */
export function renderSummarizerBlock(x: number, y: number, summarizedText: string): void {
    let summarizerContainer = document.getElementById('summarizer-container')
    if (!summarizerContainer) {
        summarizerContainer = document.createElement('div')
        summarizerContainer.id = 'summarizer-container'
        document.body.appendChild(summarizerContainer)
    }

    summarizerContainer.style.position = 'absolute'
    summarizerContainer.style.left = `${x}px`
    summarizerContainer.style.top = `${y}px`
    summarizerContainer.style.zIndex = '1000'

    // Create a shadow root
    const shadowRoot = summarizerContainer.attachShadow({ mode: 'open' })

    // Create a container for React content in shadow DOM
    const shadowContent = document.createElement('div')
    shadowRoot.appendChild(shadowContent)

    const root = createRoot(shadowContent)

    root.render(
        <MantineProvider
            cssVariablesSelector=":host"
            withCssVariables={true}
            getRootElement={() => summarizerContainer}
            withStaticClasses={false}
            withGlobalClasses={false}
        >
            <SummarizerBlock onClose={removeSummarizer} summarizedText={summarizedText} />
        </MantineProvider>,
    )

    // Detect clicks outside the summarizer block
    document.addEventListener('mousedown', handleSummarizerOutsideClick)
}

/**
 * Removes the toolbar from the view.
 */
export function removeToolbar(): void {
    const toolbarContainer = document.getElementById('toolbar-container')
    if (toolbarContainer) {
        toolbarContainer.remove()
    }
    // Remove the event listener
    document.removeEventListener('mousedown', handleToolbarOutsideClick)
}

/**
 * Removes the summarizer block from the view.
 */
export function removeSummarizer(): void {
    const summarizerContainer = document.getElementById('summarizer-container')
    if (summarizerContainer) {
        summarizerContainer.remove()
    }
    // Remove the event listener
    document.removeEventListener('mousedown', handleSummarizerOutsideClick)
}

/**
 * Handles clicks outside the toolbar to remove it.
 */
function handleToolbarOutsideClick(event: MouseEvent): void {
    const toolbarContainer = document.getElementById('toolbar-container')
    if (toolbarContainer && !toolbarContainer.contains(event.target as Node)) {
        removeToolbar()
    }
}

/**
 * Handles clicks outside the summarizer block to remove it.
 */
function handleSummarizerOutsideClick(event: MouseEvent): void {
    const summarizerContainer = document.getElementById('summarizer-container')
    if (summarizerContainer && !summarizerContainer.contains(event.target as Node)) {
        removeSummarizer()
    }
}
