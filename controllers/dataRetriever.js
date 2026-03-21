const fs = require("fs");
const path = require("path");

const folderPath = "./data";

function getJsonData() {
    try {
        let jsonData = fs.readFileSync(filePath, "utf8");
        return JSON.parse(jsonData);
    } catch (e) {
        console.log("[ERROR:getJsonData()]: ", e);
        throw new Error("[ERROR: getJsonData()]: ", e);
    }
}

exports.getModals = (req, res, next) => {
    try {
        res.status(200).json(JSON.parse(fs.readFileSync(path.join(folderPath, "modals.json"), "utf8")));
    } catch (error) {
        console.log("[ERROR:getModals()]: ", error);
        res.status(500).json({error});
    }
}

exports.getDialogs = (req, res, next) => {
    try {
        res.status(200).json(JSON.parse(fs.readFileSync(path.join(folderPath, "dialogs.json"), "utf8")));
    } catch (error) {
        console.log("[ERROR:getModals()]: ", error);
        res.status(500).json({error});
    }
}