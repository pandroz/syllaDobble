/**
 * Updates the displayed value of a slider element
 * @param {Element} sliderElement - The html element of the slider
 */
export function updateInputValue(sliderElement) {
    document.getElementById(sliderElement.id + 'sliderValue').value = sliderElement.value;
}

export function updateSliderValue(inputElement, sliderElement) {
    sliderElement.value = inputElement.value;
}