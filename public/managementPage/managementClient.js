import GROUPINGS from './testingJson.json' with {type: "json"}

let groups = [];

function uniqueGroupID() {
    return 'g_' + Math.floor(Math.random() * Date.now())
}

function getSelectedGrouping() {
    return document.getElementById('groupingSelected').value;
}

export function loadGroupings(groupingId) {
    groupingId = _.toNumber(groupingId);


    let groupingData = _.find(GROUPINGS, { _id: groupingId });
    groups = _.get(groupingData, 'groups');
    handleHtml(groups);
    refreshGroups(groupingId);
}

export function addGroup(grouping_syllable, grouping_syllables) {
    grouping_syllable = _.trim(grouping_syllable);
    grouping_syllables = _.compact(_.map(_.split(grouping_syllables, '\n'), _.trim));


    let groupid = uniqueID()

    if (!_.isEmpty(grouping_syllable) && !_.isEmpty(grouping_syllables)) {


        groups.push({
            groupid: groupid,
            syllable: grouping_syllable,
            possiblePairing: grouping_syllables
        });

        handleHtml(groups);
        saveGrouping(getSelectedGrouping());
    }
}

function handleHtml(groups) {
    let groupingContainer = document.getElementById('groupingContainer');

    let groupingsHTML = [];
    _.each(groups, grp => {
        let groupId = _.get(grp, 'groupid');

        let groupHtml = `<div class="grouping" id="${groupId}">
                            <div id="grouping_${groupId}">
                                <div class="groupingHeader">
                                    <div class="groupingTitle" id="syllableGroup_${groupId}">${_.get(grp, 'syllable', '')}</div>
                                    <button class="groupingButton" onclick="client.allowEditing(textarea_${groupId}, editGroup_${groupId}, saveGroup_${groupId})" id="editGroup_${groupId}"><i class="fa-solid fa-pencil"></i></button>
                                    <button class="groupingButton hidden" onclick="client.updateGrouping(${groupId}.id, textarea_${groupId}, editGroup_${groupId}, saveGroup_${groupId})" id="saveGroup_${groupId}"><i class="fa-regular fa-floppy-disk"></i></button>
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

export function refreshGroups(selectedGrouping) {
    fetch('/get-groups')
        .then(response => response.json())
        .then(groups => {
            const select = document.querySelector('#groupingSelected');  // Make sure to add an ID to your select

            // Clear existing options
            select.innerHTML = '';

            // Optional: Add default option
            let defaultOption = new Option('Seleziona un raggruppamento', '', false, false);
            defaultOption.disabled = true;
            select.appendChild(defaultOption);

            // Add new options
            groups.forEach(group => {
                if (_.get(group, '_id') === selectedGrouping)
                    select.appendChild(new Option(_.get(group, 'groupingName'), _.get(group, '_id'), true, true));
                else
                    select.appendChild(new Option(_.get(group, 'groupingName'), _.get(group, '_id'), false, false));
            });
        })
        .catch(error => console.error('Error:', error));
}

export function saveNewGrouping(newGroupingName) {
    const data = { groupName: newGroupingName };
    console.log('Sending data:', data);  // Debug log
    let newId = '';

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
                loadGroupings(data.newId);
            } else {
                console.error('Failed to add item:', data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

export function saveGrouping(groupingid) {
    console.log('Saving groupingid:', groupingid);  // Debug log

    let data = {
        groupid: groupingid,
        groups: groups
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

export function allowEditing(textareaId, editGroupButton, saveGroupButton) {
    editGroupButton.classList.add('hidden');
    saveGroupButton.classList.remove('hidden');
    textareaId.disabled = false;
}

export function updateGrouping(groupId, textareaId, editGroupButton, saveGroupButton) {
    let groupingId = getSelectedGrouping();
    console.log('groupingId ==> ', groupingId)
    
    editGroupButton.classList.remove('hidden');
    saveGroupButton.classList.add('hidden');
    textareaId.disabled = true;

    let newGroups = _.split(textareaId.value, '\n');

    let itemIx = _.findIndex(groups, {
        "groupid": groupId
    });

    if (!_.eq(itemIx, -1)) {
        groups[itemIx].groups = newGroups;
        saveGrouping(groupingId)
    }
}

