console.info('contentScript is running edited');

let storedSelectionRange: Range | null = null; // used when using contentEditable
let storedSelectionStart: number | null = null;
let storedSelectionEnd: number | null = null;
let storedInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;

let darkMode: boolean = false;

chrome.storage.sync.get(['darkMode'], (result) => {//TODO: add better name for darkMode
    console.log("dark mode storage sync")
    darkMode = result.darkMode;
    // // Use darkMode to conditionally render your HTML button
    // if (darkMode) {//get css class and set dark mode style
    //   // Render button with dark mode styling
    // } else {
    //   // Render button with light mode styling
    // }
});
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
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.darkMode) {
        darkMode = changes.darkMode.newValue;
        //   updateButtonAppearance(darkMode);
        console.log("dark mode status updated", darkMode)
    }
});
  
/**
 * Replaces the stored selection text with the specified replacement text.
 */
function replaceStoredSelectedText(replacementText: string): void {
    if (storedInputElement && storedSelectionStart !== null && storedSelectionEnd !== null) {
        // Replace text in input or textarea
        const value = storedInputElement.value;
        storedInputElement.value = value.slice(0, storedSelectionStart) + replacementText + value.slice(storedSelectionEnd);

        // Set the caret position after the replacement text
        const newCaretPosition = storedSelectionStart + replacementText.length;
        storedInputElement.setSelectionRange(newCaretPosition, newCaretPosition);
    } else if (storedSelectionRange) {
        // Replace text in contentEditable element
        storedSelectionRange.deleteContents();
        storedSelectionRange.insertNode(document.createTextNode(replacementText));
    }
    // Clear stored selection
    storedSelectionRange = null;
    storedSelectionStart = null;
    storedSelectionEnd = null;
    storedInputElement = null;
}

/**
 * Retrieves the currently selected text.
 */
function getSelectedText(): string {
    if (storedInputElement && storedSelectionStart !== null && storedSelectionEnd !== null) {
        // Get selected text from input or textarea
        const value = storedInputElement.value;
        return value.slice(storedSelectionStart, storedSelectionEnd);
    } else if (storedSelectionRange) {
        // Get selected text from contentEditable element
        return storedSelectionRange.toString();
    }
    return '';
}

/**
 * Styles and positions the popup container to be more user-friendly.
 */
function showPopupContainer(x: number, y: number): void {
    // Create container div
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';

    // Style the container
    popupContainer.style.position = 'absolute';
    popupContainer.style.zIndex = '10000';
    popupContainer.style.display = 'flex';
    popupContainer.style.flexDirection = 'row';

    if (darkMode) {
        popupContainer.style.backgroundColor = '#000000';
        popupContainer.style.color = '#ffffff';
    }else {
        popupContainer.style.backgroundColor = '#ffffff';
        popupContainer.style.color = '#000000';
    }

    // popupContainer.style.backgroundColor = '#ffffff';
    popupContainer.style.border = '1px solid #ccc';
    popupContainer.style.borderRadius = '3px';
    popupContainer.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
    popupContainer.style.padding = '5px';

    // Position the container
    positionPopup(popupContainer, x, y);

    // Create the "Rewrite" button
    const rewriteButton = document.createElement('button');
    rewriteButton.textContent = 'Rewrite';
    rewriteButton.className = 'rewrite-button';

    // Style the "Rewrite" button
    styleButton(rewriteButton, '#007bff', '#0056b3');

    // Append the "Rewrite" button to the container
    popupContainer.appendChild(rewriteButton);

    // Create the "Redact" button
    const redactButton = document.createElement('button');
    redactButton.textContent = 'Redact';
    redactButton.className = 'redact-button';

    // Style the "Redact" button
    styleButton(redactButton, '#28a745', '#218838');

    // Add some spacing between buttons
    redactButton.style.marginLeft = '5px';

    // Append the "Redact" button to the container
    popupContainer.appendChild(redactButton);

    // Function to remove the popup container and event listeners
    const removePopupContainer = () => {
        if (popupContainer && popupContainer.parentNode) {
            popupContainer.parentNode.removeChild(popupContainer);
            document.removeEventListener('mousedown', clickOutsideHandler);
        }
    };

    // Add event listener for the "Rewrite" button
    rewriteButton.addEventListener('click', async () => {
        const selectedText = getSelectedText();
        if (selectedText !== '') {
            // Replace buttons with loading animation
            popupContainer.innerHTML = ''; // Remove all children
            const loadingAnimation = createLoadingAnimation();
            popupContainer.appendChild(loadingAnimation);

            const prompt = `${selectedText}`;
            console.log("sending prompt")
            chrome.runtime.sendMessage({ action: 'REWRITE', data: prompt }, (response) => {
                const replacementText = response.result;
                replaceStoredSelectedText(replacementText);
                removePopupContainer(); // Remove popupContainer after response is handled
            });
        } else {
            removePopupContainer();
        }
    });

    // Add event listener for the "Redact" button
    redactButton.addEventListener('click', async () => {
        const selectedText = getSelectedText();
        if (selectedText !== '') {
            // Replace buttons with loading animation
            popupContainer.innerHTML = ''; // Remove all children
            const loadingAnimation = createLoadingAnimation();
            popupContainer.appendChild(loadingAnimation);

            const prompt = `${selectedText}`;
            chrome.runtime.sendMessage({ action: 'REDACTIFY', data: prompt }, (response) => {
                const replacementText = response.result;
                replaceStoredSelectedText(replacementText);
                removePopupContainer(); // Remove popupContainer after response is handled
            });
        } else {
            removePopupContainer();
        }
    });

    // Append the container to the body
    document.body.appendChild(popupContainer);

    // Handler function to remove the popup container when clicking outside of it
    const clickOutsideHandler = (event: MouseEvent) => {
        if (!popupContainer.contains(event.target as Node)) {
            console.log("clicked outside, removing popup");
            removePopupContainer();
        }
    };

    // Add outside click event listener
    document.addEventListener('mousedown', clickOutsideHandler);
}

/**
 * Styles individual buttons to maintain consistency.
 */
function styleButton(button: HTMLElement, backgroundColor: string, hoverColor: string): void {
    button.style.padding = '8px 12px';
    button.style.backgroundColor = backgroundColor;
    button.style.color = '#ffffff';
    button.style.border = 'none';
    button.style.borderRadius = '3px';
    button.style.fontSize = '14px';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.3s ease';

    // Add hover effect
    button.onmouseover = () => {
        button.style.backgroundColor = hoverColor;
    };
    button.onmouseout = () => {
        button.style.backgroundColor = backgroundColor;
    };
}

/**
 * Creates and returns a loading animation element.
 */
let spinnerStylesAdded = false;

function createLoadingAnimation(): HTMLElement {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    // Style the spinner directly
    spinner.style.width = '24px';
    spinner.style.height = '24px';
    spinner.style.border = '4px solid rgba(0,0,0,0.1)';
    spinner.style.borderLeftColor = '#007bff';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';

    // Add keyframes for spin animation only once
    if (!spinnerStylesAdded) {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        `;
        document.head.appendChild(styleElement);
        spinnerStylesAdded = true;
    }

    return spinner;
}


/**
 * Detects if the element is an input or textarea.
 */
function isTextInput(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

/**
 * Gets the cursor position to place the popup container.
 */
function getCursorPositionForContentEditable(selection: Selection): { x: number; y: number } {
    let x = 0;
    let y = 0;

    // const selection = window.getSelection();
    if (selection && selection.rangeCount !== 0) {
        // Clone the range to avoid modifying the current selection
        const range = selection.getRangeAt(0).cloneRange();
        // const range = storedSelectionRange!.cloneRange();

        // Collapse the range to the start or end based on the selection direction
        const isBackward = isSelectionBackward(selection);
        range.collapse(isBackward);// collapse the range to the beginning or end of the current selection

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
    if (selection.anchorNode && selection.focusNode) { // if starting point and ending point of the selection exists
        const position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
        if (position === Node.DOCUMENT_POSITION_PRECEDING) { // focusNode is earlier in the document
            return true;
        } else if (position === Node.DOCUMENT_POSITION_FOLLOWING) { // anchorNode is earlier in the document
            return false;
        } else {// nodes are in the same position
            return selection.anchorOffset > selection.focusOffset; // true if selection is backward
        }
    }
    return false;
}

/**
 * Gets the caret coordinates in an input or textarea element.
 */
function getCaretCoordinatesInInput(target: HTMLInputElement | HTMLTextAreaElement): { x: number; y: number } {
    const { selectionStart } = target;
    const mirrorDiv = document.createElement('div');
    const computed = window.getComputedStyle(target);

    // Copy the style of the target input to the mirror div
    for (const prop of [
        'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
        'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
        'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing'
    ] as const) {
        mirrorDiv.style[prop] = computed[prop];
    }

    // Hide the mirror div and position it off-screen
    mirrorDiv.style.position = 'absolute';
    mirrorDiv.style.visibility = 'hidden';
    mirrorDiv.style.whiteSpace = 'pre-wrap';
    mirrorDiv.style.wordWrap = 'break-word';

    // Set the content of the mirror div
    mirrorDiv.textContent = target.value.substring(0, selectionStart!);

    // Append a marker to get the caret position
    const span = document.createElement('span');
    span.textContent = target.value.substring(selectionStart!);
    mirrorDiv.appendChild(span);

    document.body.appendChild(mirrorDiv);
    const { offsetLeft: x, offsetTop: y } = span;
    document.body.removeChild(mirrorDiv);

    // Get the bounding rect of the target element
    const rect = target.getBoundingClientRect();
    return { x: rect.left + x, y: rect.top + y };
}

/**
 * Handles text selection to capture the selection details and show the popup container.
 */
function handleTextSelection(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (isTextInput(target)) {
        const inputElement = target as HTMLInputElement | HTMLTextAreaElement;
        if (inputElement.selectionStart !== inputElement.selectionEnd) {
            // Store selection for input or textarea
            storedInputElement = inputElement;
            storedSelectionStart = inputElement.selectionStart;
            storedSelectionEnd = inputElement.selectionEnd;

            const { x, y } = getCaretCoordinatesInInput(inputElement);
            showPopupContainer(x, y);
        }
    } else if (target.isContentEditable) {
        const selection = window.getSelection(); // Get the current selection
        if (selection && !selection.isCollapsed) { // Check if one or more characters are selected
            // Store selection for contentEditable element

            // Get selection range and clone it to avoid modifying the current selection
            // getRangeAt() doesn't support for shadow DOM
            storedSelectionRange = selection.getRangeAt(0).cloneRange();

            const { x, y } = getCursorPositionForContentEditable(selection);
            showPopupContainer(x, y);
        }
    }
}

/**
 * Positions the popup container at the specified coordinates.
 */
function positionPopup(container: HTMLElement, x: number, y: number): void {
    container.style.left = `${x}px`;
    container.style.top = `${y - container.offsetHeight - 50}px`; // Adjust as needed //50px here makes the popup appear above the selected text TODO: make this dynamic from text size
    container.style.zIndex = '10000'; // Ensure it's on top
}

// Add event listener for text selection
document.addEventListener('mouseup', handleTextSelection);
