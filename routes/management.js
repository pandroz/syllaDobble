const express = require('express');
const router = express.Router();

const managementController = require('../controllers/management');

// GET
router.get('/', managementController.getManagement);

router.get('/get-groupings', managementController.getGroupings);

router.get('/get-groups', managementController.getGroups);

router.get('/get-groupings-names', managementController.getGroupingsNames);

// POST
router.post('/save-grouping', managementController.saveGrouping);

router.post('/add-new-grouping', managementController.addNewGrouping);

router.post('/delete-grouping', managementController.deleteGrouping);



module.exports = router;