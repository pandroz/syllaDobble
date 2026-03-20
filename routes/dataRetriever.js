const express = require('express');
const router = express.Router();

const dataRetrieverController = require('../controllers/dataRetriever');

router.get('/modals', dataRetrieverController.getModals);

router.get('/dialogs', dataRetrieverController.getDialogs);


module.exports = router;