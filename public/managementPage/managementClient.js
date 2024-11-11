import GROUPINGS from './testingJson.json' with {type: "json"}

let groups = [];

export function loadGroupings(groupingId) {
    groupingId = _.toNumber(groupingId);


    let groupingData = _.find(GROUPINGS, { _id: groupingId });
    groups = _.get(groupingData, 'groups');
    handleHtml(groups);
    refreshGroups(groupingId);
}

export function addGroup() {
    let grouping_syllable = document.getElementById('grouping_syllable').value;
    let grouping_syllables = document.getElementById('grouping_syllables').value;

    grouping_syllable = _.trim(grouping_syllable);
    grouping_syllables = _.compact(_.map(_.split(grouping_syllables, '\n'), _.trim));


    let groupid = _.uniqueId('grouping_');

    if (!_.isEmpty(grouping_syllable) && !_.isEmpty(grouping_syllables)) {


        groups.push({
            groupid: groupid,
            syllable: grouping_syllable,
            possiblePairing: grouping_syllables
        });

        handleHtml(groups);
    }
}

function handleHtml(groups) {
    let groupingContainer = document.getElementById('groupingContainer');

    let groupingsHTML = [];
    _.each(groups, grp => {
        let groupId = _.get(grp, 'groupid');

        let groupHtml = `<div class="grouping" id="grouping_${groupId}">
                        <div class="groupingTitle" id="syllableGroup_${groupId}">${_.get(grp, 'syllable', '')}</div>
                        <div class="groupingPairs">
                            <textarea id="textarea_${groupId}">${_.join(_.get(grp, 'possiblePairing'), '\n')}</textarea>
                        </div>
                    </div>`;

        groupingsHTML.push(groupHtml);
    });

    groupingContainer.innerHTML = _.join(_.reverse(groupingsHTML), '\n');;
}

// export function saveGrouping() {
//     /*
//         Per salvare il grouping su cui stai lavorando, recupero id della select e dati array groups e li passo alla funzione per salvarli
//     */
//     console.log('groupingName ==> ', groupingName);
//     console.log('GROUPINGS ==> ', GROUPINGS);

//     GROUPINGS.push(groupData);

//     refreshGroups('')
//     // addNewGrouping(groupData);
// }


export function refreshGroups(selectedGrouping) {
    fetch('/get-groups')
        .then(response => response.json())
        .then(groups => {
            console.log('groups ==> ', groups)
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

export function saveGrouping(newGroupingName) {
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
