const express = require("express");
const { renderLogin, createDomain } = require("../controllers");
const { isLoggedIn } = require("../middlewares");

const router = express.Router();

router.post("/domain", isLoggedIn, createDomain);
router.get("/", renderLogin);

module.exports = router;
