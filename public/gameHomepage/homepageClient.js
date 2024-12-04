import * as common from '../common/commonClient.js'
import { freezePage } from '../common/commonClient.js';
import { cleanFormatStates } from '../components/textFormatting/textFormattingClient.js'

let CARDS = [];
let GROUPS = [];
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
    });


    let images = Array.from(document.querySelectorAll('img[id^="prevImg"]'));
    _.each(images, d => {
        let js = {};
        // js[_.get(d, 'id')] = _.get(d, 'src');
        js[_.get(d, 'id')] = d.getAttribute('src');
        _.assign(cardData, js);
    });

    let fontSelector = document.getElementById('fontSelector');
    cardData['fontSelector'] = _.get(fontSelector, 'value');

    let cardFormats = _.intersection(_.split(document.getElementById('previewCard').classList.value, ' '), ['bold', 'italic', 'underline']);
    cardData['cardFormats'] = cardFormats;

    // console.log(cardData);
    return cardData;
}

/**
 * @function loadCard
 * @description Popola una carta con i valori forniti e la aggiunge alla lista delle carte.
 *              Se isNewCard === true, genera un nuovo ID per la carta.
 *              Se isGeneratedCard === true, non recupera i valori dalla template.
 *              Se isUploadedCard === true, crea una nuova carta.
 * @param {object} cardData - Oggetto contenente i valori per la carta.
 * @param {bool} isNewCard - Se true, genera un nuovo ID per la carta.
 * @param {bool} isUploadedCard - Se true, crea una nuova carta.
 * @param {bool} isGeneratedCard - Se true, non recupera i valori dalla template.
 */
export function loadCard(cardData, isNewCard, isUploadedCard, isGeneratedCard) {
    isEditingCard = false;
    editingCardId = null;

    let cardUUID = '';

    if (isNewCard) {
        if (!isGeneratedCard)
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

    let cardElement = formatCardValues(cardData);

    let cardsSect = document.getElementById("cardsSectId");

    if ((isNewCard) || (isUploadedCard)) {
        cardsSect.insertBefore(cardElement, cardsSectPad);
    } else {
        cardsSect.replaceChild(cardElement, document.getElementById(`container_${cardUUID}`));
    }

    let cardKeys = _.keys(cardData)
    clearTemplate(cardKeys);
}

function formatCardValues(card) {
    let cardId = _.get(card, 'cardId');

    let cardContainer = document.createElement('div');
    cardContainer.className = 'cardContainer';
    cardContainer.id = `container_${cardId}`;

    // Edit button
    let editButton = document.createElement('button');
    editButton.id = 'editCard_' + cardId;
    editButton.className = 'groupingButton no-print';
    editButton.innerHTML = '<i class="fa-solid fa-pencil"></i>';
    editButton.onclick = () => {
        client.allowEditing(cardElement, editButton, saveButton);
    };

    // Save button
    let saveButton = document.createElement('button');
    saveButton.id = `saveCard_${cardId}`;
    saveButton.className = 'groupingButton no-print hidden blackFont';
    saveButton.innerHTML = '<i class="fa-regular fa-floppy-disk"></i>';
    saveButton.onclick = () => {
        client.updateCard(cardElement, saveButton, editButton);
    };

    // Delete button
    let deleteButton = document.createElement('button');
    deleteButton.id = `deleteCard_${cardId}`;
    deleteButton.className = 'groupingButton no-print';
    deleteButton.innerHTML = '<i class="fas fa-times btn-delete"></i>';
    deleteButton.onclick = () => {
        client.removeCard(cardId, cardContainer);
    };

    cardContainer.appendChild(editButton);
    cardContainer.appendChild(saveButton);
    cardContainer.appendChild(deleteButton);

    let cardElement = document.createElement('div');
    cardElement.id = _.get(card, 'cardId');
    cardElement.className = `card ${_.join(_.get(card, 'cardFormats'), ' ')}`;
    cardElement.style.backgroundColor = _.get(card, 'cardBg');
    cardElement.style.borderColor = _.get(card, 'cardBorder');
    cardElement.style.color = _.get(card, 'cardGlobalTextCol');
    cardElement.style.fontFamily = _.get(card, 'fontSelector');

    let groupedKeys = {};
    let keyGroups = ['Top', 'Mid', 'Bot'];
    _.each(keyGroups, key => {
        groupedKeys[key] = _.pickBy(card, (v, k) => _.includes(k, key));
    });

    // CREATING CARD ELEMENTS
    _.each(groupedKeys, (value, key) => {
        let cardRowElement = document.createElement('div');

        let position = key;
        cardRowElement.className = `cardRow${position}`;

        _.each(value, (value, key) => {
            if (_.startsWith(key, 'col')) return;

            let dataWrapper = document.createElement('div');
            dataWrapper.id = position + _.last(key);
            
            let childNodes = Array.from(cardRowElement.childNodes);

            // IMAGE HANDLING
            if (_.includes(key, 'prevImg') && !_.isEmpty(value)) {
                let img = document.createElement('img');
                img.src = value;
                img.className = 'card-image';

                dataWrapper.appendChild(img);

                let spanToReplaceIx = _.findIndex(childNodes, n => {
                    return _.get(n, 'firstChild.tagName') === 'SPAN' && _.get(n, 'id') === position + _.last(key);
                });
                cardRowElement.appendChild(dataWrapper);
                if (spanToReplaceIx !== -1) {
                    cardRowElement.replaceChild(dataWrapper, cardRowElement.childNodes[spanToReplaceIx]);
                }
                

                // TEXT HANDLING
            } else if (_.includes(key, 'in')) {
                let span = document.createElement('span');
                let colKey = 'col' + _.join(_.slice(key, 2), '');
                span.style.color = cardGlobalTextCol;
                span.style.backgroundColor = _.get(card, colKey);
                span.innerText = _.get(card, key, '');

                dataWrapper.appendChild(span);

                let imgToReplaceIx = _.findIndex(childNodes, n => {
                    return _.get(n, 'firstChild.tagName') === 'IMG' && _.get(n, 'id') === position + _.last(key);
                });
                if (imgToReplaceIx !== -1) {
                    cardRowElement.replaceChild(span, cardRowElement.childNodes[imgToReplaceIx].firstChild);
                }
                cardRowElement.appendChild(dataWrapper);
            }
            
        });

        cardElement.appendChild(cardRowElement);
    });

    cardContainer.appendChild(cardElement);

    return cardContainer;
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
    let fontSelector = document.getElementById('fontSelector');
    fontSelector.value = 'x';

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
    previewCard.style.backgroundColor = '#FFFFFF';
    previewCard.style.borderColor = "#000000";
    previewCard.style.fontFamily = null;
}

export function stampaPagine() {
    if (_.size(CARDS) < 1) {
        common.onerror('<i class="fa-solid fa-triangle-exclamation"></i> Non è possibile stampare senza carte create')
        return;
    }
    if (isEditingCard) {
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
            loadCard(card, false, true);
        })
    };

    document.getElementById(inputFile.id).value = "";
}

export function clearTemplate(cardKeys) {
    // Resetting global values
    resetGlobals();

    // Cleaning formattings
    cleanFormatStates('previewCard');

    // Cleaning images
    let images = Array.from(document.querySelectorAll('div[id^="wrapperImg"]'));
    _.each(images, d => {
        d.remove();
    });

    // Resetting values inside the card
    _.each(cardKeys, key => {
        if (!_.includes(['cardBg', 'cardBorder', 'cardGlobalTextCol'], key)) {
            let element = document.getElementById(key);
            let prevElement = document.getElementById('prev' + _.replace(_.replace(key, 'in', ''), 'Row', ''));
            if (_.startsWith(key, 'in')) {
                element.value = '';
                prevElement.innerHTML = '';
            } else if (_.startsWith(key, 'col')) {
                element.value = '#FFFFFF';
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
    let elemTemplId = itemToSync.id;
    let elemPrevId = document.getElementById('prev' + _.replace(_.replace(_.replace(elemTemplId, 'in', ''), 'Row', ''), 'col', ''));

    if (_.startsWith(elemTemplId, 'col')) {
        elemPrevId.style.background = itemToSync.value;

    } else if (_.startsWith(elemTemplId, 'in'))
        elemPrevId.innerHTML = itemToSync.value;

    validateInputs();
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

        if (!_.includes(['cardBg', 'cardBorder', 'cardGlobalTextCol', 'cardId', 'cardFormats'], key) && !_.startsWith(key, 'prevImg')) {
            element.value = value;
            syncPreview(element);
        } else if (_.startsWith(key, 'prevImg')) {
            element.src = value;
            element.classList.remove('hidden');
        } else if (_.includes(['cardBg', 'cardBorder', 'cardGlobalTextCol'], key)) {
            element.value = value;
            updatePrevCard(element);
        } else if (_.includes(['cardFormats'], key)) {
            syncFormats(value);
        } else if ('cardId' === key) {
            element.value = value;
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
    hideImagePreviews();
    validateInputs();
}

export function refreshGroupings(selectedGrouping) {
    freezePage(true);
    fetch('/get-groupings')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                handleGroupingsHtml(_.get(data, 'groupings'), selectedGrouping);
            } else {
                console.error('Failed retrieve groupings data:', data.error);
            }

        })
        .catch(error => console.error('Error:', error));
}

function handleGroupingsHtml(groupings, selectedGrouping) {
    const groupingSelect = document.querySelector('#groupingSelected');

    let groups = _.map(groupings, d => {
        return {
            _id: _.get(d, '_id'),
            groupingName: _.get(d, 'groupingName')
        };
    });

    let isDefSelected = !_.isString(selectedGrouping);

    // Clear existing options
    groupingSelect.innerHTML = '';

    // Optional: Add default option
    let defaultOption = new Option('Seleziona un raggruppamento', 'x', isDefSelected, isDefSelected);
    defaultOption.disabled = true;
    groupingSelect.appendChild(defaultOption);

    // Add new options
    groups.forEach(group => {
        if (_.get(group, '_id') === selectedGrouping)
            groupingSelect.appendChild(new Option(_.get(group, 'groupingName'), _.get(group, '_id'), true, true));
        else
            groupingSelect.appendChild(new Option(_.get(group, 'groupingName'), _.get(group, '_id'), false, false));
    });
    freezePage(false);
}


export function getServerGroups(groupingId) {
    let data = {
        groupingId: _.toNumber(groupingId)
    }

    fetch('/get-groups', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // console.log('[getServerGroups] GROUPS ==> ', data.groups);
                GROUPS = data.groups;
                handleGroupHtml(groupingId)
                return data.groups
            } else {
                console.error('Failed to add item:', data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}


export function handleGroupHtml(groupingId) {
    const groupSelect = document.querySelector('#groupSelected');

    let groupNames = _.map(GROUPS, d => {
        return {
            groupid: _.get(d, 'groupid'),
            syllable: _.get(d, 'syllable')
        };
    });

    // Clear existing options
    groupSelect.innerHTML = '';

    // Optional: Add default option
    let defaultOption = new Option('Seleziona un gruppo', 'x', true, true);
    defaultOption.disabled = true;
    groupSelect.appendChild(defaultOption);

    // Add new options
    groupNames.forEach(group => {
        // if (_.get(group, '_id') === selectedGrouping)
        //     groupingSelect.appendChild(new Option(_.get(group, 'groupingName'), _.get(group, '_id'), true, true));
        // else
        groupSelect.appendChild(new Option(_.get(group, 'syllable'), _.get(group, 'groupid'), false, false));
    });
    freezePage(false);


}


export function generateCards(groupingId, groupId, cardsNumber) {
    freezePage(true);

    if (groupId === 'x') {
        freezePage(false);
        common.onerror('<i class="fa-solid fa-triangle-exclamation"></i> Selezionare un gruppo.');
        return;
    }

    const syllables = _.get(_.find(GROUPS, { groupid: groupId }), 'possiblePairing', []);

    const n = cardsNumber - 1;
    const totalSymbolsNeeded = n * n + n + 1;
    const extendedSyllables = createSymbolSet(syllables, totalSymbolsNeeded);
    try {
        const cards = generateDobbleCards(n, extendedSyllables);

        _.each(cards, card => {
            card = assignCard(card, n);
            // console.log('card ==> ', card);
            loadCard(card, true, false, true);
        });

    } catch (error) {
        console.log('Error while generating cards:', error);
    }

    freezePage(false);
}


function assignCard(card, syllablesUsed) {
    let keys = ["inTopL", "inTopM", "inTopR", "inMidL", "inMidM", "inMidR", "inBotL", "inBotM", "inBotR"];

    let assignedCard = {};
    if (syllablesUsed < 9) {
        keys = _.take(keys, syllablesUsed + 1);
    }

    _.each(keys, (key, i) => {
        _.extend(assignedCard, { [key]: card[i] });
    });

    _.assign(assignedCard, {
        cardBg: '#ffffff',
        cardBorder: '#000000',
        cardGlobalTextCol: '#000000'
    });

    return assignedCard;
}


/**
 * Generates a complete set of Dobble/Spot It! cards using custom symbols
 * @param {number} n - Order of the projective plane (n=7 for standard Dobble)
 * @param {string[]} symbols - Array of custom symbols to use
 * @returns {Array<string[]>} Array of cards, where each card is an array of symbols
 */
function generateDobbleCards(n, symbols) {
    // Validate input
    if (symbols.length < n * n + n + 1) {
        throw new Error(`Not enough symbols. Need at least ${n * n + n + 1} unique symbols.`);
    }

    const symbolsPerCard = n + 1;

    const cards = [];

    // Generate first card with first n+1 symbols
    const firstCard = symbols.slice(0, symbolsPerCard);
    cards.push(firstCard);

    // Generate n sets of n cards each
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const card = [symbols[i]]; // Start with the first symbol

            // Add n more symbols using the pattern
            for (let k = 0; k < n; k++) {
                const symbolIndex = n + 1 + (i * n + j + k * j) % (n * n);
                card.push(symbols[symbolIndex]);
            }
            cards.push(card);
        }
    }

    // Generate the last n cards
    for (let i = 0; i < n; i++) {
        const card = [symbols[n]];
        for (let j = 0; j < n; j++) {
            const symbolIndex = n + 1 + (j * n + i);
            card.push(symbols[symbolIndex]);
        }
        cards.push(card);
    }

    return cards;
}

/**
 * Validates that the generated cards follow Dobble rules
 * @param {Array<string[]>} cards - Array of generated cards
 * @returns {boolean} True if valid, throws error if invalid
 */
function validateDobbleCards(cards) {
    // Check each pair of cards
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            const matchingSymbols = cards[i].filter(symbol =>
                cards[j].includes(symbol));

            if (matchingSymbols.length !== 1) {
                throw new Error(
                    `Invalid: Cards ${i} and ${j} have ${matchingSymbols.length} matching symbols`
                );
            }
        }
    }
    return true;
}

// Function to help users create a symbol set
function createSymbolSet(baseSyllables, totalNeeded) {
    // If base symbols are not enough, repeat them
    const extendedSymbols = [];
    while (extendedSymbols.length < totalNeeded) {
        extendedSymbols.push(...baseSyllables);
    }
    return extendedSymbols.slice(0, totalNeeded);
}


export function unlockButton(value) {
    let generateCardsBtn = document.getElementById('generateCardsBtn');
    generateCardsBtn.disabled = value === 'x';
}


export function validateInputs() {
    let inputs = $(":input").serializeArray();

    let values = _.map(inputs, input => {
        let element = document.getElementById(input.name);
        element.classList.remove('warningInput');

        return {
            "value": input.value,
            "id": input.name
        };
    });

    // Remove empty values
    values = _.filter(values, value => {
        return !_.startsWith(value.id, 'col') && !_.startsWith(value.id, 'card') && !_.isNil(value.value) && value.value !== '';
    });

    // Trim values
    _.map(values, value => {
        value.value = _.trim(_.toLower(value.value));
    })

    const valueMap = new Map();

    // First pass: Count occurrences and store objects
    values.forEach(obj => {
        if (!valueMap.has(obj.value)) {
            valueMap.set(obj.value, {
                count: 1,
                objects: [obj]
            });
        } else {
            const entry = valueMap.get(obj.value);
            entry.count++;
            entry.objects.push(obj);
        }
    });

    // Second pass: Filter only objects with duplicate values
    const duplicates = Array.from(valueMap.values())
        .filter(entry => entry.count > 1)
        .flatMap(entry => entry.objects);

    if (duplicates.length > 0) {
        _.each(duplicates, duplicate => {
            let element = document.getElementById(duplicate.id);
            element.classList.add('warningInput');
        })
    }
}

export function changeColor(element, color) {
    element.value = color;
}

export function changeFont(fontSelector) {
    let font = fontSelector.value;

    let previewCard = document.getElementById('previewCard');
    previewCard.style.fontFamily = font;
    fontSelector.style.fontFamily = font;
}

export function syncFormats(formats) {
    let previewCard = document.getElementById('previewCard');

    _.each(formats, format => {
        previewCard.classList.toggle(format);

        let btn = document.querySelector(`.format-btn-${format.charAt(0)}`);
        btn.classList.toggle('activeFormat', previewCard.classList.contains(format));
    });
}

export function changeCardType(syllablesTemplate, imagesTemplate) {
    syllablesTemplate.classList.toggle('hidden');
    imagesTemplate.classList.toggle('hidden');
}

function hideImagePreviews() {
    $('img[id^="prevImg"]').each(function () {
        $(this).addClass('hidden');
    });
}