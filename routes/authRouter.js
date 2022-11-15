const express = require('express')
const router = express.Router()

const { checkEmail, checkUserEmail, ownerLogin, ownerRegister, userLogin, userRegister } = require("../controllers/authController");

//Only Owner sections
router.post("/owner/register/check",checkEmail)

router.post("/owner/register", ownerRegister)
router.post("/owner/login", ownerLogin)

//Only Admin/users sections
router.post("/user/register/check",checkUserEmail)
router.post("/user/register", userRegister)
router.post("/user/login", userLogin)

module.exports = router