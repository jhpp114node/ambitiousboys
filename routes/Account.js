const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router.get("/account", accountController.account_get);
router.delete("/:id", accountController.account_delete);
module.exports = router;
