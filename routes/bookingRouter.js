const express = require('express');
const { createBooking, getBooking, getBookings, getOwnerSingleBookings, getOwnerBoookings, getUserSingleBookings, getUserBoookings } = require('../controllers/bookingController');
const router = express.Router()

const {isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");

// create booking by everyone --
router.post("/:hotelId", verifyToken, createBooking)

//get all booking by an admin--
router.get("/",verifyToken, verifyAdmin, getBookings)

// get users personal all boooking
router.get("/usersbooking/:userId", verifyToken, getUserBoookings)

// Get users personal  id of a booking
router.get("/usersbooking/:userId/:bookingId", verifyToken, getUserSingleBookings)

// get all owner's boooking    --check hotel kyc
router.get("/ownersbooking/:hotelId", verifyToken, isVerifiedOwner, getOwnerBoookings)

// Get booking by owner     --check hotel kyc
router.get("/ownersbooking/:hotelId/:bookingId", verifyToken, isVerifiedOwner, getOwnerSingleBookings)

//get a single booking by an admin
router.get("/getBookingAdmin/:userId/:bookingId", verifyToken, verifyAdmin, getBooking)

// // Delete 
// router.delete("/:bookingId",verifyToken, verifyAdmin,  deleteBooking)





module.exports = router