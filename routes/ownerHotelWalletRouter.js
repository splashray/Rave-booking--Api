const express = require('express')
const router = express.Router()

const {isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");
const { addCommissionDataManual } = require('../controllers/ownerHotelWalletController');


//create manual commission
router.post("/:hotelId/create/:bookingId/:userId",verifyToken, verifyAdmin, addCommissionDataManual)

// //update commission
// router.put("/pass/:id",verifyToken, updateUserPassword)

// //update user image
// router.put("/image/:id",verifyToken, updateUserProfileDp)

// //delete
// router.delete("/:id",verifyToken, verifyAdmin, deleteUser)

// //get
// router.get("/:id",verifyToken, getUser)

// //get all
// router.get("/", verifyToken, verifyAdmin, getUsers)

module.exports = router