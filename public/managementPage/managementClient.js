import jsonData from './testingJson.json' with {type: "json"}

export function loadGroupings(groupingId) {
    groupingId = _.toNumber(groupingId);
    let groupingContainer = document.getElementById('groupingContainer');

    let groupingData = _.find(jsonData, { _id: groupingId });
    let groups = _.get(groupingData, 'groups');

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