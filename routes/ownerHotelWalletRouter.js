const express = require('express')
const router = express.Router()

const {isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");
const { addCommissionDataManual } = require('../controllers/ownerHotelWalletController');


//create manual commission
router.post("/:bookingId/create/:userId",verifyToken, verifyAdmin, addCommissionDataManual)

// update manual commission
// router.put("/:commissionId/edit",verifyToken, verifyAdmin,  )

// delete manual commission
// router.delete("/:commissionId",verifyToken, verifyAdmin, )

// get a commission by Admin
// router.get("/:commissionId",verifyToken, )

// get all commission by Admin
// router.get("/", verifyToken, verifyAdmin, )

module.exports = router