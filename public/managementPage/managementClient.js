import importedGroupings from './testingJson.json' with {type: "json"}

let GROUPS = [];
let GROUPINGS = [];

/**
 * Generates a random id by multiplying Math.Random and Date.now
 * @returns A unique id with the prefix 'g_'
 */
function uniqueGroupID() {
    return 'g_' + Math.floor(Math.random() * Date.now())
}

/**
 *
 * @returns The selected grouping from the select
 */
function getSelectedGrouping() {
    return document.getElementById('groupingSelected').value;
}

/**
 *
 * @returns the GROUPS array if existing, otherwise returns an empty Array
 */
function getGroups() {
    return GROUPS || [];
}

export function logGroups() {
    console.log('[logGroups] GROUPS ==> ', GROUPS);
}

/**
 * Loads the groups in the management client page retrieving them from the groupingId parameter

 *  USES THE LOCAL SAVED GROUPS, DOES NOT CALL THE SERVER )
    @param groupingId {string}
*/
export function loadGroupings(groupingId) {
    groupingId = _.isNil(groupingId) ? '' : _.toNumber(groupingId);

    if (_.isEmpty(GROUPINGS)) {
        GROUPINGS = importedGroupings;
    }

    let groupingData = _.find(GROUPINGS, { _id: groupingId });
    GROUPS = _.get(groupingData, 'groups', []);
    handleGroupHtml(GROUPS);
    console.log('loadGroupings groupingId ==> ', groupingId, ' GROUPS ==> ', GROUPS)
    refreshGroupings(groupingId);
}

/**
 * Adds a new group to the groupingId selected
 *
 * Generates a random group id and adds the group to the client page
 * @param {*} grouping_syllable Syllable from the upper area of the group
 * @param {*} grouping_syllables Syllables in the textarea
 */
export function addGroup(grouping_syllable, grouping_syllables) {
    GROUPS = getGroups();
    grouping_syllable = _.trim(grouping_syllable);
    grouping_syllables = _.compact(_.map(_.split(grouping_syllables, '\n'), _.trim));

    let groupid = uniqueGroupID()

    if (!_.isEmpty(grouping_syllable) && !_.isEmpty(grouping_syllables)) {

        GROUPS.push({
            groupid: groupid,
            syllable: grouping_syllable,
            possiblePairing: grouping_syllables
        });

        handleGroupHtml(GROUPS);
        saveGrouping(getSelectedGrouping());
    }
}

function handleGroupingsHtml(groupings, selectedGrouping) {
    const select = document.querySelector('#groupingSelected');

    GROUPINGS = groupings;
    let groups = _.map(groupings, d => {
        return {
            _id: _.get(d, '_id'),
            groupingName: _.get(d, 'groupingName')
        };
    });

    // Clear existing options
    select.innerHTML = '';

    let isDefSelected = _.isNil(selectedGrouping);

    // Optional: Add default option
    let defaultOption = new Option('Seleziona un raggruppamento', '', isDefSelected, isDefSelected);
    defaultOption.disabled = true;
    select.appendChild(defaultOption);

    // Add new options
    groups.forEach(group => {
        if (_.get(group, '_id') === selectedGrouping)
            select.appendChild(new Option(_.get(group, 'groupingName'), _.get(group, '_id'), true, true));
        else
            select.appendChild(new Option(_.get(group, 'groupingName'), _.get(group, '_id'), false, false));
    });
}

/**
 * Handles the HTML instancing of the groups in the client page
 * @param {*} groups
 */
function handleGroupHtml(groups) {
    let groupingContainer = document.getElementById('groupingContainer');

    let groupingsHTML = [];
    _.each(groups, grp => {
        let groupId = _.get(grp, 'groupid');

        let groupHtml = `<div class="grouping" id="${groupId}">
                            <div id="grouping_${groupId}">
                                <div class="groupingHeader">
                                    <div class="groupingTitle" id="syllableGroup_${groupId}">${_.get(grp, 'syllable', '')}</div>
                                    <button class="groupingButton" onclick="client.allowEditing(textarea_${groupId}, editGroup_${groupId}, saveGroup_${groupId})" id="editGroup_${groupId}"><i class="fa-solid fa-pencil"></i></button>
                                    <button class="groupingButton hidden" onclick="client.updateGroup(${groupId}.id, textarea_${groupId}, editGroup_${groupId}, saveGroup_${groupId})" id="saveGroup_${groupId}"><i class="fa-regular fa-floppy-disk"></i></button>
                                </div>
                            <div class="groupingPairs">
                                <textarea id="textarea_${groupId}" disabled>${_.join(_.get(grp, 'possiblePairing'), '\n')}</textarea>
                            </div>
                        </div>
                    </div>`;

        groupingsHTML.push(groupHtml);
    });

    groupingContainer.innerHTML = _.join(_.reverse(groupingsHTML), '\n');;
}

/**
 * Refreshes the groupings list only, generates the options and selectes the parameter
 *
 * After getting the results will proceed to load the groups inside the grouping
 * @param {*} selectedGrouping Is the grouping that will be shown as selected and whose groups will be loaded
 */
export function refreshGroupings(selectedGrouping) {
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

/**
 * Saves the new grouping and loads the new group for the user
 * @param {string} newGroupingName Name of the new grouping that gets saved and added to the list
 */
export function saveNewGrouping(newGroupingName) {
    const data = { groupName: newGroupingName };
    console.log('Sending data:', data);  // Debug log

    fetch('/add-new-grouping', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Item added successfully');
                let newId = data.newId
                loadGroupings(newId);
                getServerGroups(newId);
            } else {
                console.error('Failed to add item:', data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

/**
 * Saves the changes made to the groups of the selected grouping
 * @param {*} groupingid
 */
export function saveGrouping(groupingid) {
    console.log('Saving groupingid:', groupingid);  // Debug log

    let data = {
        groupingId: groupingid,
        groups: GROUPS
    };

    console.log('Saving data: ', data)

    fetch('/save-grouping', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Item added successfully');
                // loadGroupings(groupid);
            } else {
                console.error('Failed to add item:', data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

/**
 * Enables the textarea with the id passed by parameter, hides the edit button and shows the save button
 * @param {Element} textareaId Disabled textarea element
 * @param {Element} editGroupButton Shown edit button
 * @param {Element} saveGroupButton Hidden save button
 */
export function allowEditing(textareaId, editGroupButton, saveGroupButton) {
    editGroupButton.classList.add('hidden');
    saveGroupButton.classList.remove('hidden');
    textareaId.disabled = false;
}

/**
 * Saves the edited group, disables the textarea, hides the save button and shows the edit button
 * @param {*} groupId
 * @param {*} textareaId
 * @param {*} editGroupButton
 * @param {*} saveGroupButton
 */
export function updateGroup(groupId, textareaId, editGroupButton, saveGroupButton) {
    let groupingId = getSelectedGrouping();

    editGroupButton.classList.remove('hidden');
    saveGroupButton.classList.add('hidden');
    textareaId.disabled = true;

    let newPairings = _.split(textareaId.value, '\n');

    let itemIx = _.findIndex(GROUPS, {
        "groupid": groupId
    });

    if (!_.eq(itemIx, -1)) {
        GROUPS[itemIx].possiblePairing = newPairings;
        saveGrouping(groupingId)
    }
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
                GROUPS = data.groups;
                console.log('[getServerGroups] GROUPS ==> ', GROUPS);
            } else {
                console.error('Failed to add item:', data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

export function deleteGrouping(groupingSelected) {
    console.log('deleteGrouping - LOGIC TODO ');
    let data = {
        "groupingId": groupingSelected
    };

    fetch('/delete-grouping', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Deleted grouping: "', groupingSelected, '", refreshing data');
                loadGroupings();
            } else {
                console.error('Failed to add item:', data.error);
            }
        })
        .catch(error => console.error('Error:', error));

    // TODO LOGIC TO DELETE GROUPING
}

export function deleteGroup(groupSelected) {
    // TODO LOGIC TO DELETE GROUP
}