const express = require('express');
const { createBooking, getBooking, getBookings, deleteBooking, getOwnerSingleBookings, getOwnerBoookings, getUserSingleBookings, getUserBoookings } = require('../controllers/bookingController');
const router = express.Router()

const { isKycOwner, isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");

// create booking by everyone
router.post("/", verifyToken, createBooking)

//get
router.get("/:id", verifyToken, verifyAdmin, getBooking)

//get all
router.get("/",verifyToken, verifyAdmin, getBookings)

// get users personal all boooking
router.get("/usersbook/all", verifyToken, getUserBoookings)

// Get users perosnal  id of a booking
router.get("/usersbook/:bookid", verifyToken, getUserSingleBookings)

// get owners all boooking
router.get("/ownersbooking/:hotelid", verifyToken, isKycOwner, getOwnerBoookings)

// Get owners id of a booking
router.get("/ownersbooking/:hotelid/:bookingid", verifyToken, isKycOwner, getOwnerSingleBookings)

// // Delete 
router.delete("/:id",verifyToken, deleteBooking)





module.exports = router