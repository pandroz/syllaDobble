const _ = require('lodash');
const fs = require('fs');
// const fsSync = require('fs');

const filePath = './data/groupings.json';

function uniqueID() {
    return Math.floor(Math.random() * Date.now())
}

function getJsonData() {
    try {
        let jsonData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (e) {
        console.log('[ERROR:getJsonData()]: ', e)
        throw new Error('[ERROR: getJsonData()]: ', e)
    }
}

exports.getManagement = (req, res, next) => {
    res.render('management/management.ejs', {
        pageTitle: "Management",
        path: '/management'
    });
}

exports.getGroupings = (req, res, next) => {
    console.log('[getGroupings] called');
    try {
        let jsonData = getJsonData() || [];
        res.json({
            success: true,
            groupings: jsonData
        });
    } catch (e) {
        console.log('[ERROR: getGroupings()]: ', e)
        return {
            success: true,
            error: e
        };
    }
}

exports.getGroupingsNames = (req, res, next) => {
    try {
        let jsonData = getJsonData();
        let groupingNames = _.map(jsonData, d => {
            return {
                "_id": _.get(d, '_id'),
                "groupingName": _.get(d, 'groupingName')
            };
        });
        return groupingNames;
    } catch (e) {
        console.log('[ERROR: getGroupingsNames()]: ', e)
    }
}

exports.getGroups = async (groupingId) => {
    try {
        let jsonData = getJsonData();
        let groupingData = _.find(jsonData, {
            "_id": groupingId
        });
        let groups = _.get(groupingData, 'groups', []);

        return {
            success: true,
            groups: groups
        };
    } catch (e) {
        console.log('[ERROR: getGroups()]: ', e)
        return {
            success: false,
            error: e
        };
    }
}

exports.addNewGrouping = async (newGroupName) => {
    try {
        let jsonData = getJsonData();
        let newId = uniqueID()

        let newItem = {
            "_id": newId,
            "groupingName": newGroupName,
            "groups": []
        };

        // Add new item
        jsonData.push(newItem);

        // Write back to file
        await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

        return {
            success: true,
            newId: newId
        };
    } catch (error) {
        console.error('[addNewGrouping] Error: ', error);
        return {
            success: false
        }
    }
}


exports.saveGrouping = async (bodyData) => {
    try {
        let groupingId = _.get(bodyData, 'groupingId');
        let groups = _.get(bodyData, 'groups');
        let jsonData = getJsonData();

        let itemIx = _.findIndex(jsonData, {
            "_id": _.toNumber(groupingId)
        });

        if (!_.eq(itemIx, -1))
            jsonData[itemIx].groups = groups;

        await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

        return true;
    } catch (error) {
        console.log('[saveGroups] Error: ', error)
        return false;
    }
}

exports.deleteGrouping = async (groupingId) => {
    try {
        let jsonData = getJsonData();

        let itemIx = _.findIndex(jsonData, {
            "_id": _.toNumber(groupingId)
        });

        if (!_.eq(itemIx, -1)) {
            jsonData.splice(itemIx, 1);
        } else {
            return {
                success: false,
                error: "No grouping found with this id"
            };
        }

        await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

        return {
            success: true
        };
    } catch (error) {
        console.log('[deleteGrouping] Error: ', error)
        return false;
    }
}

exports.deleteGroup = async (data) => {
    try {
        let jsonData = getJsonData();
        let groupingId = _.get(data, '_id');
        let groupToDelete = _.get(data, 'groupid');

        let groups = [];

        let itemIx = _.findIndex(jsonData, {
            "_id": _.toNumber(groupingId)
        });

        if (!_.eq(itemIx, -1)) {
            let groupIx = _.findIndex(jsonData[itemIx].groups, {
                "groupid": groupToDelete
            });

            if (!_.eq(groupIx, -1)) {
                jsonData[itemIx].groups.splice(groupIx, 1);
                groups = jsonData[itemIx].groups;

                await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

                return {
                    groups: groups,
                    success: true
                }

            } else {
                return {
                    success: false,
                    error: "[deleteGroup()] No group found with id: " + groupToDelete
                };
            }
        } else {
            return {
                success: false,
                error: "[deleteGroup()] No grouping found with id" + groupingId
            };
        }
    } catch (error) {
        console.log('[deleteGrouping] Error: ', error)
        return {
            success: false,
            error: error
        };
    }
}

