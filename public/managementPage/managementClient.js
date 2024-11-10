import jsonData from './testingJson.json' with {type: "json"}

let groups = [];

export function loadGroupings(groupingId) {
    groupingId = _.toNumber(groupingId);


    let groupingData = _.find(jsonData, { _id: groupingId });
    groups = _.get(groupingData, 'groups');
    handleHtml(groups);
}

export function addGrouping() {
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