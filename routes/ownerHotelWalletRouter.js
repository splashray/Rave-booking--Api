const express = require('express')
const router = express.Router()

const {isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");
const { addCommissionDataManual, getWalletIdByHotelId, getWalletDataByHotelIdAndMonthId, getCommissionRecordsofLast3MonthByHotelId } = require('../controllers/ownerHotelWalletController');


//create manual commission
router.post("/:bookingId/create/:userId",verifyToken, verifyAdmin, addCommissionDataManual)

//get wallet by hotel id commission
router.get('/wallet/:hotelId', verifyToken, isVerifiedOwner,  getWalletIdByHotelId);

//get month commission by hotel id commission
router.get('/wallet/:hotelId/month/:monthId',verifyToken, isVerifiedOwner,  getWalletDataByHotelIdAndMonthId);

//get last 3 month commissions by hotel id 
router.get('/wallet/:hotelId/threemonthago',verifyToken, isVerifiedOwner,  getCommissionRecordsofLast3MonthByHotelId);


// update manual commission
// router.put("/:commissionId/edit",verifyToken, verifyAdmin,  )

// delete manual commission
// router.delete("/:commissionId",verifyToken, verifyAdmin, )

// get a commission by Admin
// router.get("/:commissionId",verifyToken, )

// get all commission by Admin
// router.get("/", verifyToken, verifyAdmin, )

module.exports = router