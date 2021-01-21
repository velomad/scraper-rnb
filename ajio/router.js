const express = require("express");
const router = express.Router();

const ajioController = require("./controller");

router.get("/", ajioController.ajio);

module.exports = router;
