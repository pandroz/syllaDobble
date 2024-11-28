let elementToSync = null;

let formatStates = {
    bold: false,
    italic: false,
    underline: false
};


export function toggleFormat(type, elementToSyncId) {
    elementToSync = elementToSyncId;
    formatStates = getCardFormatStates();

    let format = `.format-btn-${type.charAt(0)}`;

    // Update button active state
    const btn = document.querySelector(format);
    btn.classList.toggle('activeFormat');

    // Toggle the state
    formatStates[type] = !formatStates[type];

    // Apply formatting
    applyFormatting();
}

export function applyFormatting() {
    // Reset styles
    elementToSync.classList.toggle('bold', formatStates.bold);
    elementToSync.classList.toggle('italic', formatStates.italic);
    elementToSync.classList.toggle('underline', formatStates.underline);

}

export function getCardFormatStates() {
    let formatStates = {};
    formatStates['bold'] = elementToSync.classList.contains('bold');
    formatStates['italic'] = elementToSync.classList.contains('italic');
    formatStates['underline'] = elementToSync.classList.contains('underline');
    return formatStates;
}

export function cleanFormatStates() {
    formatStates['bold'] = false;
    let formatB = document.getElementById('boldBtn');
    formatB.classList.remove('activeFormat');

    formatStates['italic'] = false;
    let formatI = document.getElementById('italicBtn');
    formatI.classList.remove('activeFormat');

    formatStates['underline'] = false;
    let formatU = document.getElementById('underlineBtn');
    formatU.classList.remove('activeFormat');
}