// Interface for storing selection state
export interface SelectionState {
    selectionRange: Range | null; // For contentEditable elements
    selectionStart: number | null; // For input or textarea elements
    selectionEnd: number | null;
    inputElement: HTMLInputElement | HTMLTextAreaElement | null;
  }
  
  // Initialize selection state
  export let selectionState: SelectionState = {
    selectionRange: null,
    selectionStart: null,
    selectionEnd: null,
    inputElement: null,
  };
  
  /**
   * Stores the selection state.
   */
  export function storeSelectionState(state: SelectionState): void {
    selectionState = state;
  }
  
  /**
   * Determines if the given element is an input or textarea element.
   */
  export function isTextInput(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
  }
  
  /**
   * Retrieves the currently selected text based on the stored selection state.
   */
  export function getSelectedText(): string {
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
  export function replaceSelectedText(replacementText: string): void {
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
  export function clearSelectionState(): void {
    selectionState.selectionRange = null;
    selectionState.selectionStart = null;
    selectionState.selectionEnd = null;
    selectionState.inputElement = null;
  }
  
  /**
   * Gets the cursor position for contentEditable elements.
   */
  export function getCursorPositionForContentEditable(selection: Selection): { x: number; y: number } {
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
  export function isSelectionBackward(selection: Selection): boolean {
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
  export function getCaretCoordinatesInInput(
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
  