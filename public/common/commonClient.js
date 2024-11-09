import syllaDobble_modals from './modalsData/syllaDobbleModals.json' with {type: "json"}

export function openModal(modalJSONId) {
    let baseModalHtml = _.find(syllaDobble_modals, { id: 'modal_baseHtml' });
    let modalData = _.find(syllaDobble_modals, { id: modalJSONId });

    let modalHtml = _.get(baseModalHtml, 'body');

    modalHtml = _.replace(modalHtml, '##TitleText##', _.get(modalData, 'title'))
    modalHtml = _.replace(modalHtml, '##BodyText##', _.get(modalData, 'bodyText'))
    let modalElement = document.getElementById("modal_tutorial")
    modalElement.innerHTML = modalHtml;
    modalElement.style.display = "block";
}