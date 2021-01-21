const express = require("express");
const router = express.Router();

const amazonController = require("./controller");

router.get("/", amazonController.amazon);

module.exports = router;
