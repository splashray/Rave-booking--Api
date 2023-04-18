const express = require('express');
const { createBooking, getBooking, getBookings, getOwnerSingleBookings, getOwnerBookings, getUserSingleBookings, getUserBookings, validatePaymentType, paymentVerification, paymentRegeneration,  deleteBookingOnCanceledPayment } = require('../controllers/bookingController');
const router = express.Router()

const {isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");

const { cancelReservation, checkinBooking, checkoutBooking, refundBooking } = require('../controllers/ownerHotelWalletController');

// create booking by everyone --
router.post("/:hotelId", verifyToken, validatePaymentType, createBooking)

//payment verification
router.post('/paystack/verify', verifyToken,  paymentVerification)

//payment url regeneration
router.post('/paystack/regenerate/:id', verifyToken, paymentRegeneration)

//get all booking by an admin--
router.get("/",verifyToken, verifyAdmin, getBookings)

// get users personal all boooking
router.get("/usersbooking/:userId", verifyToken, getUserBookings)

// Get users personal  id of a booking
router.get("/usersbooking/:userId/:bookingId", verifyToken, getUserSingleBookings)

// get all owner's boooking    --check hotel kyc
router.get("/ownersbooking/:hotelId", verifyToken, isVerifiedOwner, getOwnerBookings)

// Get booking by owner     --check hotel kyc
router.get("/ownersbooking/:hotelId/:bookingId", verifyToken, isVerifiedOwner, getOwnerSingleBookings)

//get a single booking by an admin
router.get("/getBookingAdmin/:userId/:bookingId", verifyToken, verifyAdmin, getBooking)

//Updating the Booking status and commission
router.put('/actions/:bookingRecordId/cancel', verifyToken, cancelReservation);
router.put('/actions/:bookingRecordId/checkin', verifyToken, checkinBooking);
router.put('/actions/:bookingRecordId/checkout', verifyToken, checkoutBooking);
router.put('/actions/:bookingRecordId/refund', verifyToken, refundBooking);


// Delete 
router.delete("/:bookingId",verifyToken, deleteBookingOnCanceledPayment)





module.exports = router