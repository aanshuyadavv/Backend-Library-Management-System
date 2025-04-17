const express = require("express");
const router = express.Router();
const { signUp } = require("../controllers/SignUp");
const { login } = require("../controllers/Login");

//SignUp route
router.post("/signup", signUp);

//login route
router.post("/login", login);

module.exports = router;