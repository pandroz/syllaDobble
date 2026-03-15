const express = require('express');
const router = express.Router();

const logobbleController = require('../controllers/logobble');

router.get('/', logobbleController.getLogobble);

module.exports = router;