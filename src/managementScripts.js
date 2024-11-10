import jsonData from '../public/managementPage/testingJson.json' with {type: "json"};
import _ from 'lodash';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export function getGroupings() {
    let groupingNames = _.map(jsonData, d => {
        return {
            _id: _.get(d, '_id'),
            groupingName: _.get(d, 'groupingName')
        };
    });
    return groupingNames;
}

export async function addNewGrouping(newGroupName) {
    const filePath = './public/managementPage/testingJson.json';

    try {
        let jsonData = [];

        // Check if file exists
        if (existsSync(filePath)) {
            const data = await fs.readFile(filePath, 'utf8');
            jsonData = JSON.parse(data);
        }

        // Validate that jsonData is an array
        if (!Array.isArray(jsonData)) {
            jsonData = [];
        }

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
        console.error('Error:', error);
        return {
            success: false
        }
    }
}


function uniqueID() {
    return Math.floor(Math.random() * Date.now())
}



