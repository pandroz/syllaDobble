window.onclick = function (event) {
    let allModals = Array.from(document.querySelectorAll('[id^="modal_"]'));
    _.each(allModals, modal => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}

export function openAccordion(elem) {
    elem.classList.toggle("active");
    var panel = elem.nextElementSibling;
    if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
    } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
    }
}