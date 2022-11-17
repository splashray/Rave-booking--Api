const express = require('express');
const router = express.Router()

const { createKyc, updateKyc, deleteKycByAdmin, getKyc, getKycByAdmin, updateSuccessKycByAdmin, updateFailedKycByAdmin, getAllOwnersKycByAdmin } = require('../controllers/kycController');

const {isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");

// post a new kyc form
router.post('/', verifyToken, isVerifiedOwner, createKyc)

//update kyc form
router.put("/:id", verifyToken, isVerifiedOwner, updateKyc)

//update kyc form by admin to failed and send verfication message
router.put("/failed/:id", verifyToken, verifyAdmin, updateFailedKycByAdmin)

//update kyc form by admin to verified and send verfication message of sucessful to owners and also update the owner models to iskyc true
router.put("/success/:id/:ownerid", verifyToken, verifyAdmin, updateSuccessKycByAdmin)

//delete
router.delete("/:id",verifyToken, verifyAdmin, deleteKycByAdmin)

//get kyc details of all owners by Admin
router.get("/admin", verifyToken, verifyAdmin, getAllOwnersKycByAdmin)

//get kyc details by owners
router.get("/:id",verifyToken, isVerifiedOwner, getKyc)


//get kyc details of a owner by Admin
router.get("/admin/:id", verifyToken, verifyAdmin, getKycByAdmin)



module.exports = router