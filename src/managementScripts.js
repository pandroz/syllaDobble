import jsonData from '../public/managementPage/testingJson.json' with {type: "json"}
import _ from 'lodash'

export function getGroupings() {
    let groupingNames = _.map(jsonData, d => {
        return {
            _id: _.get(d, '_id'),
            groupingName: _.get(d, 'groupingName')
        };
    });
    return groupingNames;
}