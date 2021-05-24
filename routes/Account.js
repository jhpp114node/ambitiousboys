const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router.get("/account", accountController.account_get);

module.exports = router;
