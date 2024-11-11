// import jsonData from '../public/managementPage/testingJson.json' with {type: "json"};
import _ from 'lodash';
import fs from 'fs/promises';
import * as fsSync from 'fs';

const filePath = './public/managementPage/testingJson.json';

function uniqueID() {
    return Math.floor(Math.random() * Date.now())
}

function getJsonData() {
    try {
        let jsonData = fsSync.readFileSync('./public/managementPage/testingJson.json', 'utf8');
        return JSON.parse(jsonData);
    } catch (e) {
        console.log('[ERROR:getJsonData()]: ', e)
        return []
    }
}

export function getGroupings() {
    let jsonData = getJsonData();
    let groupingNames = _.map(jsonData, d => {
        return {
            _id: _.get(d, '_id'),
            groupingName: _.get(d, 'groupingName')
        };
    });
    return groupingNames;
}

export async function addNewGrouping(newGroupName) {
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


export async function saveGrouping(bodyData) {
    try {
        let jsonData = getJsonData();

        let groupId = _.get(bodyData, 'groupid');
        let groups = _.get(bodyData, 'groups');

        let itemIx = _.findIndex(jsonData, {
            "_id": _.toNumber(groupId)
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



