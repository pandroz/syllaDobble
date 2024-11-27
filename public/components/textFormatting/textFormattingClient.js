let elementToSync = null;

const formatStates = {
    bold: false,
    italic: false,
    underline: false
};


export function toggleFormat(type, elementToSyncId) {
    elementToSync = elementToSyncId;
    // Toggle the state
    formatStates[type] = !formatStates[type];

    // Update button active state
    const btn = document.querySelector(`.format-btn-${type.charAt(0)}`);
    btn.classList.toggle('activeFormat', formatStates[type]);

    // Apply formatting
    applyFormatting();
}

export function applyFormatting() {
    // Reset styles
    elementToSync.classList.toggle('bold', formatStates.bold);
    elementToSync.classList.toggle('italic', formatStates.italic);
    elementToSync.classList.toggle('underline', formatStates.underline);

}