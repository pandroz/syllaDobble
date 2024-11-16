import * as common from '../common/commonClient.js'
let CARDS = [];


export function getValues() {
    let fields = $(":input").serializeArray();
    let cardData = {};
    _.each(fields, d => {
        let js = {};
        js[_.get(d, 'name')] = _.get(d, 'value');
        _.assign(cardData, js);
    })
    // console.log(cardData);
    loadCard(cardData)

    let cardKeys = _.keys(cardData)
    clearTemplate(cardKeys);
}

export function loadCard(cardData) {
    let newCardUUID = _.uniqueId('card_')
    // console.log('newUUID ==> ', [newCardUUID])
    _.assign(cardData, {
        cardId: newCardUUID
    });
    CARDS.push(cardData)

    let cardBg = _.get(cardData, 'cardBg');
    let cardBorder = _.get(cardData, 'cardBorder');
    let cardGlobalTextCol = _.get(cardData, 'cardGlobalTextCol');

    let isCardGlobalTextCol = cardGlobalTextCol !== '#000000';

    let cardHtml = `<div class="cardContainer" id="${newCardUUID}">
                        <button class="removeCardBtn groupingButton no-print" onclick="client.removeCard(${newCardUUID})"><i class="fas fa-times btn-delete"></i></button>
                        <div class="card" style="background-color: ${cardBg} !important; border-color: ${cardBorder}; color: ${cardGlobalTextCol}" id="card_${newCardUUID}">
                            <div class="cardRowTop">
                                <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(cardData, 'colTopL')}">${_.get(cardData, 'inTopRowL', '')}</div>
                                <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(cardData, 'colTopM')}">${_.get(cardData, 'inTopRowM', '')}</div>
                                <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(cardData, 'colTopR')}">${_.get(cardData, 'inTopRowR', '')}</div>
                            </div>

                            <div class="cardRowMid">
                                <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(cardData, 'colMidL')}">${_.get(cardData, 'inMidRowL', '')}</div>
                                <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(cardData, 'colMidM')}">${_.get(cardData, 'inMidRowM', '')}</div>
                                <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(cardData, 'colMidR')}">${_.get(cardData, 'inMidRowR', '')}</div>
                            </div>

                            <div class="cardRowBottom">
                                <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(cardData, 'colBotL')}">${_.get(cardData, 'inBotRowL', '')}</div>
                                <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(cardData, 'colBotM')}">${_.get(cardData, 'inBotRowM', '')}</div>
                                <div style="color: ${isCardGlobalTextCol ? cardGlobalTextCol : _.get(cardData, 'colBotR')}">${_.get(cardData, 'inBotRowR', '')}</div>
                            </div>
                        </div>
                    </div>`;

    // console.log(cardHtml)
    let cardsSectHtml = document.getElementById("cardsSectId").innerHTML
    cardHtml += cardsSectHtml;
    document.getElementById("cardsSectId").innerHTML = cardHtml;
}

export function removeCard(element) {
    CARDS = _.filter(CARDS, c => {
        return _.get(c, 'cardId') !== element.id;
    });
    document.getElementById(element.id).remove();
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
        return 1;
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
            loadCard(card);
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

export function updateCard(element) {
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
    let elemTemplId = itemToSync.id;
    let elemPrevId = document.getElementById('prev' + _.replace(_.replace(_.replace(elemTemplId, 'in', ''), 'Row', ''), 'col', ''));

    if (_.includes(elemTemplId, 'col')) {
        elemPrevId.style.color = itemToSync.value;
    } else {
        elemPrevId.innerHTML = itemToSync.value;
    }
}