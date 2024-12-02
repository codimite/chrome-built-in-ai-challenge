// Import necessary modules and components
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import ActionsToolbar from './components/ActionsToolbar';
import SummarizerBlock from './components/SummarizerBlock';
import {
  MESSAGE_ACTIONS,
  REDACTIFY_ENABLED_SITES,
  VISIBLE_BUTTONS,
  VisibleButtons,
} from '../constants';

console.info('Content script is running');

// Interface for storing selection state
interface SelectionState {
  selectionRange: Range | null; // For contentEditable elements
  selectionStart: number | null; // For input or textarea elements
  selectionEnd: number | null;
  inputElement: HTMLInputElement | HTMLTextAreaElement | null;
}

// Initialize selection state
let selectionState: SelectionState = {
  selectionRange: null,
  selectionStart: null,
  selectionEnd: null,
  inputElement: null,
};

/**
 * Utility functions for selection handling
 */

/**
 * Determines if the given element is an input or textarea element.
 */
function isTextInput(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

/**
 * Retrieves the currently selected text based on the stored selection state.
 */
function getSelectedText(): string {
  const { selectionRange, selectionStart, selectionEnd, inputElement } = selectionState;

  if (inputElement && selectionStart !== null && selectionEnd !== null) {
    // Get selected text from input or textarea
    const value = inputElement.value;
    return value.slice(selectionStart, selectionEnd);
  } else if (selectionRange) {
    // Get selected text from contentEditable element
    return selectionRange.toString();
  }
  return '';
}

/**
 * Replaces the stored selected text with the specified replacement text.
 */
function replaceSelectedText(replacementText: string): void {
  const { selectionRange, selectionStart, selectionEnd, inputElement } = selectionState;

  if (inputElement && selectionStart !== null && selectionEnd !== null) {
    // Replace text in input or textarea
    const value = inputElement.value;
    inputElement.value =
      value.slice(0, selectionStart) + replacementText + value.slice(selectionEnd);

    // Set the caret position after the replacement text
    const newCaretPosition = selectionStart + replacementText.length;
    inputElement.setSelectionRange(newCaretPosition, newCaretPosition);
  } else if (selectionRange) {
    // Replace text in contentEditable element
    selectionRange.deleteContents();
    selectionRange.insertNode(document.createTextNode(replacementText));
  }

  // Clear stored selection
  clearSelectionState();
}

/**
 * Clears the stored selection state.
 */
function clearSelectionState(): void {
  selectionState.selectionRange = null;
  selectionState.selectionStart = null;
  selectionState.selectionEnd = null;
  selectionState.inputElement = null;
}

/**
 * Gets the cursor position for contentEditable elements.
 */
function getCursorPositionForContentEditable(selection: Selection): { x: number; y: number } {
  let x = 0;
  let y = 0;

  if (selection && selection.rangeCount !== 0) {
    // Clone the range to avoid modifying the current selection
    const range = selection.getRangeAt(0).cloneRange();

    // Collapse the range to the start or end based on the selection direction
    const isBackward = isSelectionBackward(selection);
    range.collapse(isBackward);

    // Get the client rect of the collapsed range (caret position)
    const rects = range.getClientRects();
    if (rects.length > 0) {
      const rect = rects[0];
      x = rect.left + window.scrollX;
      y = rect.top + window.scrollY;
    }
  }

  return { x, y };
}

/**
 * Determines if the current selection is backward.
 */
function isSelectionBackward(selection: Selection): boolean {
  if (selection.anchorNode && selection.focusNode) {
    const position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
    if (position === Node.DOCUMENT_POSITION_PRECEDING) {
      // focusNode is earlier in the document
      return true;
    } else if (position === Node.DOCUMENT_POSITION_FOLLOWING) {
      // anchorNode is earlier in the document
      return false;
    } else {
      // nodes are in the same position
      return selection.anchorOffset > selection.focusOffset;
    }
  }
  return false;
}

/**
 * Gets the caret coordinates in an input or textarea element.
 */
function getCaretCoordinatesInInput(
  element: HTMLInputElement | HTMLTextAreaElement
): { x: number; y: number } {
  const { selectionStart } = element;
  const mirrorDiv = document.createElement('div');
  const computedStyle = window.getComputedStyle(element);

  // Copy the style of the target input to the mirror div
  const properties = [
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
  ] as const;

  properties.forEach((prop) => {
    mirrorDiv.style[prop] = computedStyle[prop];
  });

  // Hide the mirror div and position it off-screen
  mirrorDiv.style.position = 'absolute';
  mirrorDiv.style.visibility = 'hidden';
  mirrorDiv.style.whiteSpace = 'pre-wrap';
  mirrorDiv.style.wordWrap = 'break-word';

  // Set the content of the mirror div
  mirrorDiv.textContent = element.value.substring(0, selectionStart!);

  // Append a marker to get the caret position
  const span = document.createElement('span');
  span.textContent = element.value.substring(selectionStart!);
  mirrorDiv.appendChild(span);

  document.body.appendChild(mirrorDiv);
  const { offsetLeft: x, offsetTop: y } = span;
  document.body.removeChild(mirrorDiv);

  // Get the bounding rect of the target element
  const rect = element.getBoundingClientRect();
  return { x: rect.left + x, y: rect.top + y };
}

/**
 * UI rendering functions
 */

/**
 * Renders the ActionsToolbar component at the specified coordinates.
 */
function renderActionsToolbar(
  x: number,
  y: number,
  visibleButtons: VisibleButtons
): void {
  let toolbarContainer = document.getElementById('toolbar-container');
  if (!toolbarContainer) {
    toolbarContainer = document.createElement('div');
    toolbarContainer.id = 'toolbar-container';
    document.body.appendChild(toolbarContainer);
  }

  toolbarContainer.style.position = 'absolute';
  toolbarContainer.style.left = `${x}px`;
  toolbarContainer.style.top = `${y}px`;
  toolbarContainer.style.zIndex = '1000';

  // Create a shadow root
  const shadowRoot = toolbarContainer.attachShadow({ mode: 'open' });

  // Create a container for React content in shadow DOM
  const shadowContent = document.createElement('div');
  shadowRoot.appendChild(shadowContent);

  const root = createRoot(shadowContent);

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
      />
    </MantineProvider>
  );

  // Detect clicks outside the toolbar
  document.addEventListener('mousedown', handleToolbarOutsideClick);
}

/**
 * Renders the SummarizerBlock component at the specified coordinates.
 */
function renderSummarizerBlock(
  x: number,
  y: number,
  summarizedText: string
): void {
  let summarizerContainer = document.getElementById('summarizer-container');
  if (!summarizerContainer) {
    summarizerContainer = document.createElement('div');
    summarizerContainer.id = 'summarizer-container';
    document.body.appendChild(summarizerContainer);
  }

  summarizerContainer.style.position = 'absolute';
  summarizerContainer.style.left = `${x}px`;
  summarizerContainer.style.top = `${y}px`;
  summarizerContainer.style.zIndex = '1000';

  // Create a shadow root
  const shadowRoot = summarizerContainer.attachShadow({ mode: 'open' });

  // Create a container for React content in shadow DOM
  const shadowContent = document.createElement('div');
  shadowRoot.appendChild(shadowContent);

  const root = createRoot(shadowContent);

  root.render(
    <MantineProvider
      cssVariablesSelector=":host"
      withCssVariables={true}
      getRootElement={() => summarizerContainer}
      withStaticClasses={false}
      withGlobalClasses={false}
    >
      <SummarizerBlock
        onClose={removeSummarizer}
        summarizedText={summarizedText}
      />
    </MantineProvider>
  );

  // Detect clicks outside the summarizer block
  document.addEventListener('mousedown', handleSummarizerOutsideClick);
}

/**
 * Removes the toolbar from the view.
 */
function removeToolbar(): void {
  const toolbarContainer = document.getElementById('toolbar-container');
  if (toolbarContainer) {
    toolbarContainer.remove();
  }
  // Remove the event listener
  document.removeEventListener('mousedown', handleToolbarOutsideClick);
}

/**
 * Removes the summarizer block from the view.
 */
function removeSummarizer(): void {
  const summarizerContainer = document.getElementById('summarizer-container');
  if (summarizerContainer) {
    summarizerContainer.remove();
  }
  // Remove the event listener
  document.removeEventListener('mousedown', handleSummarizerOutsideClick);
}

/**
 * Handles clicks outside the toolbar to remove it.
 */
function handleToolbarOutsideClick(event: MouseEvent): void {
  const toolbarContainer = document.getElementById('toolbar-container');
  if (toolbarContainer && !toolbarContainer.contains(event.target as Node)) {
    removeToolbar();
  }
}

/**
 * Handles clicks outside the summarizer block to remove it.
 */
function handleSummarizerOutsideClick(event: MouseEvent): void {
  const summarizerContainer = document.getElementById('summarizer-container');
  if (summarizerContainer && !summarizerContainer.contains(event.target as Node)) {
    removeSummarizer();
  }
}

/**
 * Action handling functions
 */

/**
 * Handles the summarize action.
 */
function handleSummarize(x: number, y: number): Promise<void> {
  const selectedText = getSelectedText();

  if (selectedText !== '') {
    const prompt = selectedText;
    console.log(`Sending "${prompt}" as the selected text for summarization.`);

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: MESSAGE_ACTIONS.SUMMARIZE, data: prompt },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            let summarizedText = response.result;
            console.log(`Received summarized text: "${summarizedText}"`);

            summarizedText = summarizedText.replace(/\*/g, ''); // Remove asterisks

            renderSummarizerBlock(x, y + 35, summarizedText);
            resolve();
          }
        }
      );
    });
  } else {
    removeToolbar();
    return Promise.resolve();
  }
}

/**
 * Handles the rewrite action.
 */
function handleRewrite(): Promise<void> {
  const selectedText = getSelectedText();

  if (selectedText !== '') {
    const prompt = selectedText;
    console.log(`Sending "${prompt}" as the selected text for rewriting.`);

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: MESSAGE_ACTIONS.REWRITE, data: prompt },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            const replacementText = response.result;
            console.log(`Received rewritten text: "${replacementText}"`);

            replaceSelectedText(replacementText);
            resolve();
          }
        }
      );
    });
  } else {
    removeToolbar();
    return Promise.resolve();
  }
}

/**
 * Handles the redact action.
 */
function handleRedact(): Promise<void> {
  const selectedText = getSelectedText();

  if (selectedText !== '') {
    const prompt = selectedText;
    console.log(`Sending "${prompt}" as the selected text for redaction.`);

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: MESSAGE_ACTIONS.REDACTIFY, data: prompt },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            const replacementText = response.result;
            console.log(`Received redacted text: "${replacementText}"`);

            replaceSelectedText(replacementText);
            resolve();
          }
        }
      );
    });
  } else {
    removeToolbar();
    return Promise.resolve();
  }
}

/**
 * Helper function to check if the redactify feature is enabled for the current site.
 */
function isRedactifyEnabled(): boolean {
  const currentUrl = window.location.href;
  const currentDomain = new URL(currentUrl).hostname;
  return REDACTIFY_ENABLED_SITES.includes(currentDomain);
}

/**
 * Handles text selection to capture the selection details and show the toolbar.
 */
function handleTextSelection(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  const redactifyEnabled = isRedactifyEnabled();

  if (isTextInput(target)) {
    const inputElement = target;
    if (inputElement.selectionStart !== inputElement.selectionEnd) {
        clearSelectionState();
      // Store selection for input or textarea
      selectionState.inputElement = inputElement;
      selectionState.selectionStart = inputElement.selectionStart;
      selectionState.selectionEnd = inputElement.selectionEnd;

      const { x, y } = getCaretCoordinatesInInput(inputElement);
      const visibleButtons = redactifyEnabled
        ? VISIBLE_BUTTONS.ALL
        : VISIBLE_BUTTONS.REWRITE_AND_SUMMARIZE;
      renderActionsToolbar(x, y, visibleButtons);
    }
  } else if (target.isContentEditable) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        clearSelectionState();
      // Store selection for contentEditable element
      selectionState.selectionRange = selection.getRangeAt(0).cloneRange();

      const { x, y } = getCursorPositionForContentEditable(selection);
      const visibleButtons = redactifyEnabled
        ? VISIBLE_BUTTONS.ALL
        : VISIBLE_BUTTONS.REWRITE_AND_SUMMARIZE;
      renderActionsToolbar(x, y, visibleButtons);
    }
  } else {
    // Handle text selection in regular text (non-input, non-contentEditable)
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
        clearSelectionState();
      selectionState.selectionRange = selection.getRangeAt(0).cloneRange();

      const { x, y } = getCursorPositionForContentEditable(selection);
      renderActionsToolbar(x, y, VISIBLE_BUTTONS.SUMMARIZE_ONLY);
    }
  }
}

/**
 * Initialization and event listeners
 */

// Check if the current website is disabled
chrome.storage.sync.get(['disabledWebsites'], (result) => {
  const currentHostname = window.location.hostname; // Get the hostname
  const disabledWebsites = result.disabledWebsites || [];

  if (!disabledWebsites.includes(currentHostname)) {
    // Website is not disabled; enable the functionality
    console.log('IntelliWrite extension is enabled on this website');
    document.addEventListener('mouseup', handleTextSelection);
  }
});

// Listen for changes in the disabled websites list
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.disabledWebsites) {
    const currentHostname = window.location.hostname;
    const disabledWebsites = changes.disabledWebsites.newValue || [];

    if (disabledWebsites.includes(currentHostname)) {
      // Disable functionality if the website is in the disabled list
      console.log('IntelliWrite extension is disabled on this website');
      document.removeEventListener('mouseup', handleTextSelection);
    } else {
      // Enable functionality if the website is removed from the disabled list
      console.log('IntelliWrite extension is enabled on this website');
      document.addEventListener('mouseup', handleTextSelection);
    }
  }
});