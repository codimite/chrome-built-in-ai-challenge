
import {
  MESSAGE_ACTIONS,
  VISIBLE_BUTTONS,
  VisibleButtons,
  REDACTIFY_ENABLED_SITES,
} from '../constants';

import {
  isTextInput,
  clearSelectionState,
  getCursorPositionForContentEditable,
  getCaretCoordinatesInInput,
  storeSelectionState,
} from './utils/selectionUtils';

import {
  renderActionsToolbar,
} from './utils/uiUtils';

console.info('Content script is running');

/**
 * Helper function to check if the redactify feature should be enabled for the current site.
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
    if (inputElement.selectionStart !== inputElement.selectionEnd) { // Input field or textarea selected 
      clearSelectionState();
      // Store selection for input or textarea
      storeSelectionState({
        inputElement: inputElement,
        selectionStart: inputElement.selectionStart,
        selectionEnd: inputElement.selectionEnd,
        selectionRange: null,
      });

      const { x, y } = getCaretCoordinatesInInput(inputElement);
      const visibleButtons = redactifyEnabled
        ? VISIBLE_BUTTONS.ALL
        : VISIBLE_BUTTONS.REWRITE_AND_SUMMARIZE;
      renderActionsToolbar(x, y, visibleButtons);
    }
  } else if (target.isContentEditable) {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) { // ContentEditable element selected
      clearSelectionState();
      // Store selection for contentEditable element
      storeSelectionState({
        selectionRange: selection.getRangeAt(0).cloneRange(),
        inputElement: null,
        selectionStart: null,
        selectionEnd: null,
      });

      const { x, y } = getCursorPositionForContentEditable(selection);
      const visibleButtons = redactifyEnabled
        ? VISIBLE_BUTTONS.ALL
        : VISIBLE_BUTTONS.REWRITE_AND_SUMMARIZE;
      renderActionsToolbar(x, y, visibleButtons);
    }
  } else {
    // Handle text selection in regular text (non-input, non-contentEditable)
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) { // Regular text selected
      clearSelectionState();
      storeSelectionState({
        selectionRange: selection.getRangeAt(0).cloneRange(),
        inputElement: null,
        selectionStart: null,
        selectionEnd: null,
      });

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
