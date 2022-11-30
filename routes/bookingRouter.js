const express = require('express');
const { createBooking, getBooking, getBookings, deleteBooking } = require('../controllers/bookingController');
const router = express.Router()

const { isKycOwner, isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");

// create hotel by everyone
router.post("/", verifyToken, createBooking)

//get
router.get("/:id",verifyToken, verifyAdmin, getBooking)

//get all
router.get("/",verifyToken, verifyAdmin, getBookings)

// Delete 
router.delete("/:id",verifyToken, verifyAdmin, deleteBooking)





module.exports = router