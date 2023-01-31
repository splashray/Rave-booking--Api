const express = require('express')
const router = express.Router()

const { checkEmail, checkUserEmail, ownerLogin, ownerRegister, userLogin, userRegister, ownerVerification, forgotPassword, changePassword, sendOwnerOtp } = require("../controllers/authController");

//Only Owner sections
router.post("/owner/register/check",checkEmail)
router.get("/owner/sendOwnerOtp/:ownerId", sendOwnerOtp)
router.post("/owner/verify", ownerVerification)
router.post("/owner/register", ownerRegister)
router.post("/owner/login", ownerLogin)

//Only Admin/users sections
router.post("/user/register/check",checkUserEmail)
router.post("/user/register", userRegister)
router.post("/user/login", userLogin)

router.post("/forgotpassword", forgotPassword)
router.post("/changepassword/:token", changePassword)

module.exports = router