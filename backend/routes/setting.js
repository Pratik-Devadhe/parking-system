const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.js');

router.get('/', settingController.getSettings);
router.get('/stats', settingController.getAdminStats);
router.put('/:key', settingController.updateSetting);

module.exports = router;
