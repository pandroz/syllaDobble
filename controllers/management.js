const _ = require("lodash");
const fs = require("fs");
const e = require("express");
// const fsSync = require('fs');

const filePath = "./data/groupings.json";

function uniqueID() {
	return Math.floor(Math.random() * Date.now());
}

function getJsonData() {
	try {
		let jsonData = fs.readFileSync(filePath, "utf8");
		return JSON.parse(jsonData);
	} catch (e) {
		console.log("[ERROR:getJsonData()]: ", e);
		throw new Error("[ERROR: getJsonData()]: ", e);
	}
}

exports.getManagement = (req, res, next) => {
	res.render("management/management.ejs", {
		pageTitle: "Gestione Carte",
		path: "/management",
	});
};

exports.getGroupings = (req, res, next) => {
	try {
		let jsonData = getJsonData() || [];
		res.json({
			success: true,
			groupings: jsonData,
		});
	} catch (e) {
		console.log("[ERROR: getGroupings()]: ", e);
		res.status(500).json({
			success: true,
			error: e,
		});
	}
};

exports.getGroupingsNames = (req, res, next) => {
	try {
		let jsonData = getJsonData();
		let groupingNames = _.map(jsonData, (d) => {
			res.status(200).json({
				_id: _.get(d, "_id"),
				groupingName: _.get(d, "groupingName"),
			});
		});
		res.status(200).json({
			success: true,
			groupingNames: groupingNames
		});
	} catch (e) {
		console.log("[ERROR: getGroupingsNames()]: ", e);
		res.status(500).json({
			error: e
		});
	}
};

exports.getGroups = async (req, res, next) => {
	try {
		let groupingId = req.body?.groupingId;
		let jsonData = getJsonData();

		let groupingData = _.find(jsonData, {
			_id: groupingId,
		});
		let groups = _.get(groupingData, "groups", []);

		res.status(200).json({
			success: true,
			groups: groups,
		});
	} catch (e) {
		console.log("[ERROR: getGroups()]: ", e);
		res.status(500).json({
			success: false,
			error: e
		});
	}
};

exports.addNewGrouping = async (req, res, next) => {
	try {
		let newGroupName = req.body.groupName;
		let jsonData = getJsonData();
		let newId = uniqueID();

		let newItem = {
			_id: newId,
			groupingName: newGroupName,
			groups: [],
		};

		// Add new item
		jsonData.push(newItem);

		// Write back to file
		fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

		res.status(200).json({
			success: true,
			newId: newId,
		});
	} catch (error) {
		console.error("[addNewGrouping] Error: ", error);
		res.status(500).json({
			success: false,
			error
		});
	}
};

exports.saveGrouping = async (req, res, next) => {
	let bodyData = req.body;
	try {
		let groupingId = _.get(bodyData, "groupingId");
		let groups = _.get(bodyData, "groups");
		let jsonData = getJsonData();

		let itemIx = _.findIndex(jsonData, {
			_id: _.toNumber(groupingId),
		});

		if (!_.eq(itemIx, -1)) jsonData[itemIx].groups = groups;

		fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

		res.status(200).json({
			success: true,
		});
	} catch (error) {
		console.log("[saveGrouping] Error: ", error);
		res.status(500).json({
			success: false,
			error
		});
	}
};

exports.deleteGrouping = async (req, res, next) => {
	try {
		let groupingId = req.body?.groupingId;
		let jsonData = getJsonData();

		let itemIx = _.findIndex(jsonData, {
			_id: _.toNumber(groupingId),
		});

		if (!_.eq(itemIx, -1)) {
			jsonData.splice(itemIx, 1);
		} else {
			res.status(200).json({
				success: false,
				error: "No grouping found with this id",
			});
		}

		fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

		res.status(200).json({
			success: true,
		});
	} catch (error) {
		console.log("[deleteGrouping] Error: ", error);
		res.status(500).json({ error });
	}
};

exports.deleteGroup = async (req, res, next) => {
	try {
		let data = req.body;
		let jsonData = getJsonData();
		let groupingId = _.get(data, "_id");
		let groupToDelete = _.get(data, "groupid");

		let groups = [];

		let itemIx = _.findIndex(jsonData, {
			_id: _.toNumber(groupingId),
		});

		if (!_.eq(itemIx, -1)) {
			let groupIx = _.findIndex(jsonData[itemIx].groups, {
				groupid: groupToDelete,
			});

			if (!_.eq(groupIx, -1)) {
				jsonData[itemIx].groups.splice(groupIx, 1);
				groups = jsonData[itemIx].groups;

				fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

				res.status(200).json({
					groups: groups,
					success: true,
				});
			} else {
				res.status(200).json({
					success: false,
					error:
						"[deleteGroup()] No group found with id: " +
						groupToDelete,
				});
			}
		} else {
			res.status(200).json({
				success: false,
				error: "[deleteGroup()] No grouping found with id" + groupingId,
			});
		}
	} catch (error) {
		console.log("[deleteGrouping] Error: ", error);
		res.status(500).json({
			success: false,
			error: error,
		});
	}
};
