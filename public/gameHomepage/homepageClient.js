import * as common from '../common/commonClient.js'
let CARDS = [];
let isEditingCard = false;
let editingCardId = '';

function uniqueID(prefix) {
    prefix = prefix || '';
    return prefix + Math.floor(Math.random() * Date.now())
}

export function getValues() {
    let fields = $(":input").serializeArray();
    let cardData = {};
    _.each(fields, d => {
        let js = {};
        js[_.get(d, 'name')] = _.get(d, 'value');
        _.assign(cardData, js);
    })
    // console.log(cardData);
    return cardData;
}

export function loadCard(cardData, isNewCard) {
    isEditingCard = false;
    editingCardId = null;

    let cardUUID = '';

    if (isNewCard) {
        cardData = getValues();
        cardUUID = uniqueID('card_');
        _.assign(cardData, {
            cardId: cardUUID
        });
        CARDS.push(cardData);
    } else {
        cardUUID = _.get(cardData, 'cardId');
        let cardIx = _.findIndex(CARDS, c => {
            return _.get(c, 'cardId') === cardUUID;
        });
        if (cardIx === -1)
            CARDS.push(cardData);
        else
            CARDS[cardIx] = cardData;
    }

    let cardsHTML = [];

    _.each(CARDS, card => {
        let cardId = _.get(card, 'cardId');
        let cardBg = _.get(card, 'cardBg');
        let cardBorder = _.get(card, 'cardBorder');
        let cardGlobalTextCol = _.get(card, 'cardGlobalTextCol');

        let isCardGlobalTextCol = cardGlobalTextCol !== '#000000';

        cardsHTML.push(`<div class="cardContainer" id="container_${cardId}">
            <button id="editCard_${cardId}" class="groupingButton no-print" onclick="client.allowEditing(${cardId}, editCard_${cardId}, saveCard_${cardId})"><i class="fa-solid fa-pencil"></i></button>
            <button id="saveCard_${cardId}" class="groupingButton no-print hidden blackFont" onclick="client.updateCard(${cardId}, editCard_${cardId}, saveCard_${cardId})" ><i class="fa-regular fa-floppy-disk"></i></button>
            <button id="deleteCard_${cardId}" class="groupingButton no-print" onclick="client.removeCard(${cardId}.id, container_${cardId})"><i class="fas fa-times btn-delete"></i></button>
            <div class="card" style="background-color: ${cardBg} !important; border-color: ${cardBorder}; color: ${cardGlobalTextCol}" id="${cardId}">
                <div class="cardRowTop">
                    <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(card, 'colTopL')}">${_.get(card, 'inTopRowL', '')}</div>
                    <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(card, 'colTopM')}">${_.get(card, 'inTopRowM', '')}</div>
                    <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(card, 'colTopR')}">${_.get(card, 'inTopRowR', '')}</div>
                </div>

                <div class="cardRowMid">
                    <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(card, 'colMidL')}">${_.get(card, 'inMidRowL', '')}</div>
                    <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(card, 'colMidM')}">${_.get(card, 'inMidRowM', '')}</div>
                    <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(card, 'colMidR')}">${_.get(card, 'inMidRowR', '')}</div>
                </div>

                <div class="cardRowBottom">
                    <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(card, 'colBotL')}">${_.get(card, 'inBotRowL', '')}</div>
                    <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(card, 'colBotM')}">${_.get(card, 'inBotRowM', '')}</div>
                    <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(card, 'colBotR')}">${_.get(card, 'inBotRowR', '')}</div>
                </div>
            </div>
        </div>`)
    });

    cardsHTML = _.reverse(cardsHTML);
    
    let paddingHtml = '<div class="cardsSectPad">&nbsp;</div>'
    cardsHTML.push(paddingHtml);

    document.getElementById("cardsSectId").innerHTML = _.join(cardsHTML, '\n');

    let cardKeys = _.keys(cardData)
    clearTemplate(cardKeys);
}

export function removeCard(cardId, element) {
    if (isEditingCard && cardId !== editingCardId) {
        common.onerror('<i class="fa-solid fa-triangle-exclamation"></i> Non possono essere eliminate altre carte mentre una carta viene modificata.<br/>Terminare la modifica prima di cancellare altre carte.');
        return;
    }

    CARDS = _.filter(CARDS, c => {
        return _.get(c, 'cardId') !== cardId;
    });
    element.remove();

    isEditingCard = false;
    editingCardId = null;
}

export function resetGlobals() {
    let cardGlobalTextCol = document.getElementById('cardGlobalTextCol');
    cardGlobalTextCol.value = "#000000";

    let cardBg = document.getElementById('cardBg');
    cardBg.value = "#FFFFFF";

    let cardBorder = document.getElementById('cardBorder');
    cardBorder.value = "#000000";

    let templateCard = document.getElementById('templateCard');
    let previewCard = document.getElementById('previewCard');

    templateCard.style.backgroundColor = 'transparent';
    templateCard.style.borderColor = "#000000";
    previewCard.style.backgroundColor = 'transparent';
    previewCard.style.borderColor = "#000000";
}

export function stampaPagine() {
    if (_.size(CARDS) < 1) {
        common.onerror('<i class="fa-solid fa-triangle-exclamation"></i> Non è possibile stampare senza carte create')
        return;
    }
    if(isEditingCard) {
        common.onerror('<i class="fa-solid fa-triangle-exclamation"></i> Non é possibile stampare mentre una carta viene modificata.<br/>Terminare la modifica prima di stampare.')
        return;
    }
    window.print();
}

export function saveCards() {
    if (_.size(CARDS) < 1) {
        common.onerror('<i class="fa-solid fa-triangle-exclamation"></i> Non è possibile salvare senza carte create')
        return 1;
    }
    let date = new Date();
    let fileName = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}_${date.getHours()}${date.getMinutes()}${date.getSeconds()}_carte`;
    download(fileName, JSON.stringify(CARDS, null, 4));
}

export function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

export function uploadCards(inputFile) {
    let file = _.head(_.get(inputFile, 'files'))
    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function () {
        let jsonCardsData = JSON.parse(_.get(reader, 'result'));
        _.each(jsonCardsData, card => {
            loadCard(card, false);
        })
    };

    document.getElementById(inputFile.id).value = "";
}

export function clearTemplate(cardKeys) {
    // Resetting global values
    resetGlobals();

    // Resetting values inside the card
    _.each(cardKeys, key => {
        if (!_.includes(['cardBg', 'cardBorder', 'cardGlobalTextCol'], key)) {
            let element = document.getElementById(key);
            let prevElement = document.getElementById('prev' + _.replace(_.replace(key, 'in', ''), 'Row', ''));
            if (_.startsWith(key, 'in')) {
                element.value = '';
                prevElement.innerHTML = '';
            } else if (_.startsWith(key, 'col')) {
                element.value = '#000000';
            }
        }
    });
}

export function updatePrevCard(element) {
    let elementId = element.id;
    let templateCard = document.getElementById('templateCard')
    let previewCard = document.getElementById('previewCard')
    switch (elementId) {
        case 'cardBg':
            templateCard.style.backgroundColor = element.value;
            previewCard.style.backgroundColor = element.value;
            break;
        case 'cardBorder':
            templateCard.style.borderColor = element.value;
            previewCard.style.borderColor = element.value;
            break;
        case 'cardGlobalTextCol':
            templateCard.style.color = element.value;
            previewCard.style.color = element.value;
            break;
        default:
            break;
    }

    // console.log('element ==>', element.id)

}

export function logCards() {
    console.log('CARDS ==> ', CARDS);
    return CARDS;
}

export function syncPreview(itemToSync) {
    let cardGlobalTextCol = document.getElementById('cardGlobalTextCol').value;
    let elemTemplId = itemToSync.id;
    let elemPrevId = document.getElementById('prev' + _.replace(_.replace(_.replace(elemTemplId, 'in', ''), 'Row', ''), 'col', ''));

    if (_.includes(elemTemplId, 'col')) {
        if (cardGlobalTextCol === '#000000')
            elemPrevId.style.color = itemToSync.value;
    } else {
        elemPrevId.innerHTML = itemToSync.value;
    }
}

/**
 * Enables the editing of a card by making the "Save" button visible and the "Edit" button invisible.
 * Then it populates the input fields with the values of the card to edit.
 * @param {HTMLElement} card the card to edit
 * @param {HTMLElement} editCardBtn the "Edit" button of the card
 * @param {HTMLElement} saveCardBtn the "Save" button of the card
 */
export function allowEditing(card, editCardBtn, saveCardBtn) {
    if (isEditingCard && card.id !== editingCardId) {
        common.onerror('<i class="fa-solid fa-triangle-exclamation"></i> Non possono essere modificate altre carte mentre una carta viene modificata.<br/>Terminare la modifica prima di modificare altre carte.');
        return;
    }

    isEditingCard = true;
    editingCardId = card.id;

    editCardBtn.classList.add('hidden');
    saveCardBtn.classList.remove('hidden');

    let cardId = card.id;
    let cardContainer = document.getElementById('container_' + cardId);
    cardContainer.classList.add('selectedEditCard');

    let cardData = _.find(CARDS, c => {
        return _.get(c, 'cardId') === cardId;
    });

    _.each(cardData, (value, key) => {
        let element = document.getElementById(key);
        element.value = value;

        if (!_.includes(['cardBg', 'cardBorder', 'cardGlobalTextCol', 'cardId'], key))
            syncPreview(element);
        else {
            updatePrevCard(element);
        }
    });
}

export function updateCard(card, editCardBtn, saveCardBtn) {
    isEditingCard = false;
    editingCardId = null;

    editCardBtn.classList.remove('hidden');
    saveCardBtn.classList.add('hidden');

    let cardId = card.id;
    let cardContainer = document.getElementById('container_' + cardId);
    cardContainer.classList.remove('selectedEditCard');

    loadCard(getValues(), false);
}
