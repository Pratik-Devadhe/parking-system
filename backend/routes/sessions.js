const express = require("express");
const router = express.Router();

const sessionController =require("../controllers/sessions.js");


router.get(
    "/",
    sessionController.getAllSessions
);


module.exports = router;