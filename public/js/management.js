let GROUPS = [];
let GROUPINGS = [];

document.addEventListener("DOMContentLoaded", () => {
	loadGroupings();
    freezePage(false);
});

/**
 * Generates a random id by multiplying Math.Random and Date.now
 * @returns A unique id with the prefix 'g_'
 */
function uniqueGroupID() {
	return "g_" + Math.floor(Math.random() * Date.now());
}

/**
 *
 * @returns The selected grouping from the select
 */
function getSelectedGrouping() {
	return document.getElementById("groupingSelected").value;
}

/**
 *
 * @returns the GROUPS array if existing, otherwise returns an empty Array
 */
function getGroups() {
	return GROUPS || [];
}

function logGroups() {
	console.log("[logGroups] GROUPS ==> ", GROUPS);
}

/**
 * Loads the groups in the management client page retrieving them from the groupingId parameter

 *  USES THE LOCAL SAVED GROUPS, DOES NOT CALL THE SERVER )
    @param groupingId {string}
*/
function loadGroupings(groupingId) {
	groupingId = _.isNil(groupingId) ? "" : _.toNumber(groupingId);

	axios.get("/management/get-groupings")
    .then((res) => {
		if (res.data.success) {
			GROUPINGS = res.data.groupings;
            let groupingData = _.find(GROUPINGS, { _id: groupingId });
            GROUPS = _.get(groupingData, "groups", []);
            handleGroupHtml(GROUPS);
            refreshGroupings(groupingId);
		}
	});

}

/**
 * Adds a new group to the groupingId selected
 *
 * Generates a random group id and adds the group to the client page
 * @param {*} grouping_syllable Syllable from the upper area of the group
 * @param {*} grouping_syllables Syllables in the textarea
 */
function addGroup(grouping_syllable, grouping_syllables) {
	let syllable = _.trim(grouping_syllable.value);
	let possiblePairing = _.compact(
		_.map(_.split(grouping_syllables.value, "\n"), _.trim),
	);

	GROUPS = getGroups();

	let groupid = uniqueGroupID();

	if (!_.isEmpty(syllable) && !_.isEmpty(possiblePairing)) {
		GROUPS.push({
			groupid: groupid,
			syllable: syllable,
			possiblePairing: possiblePairing,
		});

		handleGroupHtml(GROUPS);
		saveGrouping(getSelectedGrouping());

		grouping_syllable.value = null;
		grouping_syllables.value = null;
	}
}

function handleGroupingsHtml(groupings, selectedGrouping) {
	const select = document.querySelector("#groupingSelected");

	GROUPINGS = groupings;
	let groups = _.map(groupings, (d) => {
		return {
			_id: _.get(d, "_id"),
			groupingName: _.get(d, "groupingName"),
		};
	});

	// Clear existing options
	select.innerHTML = "";

	let isDefSelected = _.isString(selectedGrouping);
	document.getElementById("addGroupBtn").disabled = isDefSelected;
	document.getElementById("deleteGroupingBtn").disabled = isDefSelected;

	// Optional: Add default option
	let defaultOption = new Option(
		"Seleziona un raggruppamento",
		"x",
		isDefSelected,
		isDefSelected,
	);
	defaultOption.disabled = true;
	select.appendChild(defaultOption);

	// Add new options
	groups.forEach((group) => {
		if (_.get(group, "_id") === selectedGrouping)
			select.appendChild(
				new Option(
					_.get(group, "groupingName"),
					_.get(group, "_id"),
					true,
					true,
				),
			);
		else
			select.appendChild(
				new Option(
					_.get(group, "groupingName"),
					_.get(group, "_id"),
					false,
					false,
				),
			);
	});
	freezePage(false);
}

/**
 * Handles the HTML instancing of the groups in the client page
 * @param {*} groups
 */
function handleGroupHtml(groups) {
	let groupingContainer = document.getElementById("groupingContainer");

	let groupingsHTML = [];
	_.each(groups, (grp) => {
		let groupId = _.get(grp, "groupid");

		let groupHtml = `<div class="grouping" id="${groupId}">
                            <div id="grouping_${groupId}">
                                <div class="groupingHeader">
                                    <input class="groupingTitle" id="syllableGroup_${groupId}" value="${_.get(grp, "syllable", "")}" disabled></input>
                                    <button class="groupingButton" onclick="allowEditing(syllableGroup_${groupId}, textarea_${groupId}, editGroup_${groupId}, saveGroup_${groupId}, deleteGroup_${groupId})" id="editGroup_${groupId}"><i class="fa-solid fa-pencil"></i></button>
                                    <button class="groupingButton hidden" onclick="deleteGroup(${groupId})" id="deleteGroup_${groupId}"><i class="fas fa-times text-danger"></i></button>
                                    <button class="groupingButton hidden" onclick="updateGroup(${groupId}.id, syllableGroup_${groupId}, textarea_${groupId}, editGroup_${groupId}, saveGroup_${groupId}, deleteGroup_${groupId})" id="saveGroup_${groupId}"><i class="fa-regular fa-floppy-disk"></i></button>
                                </div>
                            <div class="groupingPairs">
                                <textarea id="textarea_${groupId}" disabled>${_.join(_.get(grp, "possiblePairing"), "\n")}</textarea>
                            </div>
                        </div>
                    </div>`;

		groupingsHTML.push(groupHtml);
	});

	groupingContainer.innerHTML = _.join(_.reverse(groupingsHTML), "\n");
}

/**
 * Refreshes the groupings list only, generates the options and selectes the parameter
 *
 * After getting the results will proceed to load the groups inside the grouping
 * @param {*} selectedGrouping Is the grouping that will be shown as selected and whose groups will be loaded
 */
function refreshGroupings(selectedGrouping) {
	freezePage(true);
	axios.get("/management/get-groupings")
		.then((res) => {
            let data = res.data;
			if (data.success) {
				handleGroupingsHtml(_.get(data, "groupings"), selectedGrouping);
			} else {
				console.error("Failed retrieve groupings data:", data.error);
			}
		})
		.catch((error) => console.error("Error:", error));
}

/**
 * Saves the new grouping and loads the new group for the user
 * @param {string} newGroupingName Name of the new grouping that gets saved and added to the list
 */
function saveNewGrouping(newGroupingName) {
	freezePage(true);
	console.log("Sending data:", newGroupingName); // Debug log

	axios.post("/management/add-new-grouping", {
        groupName: newGroupingName
    }, {
		headers: {
			"Content-Type": "application/json",
		}
	})
    .then((res) => {
        let data = res.data;
        if (data.success) {
            console.log("New grouping saved successfully");
            let newId = data.newId;
            loadGroupings(newId);
            getServerGroups(newId);
            freezePage(false);
        } else {
            console.error("Failed to add item:", data.error);
            freezePage(false);
        }
	}).catch((error) => console.error("Error:", error));
}

/**
 * Saves the changes made to the groups of the selected grouping
 * @param {*} groupingid
 */
function saveGrouping(groupingid) {
	console.log("Saving groupingid:", groupingid); // Debug log

	axios.post("/management/save-grouping", {
		groupingId: groupingid,
		groups: GROUPS,
	}, {
        headers: {
			"Content-Type": "application/json",
		}
	}).then((res) => {
        let data = res.data;
        if (data.success) {
            console.log("Grouping saved successfully");
            // loadGroupings(groupid);
        } else {
            console.error("Failed to add item:", data.error);
    }
    }).catch((error) => console.error("Error:", error));
}

/**
 * Enables the textarea with the id passed by parameter, hides the edit button and shows the save button
 * @param {Element} textareaId Disabled textarea element
 * @param {Element} editGroupButton Shown edit button
 * @param {Element} saveGroupButton Hidden save button
 */
function allowEditing(
	inputId,
	textareaId,
	editGroupButton,
	saveGroupButton,
	deleteGroupButton,
) {
	editGroupButton.classList.add("hidden");
	saveGroupButton.classList.remove("hidden");
	deleteGroupButton.classList.remove("hidden");
	inputId.disabled = false;
	textareaId.disabled = false;
}

/**
 * Saves the edited group, disables the textarea, hides the save button and shows the edit button
 * @param {*} groupId
 * @param {*} textareaId
 * @param {*} editGroupButton
 * @param {*} saveGroupButton
 */
function updateGroup(
	groupId,
	inputId,
	textareaId,
	editGroupButton,
	saveGroupButton,
	deleteGroupButton,
) {
	let groupingId = getSelectedGrouping();

	editGroupButton.classList.remove("hidden");
	saveGroupButton.classList.add("hidden");
	deleteGroupButton.classList.add("hidden");
	inputId.disabled = true;
	textareaId.disabled = true;

	let newPairings = _.map(_.split(textareaId.value, "\n"), _.trim);
	let newSyllable = _.trim(inputId.value);

	let itemIx = _.findIndex(GROUPS, {
		groupid: groupId,
	});

	if (!_.eq(itemIx, -1)) {
		let updatedGroup = {
			groupid: groupId,
			possiblePairing: newPairings,
			syllable: newSyllable,
		};

		if (isGroupDifferent(GROUPS[itemIx], updatedGroup)) {
			GROUPS[itemIx] = updatedGroup;
			saveGrouping(groupingId);
		}
	}
}

function isGroupDifferent(localGroup, newGroup) {
	return !_.isEqual(localGroup, newGroup);
}

function getServerGroups(groupingId) {
    axios.post("/management/get-groups", {
		groupingId: _.toNumber(groupingId),
	}, {
		headers: {
			"Content-Type": "application/json",
		}
	})
    .then((res) => {
        let data = res.data;
        if (data.success) {
            GROUPS = data.groups;
            console.log("[getServerGroups] GROUPS ==> ", GROUPS);
        } else {
            console.error("Failed to add item:", data.error);
        }
    }).catch((error) => console.error("Error:", error));
}

function deleteGrouping(groupingSelected) {
	freezePage(true);

	axios.post("/management/delete-grouping", {
		groupingId: groupingSelected,
	}, {
		headers: {
			"Content-Type": "application/json",
		}
	})
    .then((res) => {
        let data = res.data;
        if (data.success) {
            console.log('Deleted grouping: "', groupingSelected, '", refreshing data');
            loadGroupings();
            freezePage(false);
        } else {
            console.error("Failed to add item:", data.error);
            freezePage(false);
        }
    }).catch((error) => console.error("Error:", error));
}

function deleteGroup(group) {
	let groupid = group.id;
	console.log("deleteGroup: groupid: ", groupid);

	axios.post("/management/delete-group", {
		_id: getSelectedGrouping(),
		groupid: groupid,
	}, {
		headers: {
			"Content-Type": "application/json",
		}
	})
    .then((res) => {
        let data = res.data;
        if (data.success) {
            console.log('Deleted group: "', groupid, '", refreshing data');
            let freshGroups = data.groups || [];
            GROUPS = freshGroups;
            handleGroupHtml(freshGroups);
        } else {
            console.error("Failed to delete groups:", data.error);
        }
    }).catch((error) => console.error("Error:", error));
}

function checkGroupingForm(groupingForm, groupForm) {
	if (groupingForm.classList.contains("hidden")) {
		groupForm.classList.add("padGroupspace");
	} else {
		groupForm.classList.remove("padGroupspace");
	}
}
