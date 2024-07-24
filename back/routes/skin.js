// conversation.js

const express = require('express');
const router = express.Router();
const skinController = require('../controllers/skin.js'); // Make sure the path to your controller file is correct
const { isAuth } = require("../middelwares/auth");
const checkRole = require('../middelwares/role');

router.delete('/deleteCapture/:captureId',isAuth , skinController.deleteCapture);
router.get('/getCaptures', isAuth ,skinController.getCaptures);
router.get('/getCapture/:captureId', isAuth ,skinController.getCapture);
module.exports = router;
