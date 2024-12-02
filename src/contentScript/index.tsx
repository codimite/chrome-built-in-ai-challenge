import React from 'react'
import { createRoot } from 'react-dom/client'
import ActionsToolbar from './components/ActionsToolbar'
import SummarizerBlock from './components/SummarizerBlock'
import { MantineProvider } from '@mantine/core'
// import '@mantine/core/styles.css'
// import './styles.css'
import { MESSAGE_ACTIONS, REDACTIFY_ENABLED_SITES, VISIBLE_BUTTONS, VisibleButtons } from '../constants'

console.info('contentScript is running edited')

let storedSelectionRange: Range | null = null // used when using contentEditable
let storedSelectionStart: number | null = null
let storedSelectionEnd: number | null = null
let storedInputElement: HTMLInputElement | HTMLTextAreaElement | null = null

let darkMode: boolean = false

// chrome.storage.sync.get(['darkMode'], (result) => {
//   //TODO: add better name for darkMode
//   console.log('dark mode storage sync')
//   darkMode = result.darkMode
//   // // Use darkMode to conditionally render your HTML button
//   // if (darkMode) {//get css class and set dark mode style
//   //   // Render button with dark mode styling
//   // } else {
//   //   // Render button with light mode styling
//   // }
// })
// function updateButtonAppearance(darkMode) {
//     const button = document.getElementById('my-button');
//     if (darkMode) {
//       // Apply dark mode styles
//       button.classList.add('dark-mode');
//     } else {
//       // Remove dark mode styles
//       button.classList.remove('dark-mode');
//     }
//   }

// chrome.runtime.onMessage.addListener((request) => {
//     console.log("request came")
//     if (request.type === 'DARK_MODE_TOGGLE') {
//         console.log("dark mode request cameeee")
//     }
// })

/**
 * Listen for changes to the darkMode setting and update the button appearance accordingly.
 */
// chrome.storage.onChanged.addListener((changes, area) => {
//   if (area === 'sync' && changes.darkMode) {
//     darkMode = changes.darkMode.newValue
//     //   updateButtonAppearance(darkMode);
//     console.log('dark mode status updated', darkMode)
//   }
// })
const getRootElement = () => (typeof window === 'undefined' ? undefined : document.body)

//rendering actions toolbar
function renderActionsToolbar(x: number, y: number, visibleButtons: VisibleButtons) {
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

  //   const root = createRoot(toolbarContainer)
  const shadowRoot = toolbarContainer.attachShadow({ mode: 'open' })
  //   const root = createRoot(shadowRoot)

  // Create a container for mantine content in shadow dom
  const shadowContent = document.createElement('div')
  shadowRoot.appendChild(shadowContent)

  const root = createRoot(shadowContent)

  root.render(
    // <MantineProvider
    //   getRootElement={getRootElement}

    // >
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
      />
    </MantineProvider>,
  )

  // to detect clicks ouside the toolbar
  document.addEventListener('mousedown', handleToolbarOutsideClick)
}

// rendering summarizer block
function renderSummarizerBlock(x: number, y: number, summarizedText: string) {
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

  //   const root = createRoot(toolbarContainer)
  const shadowRoot = summarizerContainer.attachShadow({ mode: 'open' })
  //   const root = createRoot(shadowRoot)

  // Create a container for mantine content in shadow dom
  const shadowContent = document.createElement('div')
  shadowRoot.appendChild(shadowContent)

  const root = createRoot(shadowContent)

  root.render(
    // <MantineProvider
    //   getRootElement={getRootElement}

    // >
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

  // to detect clicks ouside the toolbar
  document.addEventListener('mousedown', handleSummarizerOutsideClick)
}

// handle summarizer onClick event
function handleSummarize(x: number, y: number) {
  console.log('summarizer clicked!')
  const selectedText = getSelectedText()

  if (selectedText !== '') {
    const prompt = `${selectedText}`
    console.log(`sending ${prompt} as the selected text for Summarizer`)

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: MESSAGE_ACTIONS.SUMMARIZE, data: prompt },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
          } else {
            let summarizedText = response.result
            console.log(`received ${summarizedText} as the reply text`)

            summarizedText = summarizedText.replace(/\*/g, '')

            renderSummarizerBlock(x, y + 35, summarizedText)
            resolve(response)
          }
        },
      )
    })
  } else {
    removeToolbar()
    return Promise.resolve()
  }
}

// handle rewriter onClick event
async function handleRewrite() {
  console.log('rewriter clicked!')

  const selectedText = getSelectedText()

  if (selectedText !== '') {
    const prompt = `${selectedText}`
    console.log(`sending ${prompt} as the selected text for Rewrite`)

    // Return a promise to ensure completion
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.REWRITE, data: prompt }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError)
          reject(chrome.runtime.lastError)
        } else {
          const replacementText = response.result
          console.log(`received ${replacementText} as the reply text`)

          replaceStoredSelectedText(replacementText)
          resolve(response)
        }
      })
    })
  } else {
    removeToolbar()
    return Promise.resolve() // Resolve immediately if there's no selected text
  }
}

// handle redact onClick event
async function handleRedact() {
  console.log('redact clicked!')

  const selectedText = getSelectedText()

  if (selectedText !== '') {
    const prompt = `${selectedText}`
    console.log(`sending ${prompt} as the selected text for Redact`)

    // Return a promise to ensure completion
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: MESSAGE_ACTIONS.REDACTIFY, data: prompt },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
          } else {
            const replacementText = response.result
            console.log(`received ${replacementText} as the reply text`)

            replaceStoredSelectedText(replacementText)
            resolve(response)
          }
        },
      )
    })
  } else {
    removeToolbar()
    return Promise.resolve() // Resolve immediately if there's no selected text
  }
}

// to remove toolbar from the view
const removeToolbar = () => {
    storedSelectionRange = null
    storedSelectionStart = null
    storedSelectionEnd = null
    storedInputElement = null
  const toolbarContainer = document.getElementById('toolbar-container')
  if (toolbarContainer) {
    toolbarContainer.remove()
  }
}

// to remove summarizer from the view
const removeSummarizer = () => {
    storedSelectionRange = null
    storedSelectionStart = null
    storedSelectionEnd = null
    storedInputElement = null
  const summarizerContainer = document.getElementById('summarizer-container')
  if (summarizerContainer) {
    summarizerContainer.remove()
  }
}

// handle outside click for actionsToolbar

const handleToolbarOutsideClick = (event: MouseEvent) => {
  const toolbarContainer = document.getElementById('toolbar-container')
  if (toolbarContainer && !toolbarContainer.contains(event.target as Node)) {
    removeToolbar()

    // unmount the event listener after removing
    document.removeEventListener('mousedown', handleToolbarOutsideClick)
  }
}

// handle outside click for summarizer block

const handleSummarizerOutsideClick = (event: MouseEvent) => {
  const summarizerContainer = document.getElementById('summarizer-container')
  if (summarizerContainer && !summarizerContainer.contains(event.target as Node)) {
    removeSummarizer()

    // unmount the event listener after removing
    document.removeEventListener('mousedown', handleSummarizerOutsideClick)
  }
}

/**
 * Replaces the stored selection text with the specified replacement text.
 */
function replaceStoredSelectedText(replacementText: string): void {
  if (storedInputElement && storedSelectionStart !== null && storedSelectionEnd !== null) {
    // Replace text in input or textarea
    const value = storedInputElement.value
    storedInputElement.value =
      value.slice(0, storedSelectionStart) + replacementText + value.slice(storedSelectionEnd)

    // Set the caret position after the replacement text
    const newCaretPosition = storedSelectionStart + replacementText.length
    storedInputElement.setSelectionRange(newCaretPosition, newCaretPosition)
  } else if (storedSelectionRange) {
    // Replace text in contentEditable element
    storedSelectionRange.deleteContents()
    storedSelectionRange.insertNode(document.createTextNode(replacementText))
  }
  // Clear stored selection
  storedSelectionRange = null
  storedSelectionStart = null
  storedSelectionEnd = null
  storedInputElement = null
}

/**
 * Retrieves the currently selected text.
 */
function getSelectedText(): string {
  if (storedInputElement && storedSelectionStart !== null && storedSelectionEnd !== null) {
    // Get selected text from input or textarea
    const value = storedInputElement.value
    return value.slice(storedSelectionStart, storedSelectionEnd)
  } else if (storedSelectionRange) {
    // Get selected text from contentEditable element
    return storedSelectionRange.toString()
  }
  return ''
}

/**
 * Detects if the element is an input or textarea.
 */
function isTextInput(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
}

/**
 * Gets the cursor position to place the popup container.
 */
function getCursorPositionForContentEditable(selection: Selection): { x: number; y: number } {
  let x = 0
  let y = 0

  // const selection = window.getSelection();
  if (selection && selection.rangeCount !== 0) {
    // Clone the range to avoid modifying the current selection
    const range = selection.getRangeAt(0).cloneRange()
    // const range = storedSelectionRange!.cloneRange();

    // Collapse the range to the start or end based on the selection direction
    const isBackward = isSelectionBackward(selection)
    range.collapse(isBackward) // collapse the range to the beginning or end of the current selection

    // Get the client rect of the collapsed range (caret position)
    const rects = range.getClientRects()
    if (rects.length > 0) {
      const rect = rects[0]
      x = rect.left + window.scrollX
      y = rect.top + window.scrollY
    }
  }

  return { x, y }
}

/**
 * Determines if the current selection is backward.
 */
function isSelectionBackward(selection: Selection): boolean {
  if (selection.anchorNode && selection.focusNode) {
    // if starting point and ending point of the selection exists
    const position = selection.anchorNode.compareDocumentPosition(selection.focusNode)
    if (position === Node.DOCUMENT_POSITION_PRECEDING) {
      // focusNode is earlier in the document
      return true
    } else if (position === Node.DOCUMENT_POSITION_FOLLOWING) {
      // anchorNode is earlier in the document
      return false
    } else {
      // nodes are in the same position
      return selection.anchorOffset > selection.focusOffset // true if selection is backward
    }
  }
  return false
}

/**
 * Gets the caret coordinates in an input or textarea element.
 */
function getCaretCoordinatesInInput(target: HTMLInputElement | HTMLTextAreaElement): {
  x: number
  y: number
} {
  const { selectionStart } = target
  const mirrorDiv = document.createElement('div')
  const computed = window.getComputedStyle(target)

  // Copy the style of the target input to the mirror div
  for (const prop of [
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
  ] as const) {
    mirrorDiv.style[prop] = computed[prop]
  }

  // Hide the mirror div and position it off-screen
  mirrorDiv.style.position = 'absolute'
  mirrorDiv.style.visibility = 'hidden'
  mirrorDiv.style.whiteSpace = 'pre-wrap'
  mirrorDiv.style.wordWrap = 'break-word'

  // Set the content of the mirror div
  mirrorDiv.textContent = target.value.substring(0, selectionStart!)

  // Append a marker to get the caret position
  const span = document.createElement('span')
  span.textContent = target.value.substring(selectionStart!)
  mirrorDiv.appendChild(span)

  document.body.appendChild(mirrorDiv)
  const { offsetLeft: x, offsetTop: y } = span
  document.body.removeChild(mirrorDiv)

  // Get the bounding rect of the target element
  const rect = target.getBoundingClientRect()
  return { x: rect.left + x, y: rect.top + y }
}

/**
 * Handles text selection to capture the selection details and show the popup container.
 */
function handleTextSelection(event: MouseEvent): void {
  const target = event.target as HTMLElement
    let redactifyEnabled = false;
    const currentUrl = window.location.href;
    const currentDomain = new URL(currentUrl).hostname; // Extract the domain name
    if (REDACTIFY_ENABLED_SITES.includes(currentDomain)) {
        redactifyEnabled = true;
    }

  if (isTextInput(target)) {
    const inputElement = target as HTMLInputElement | HTMLTextAreaElement
    if (inputElement.selectionStart !== inputElement.selectionEnd) {
      // Store selection for input or textarea
      storedInputElement = inputElement
      storedSelectionStart = inputElement.selectionStart
      storedSelectionEnd = inputElement.selectionEnd

      const { x, y } = getCaretCoordinatesInInput(inputElement)
      if (redactifyEnabled) {
        renderActionsToolbar(x, y, VISIBLE_BUTTONS.ALL)
      }else{
        renderActionsToolbar(x, y, VISIBLE_BUTTONS.REWRITE_AND_SUMMARIZE)
    }
    }
  } else if (target.isContentEditable) {
    const selection = window.getSelection() // Get the current selection
    if (selection && !selection.isCollapsed) {
      // Check if one or more characters are selected
      // Store selection for contentEditable element

      // Get selection range and clone it to avoid modifying the current selection
      // getRangeAt() doesn't support for shadow DOM
      storedSelectionRange = selection.getRangeAt(0).cloneRange()

      const { x, y } = getCursorPositionForContentEditable(selection)
    if (redactifyEnabled) {
        renderActionsToolbar(x, y, VISIBLE_BUTTONS.ALL)
      }else{
        renderActionsToolbar(x, y, VISIBLE_BUTTONS.REWRITE_AND_SUMMARIZE)
    }
    }
  }else {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {// 
      storedSelectionRange = selection.getRangeAt(0).cloneRange();
        const { x, y } = getCursorPositionForContentEditable(selection)
        renderActionsToolbar(x, y, VISIBLE_BUTTONS.SUMMARIZE_ONLY)
    }
    }
}

// Add event listener for text selection
// document.addEventListener('mouseup', handleTextSelection)
chrome.storage.sync.get(['disabledWebsites'], (result) => {
  const currentHostname = window.location.hostname // Get the hostname
  const disabledWebsites = result.disabledWebsites || []

  if (!disabledWebsites.includes(currentHostname)) {
    // Website is not disabled; enable the functionality
    console.log('running the IntelliWrite extension on this website')
    document.addEventListener('mouseup', handleTextSelection)
  }
})

// Listen for changes in the disabled list
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.disabledWebsites) {
    const currentHostname = window.location.hostname
    const disabledWebsites = changes.disabledWebsites.newValue || []

    if (disabledWebsites.includes(currentHostname)) {
      // Disable functionality if the website is in the disabled list
      console.log('disabling the IntelliWrite extension on this website')
      document.removeEventListener('mouseup', handleTextSelection)
    } else {
      // Enable functionality if the website is removed from the disabled list
      console.log('enabling the IntelliWrite extension on this website')
      document.addEventListener('mouseup', handleTextSelection)
    }
  }
})
