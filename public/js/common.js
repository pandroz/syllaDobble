// import modals from './modalsData/modals.json' with {type: "json"}
// import dialogs from './dialogsData/dialogs.json' with {type: "json"}

let modals, dialogs;

Promise.all([getModals(), getDialogs()]).then((values) => {
	modals = values[0].data;
    dialogs = values[1].data;
});



const dialogForm = '<form method="dialog"><button>OK</button></form>';

function openModal(modalJSONId) {
	let baseModalHtml = _.get(_.find(modals, { _id: "modal_baseHtml" }), "body");
	let modalData = _.find(modals, { _id: modalJSONId });

	baseModalHtml = _.replace(baseModalHtml, "##TitleText##", _.get(modalData, "title"));
	baseModalHtml = _.replace(baseModalHtml, "##BodyText##", _.get(modalData, "bodyText"));
	let modalElement = document.getElementById("modal_tutorial");
	modalElement.innerHTML = baseModalHtml;
	modalElement.style.display = "block";
}

function closeModal(modalId) {
	modalId.style.display = "none";
}

function onerror(errorMessage) {
	let dialog = document.getElementById("messageDialog");
	errorMessage = `<div><p>${errorMessage}</p>${dialogForm}</div>`;
	dialog.innerHTML = errorMessage;
	dialog.showModal();
}

function openDialog(dialogId, dialogType) {
	let dialogElement = document.getElementById("dialogData");
	dialogElement.className = "dialogContainer";

	let baseDialogData = _.find(dialogs, { _id: "dialog_baseHtml" });
	let baseDialogHTML = _.get(baseDialogData, "body");
	let baseDialogButton = _.get(baseDialogData, "defaultButton");
	let dialogData = _.find(dialogs, { _id: dialogId });

	baseDialogHTML = _.replace(baseDialogHTML, "##DialogTitle##", _.get(dialogData, "title"));
	baseDialogHTML = _.replace(baseDialogHTML, "##DialogMessage##", _.get(dialogData, "body"));
	baseDialogHTML = _.replace(baseDialogHTML, "##DialogButton##", _.get(dialogData, "customButton", baseDialogButton));

	dialogElement.innerHTML = baseDialogHTML;

	if (dialogType === "error") {
		dialogElement.classList.add("error");
	}

	if (dialogType === "success") {
		dialogElement.classList.add("success");
	}

	dialogElement.showModal();
}

function toggleForm(form, buttonId) {
	if (form.classList.contains("hidden")) {
		form.classList.remove("hidden");
	} else {
		form.classList.add("hidden");
	}
}

/**
 * Renders the full page spinner, won't remove itself unless called again with false parameter
 * @param {Boolean} isToFreeze
 */
function freezePage(isToFreeze) {
	let fullpageSpinner = document.getElementById("fullpage-spinner");

	if (isToFreeze) {
		fullpageSpinner.classList.remove("hidden");
	} else {
		fullpageSpinner.classList.add("hidden");
	}
}

function getModals() {
	return axios.get("/data/modals").then((res) => {
		if (res.status === 200) return res;
		else return {};
	});
}

function getDialogs() {
    return axios.get("/data/dialogs").then((res) => {
		if (res.status === 200) return res;
		else return {};
	});
};
