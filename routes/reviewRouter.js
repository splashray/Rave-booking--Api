const express = require('express');

const { createReview, getReviewByAdmin, getAllReviewsByAdmin, getOwnerSingleReview, getOwnerReviews, getUserSingleReview, getUserReviews, deleteReview, generalHotelReviews } = require('../controllers/reviewController');
const router = express.Router()

const {isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");

// post a new review
router.post('/:bookingid', verifyToken, createReview)

//get general endpoint to be viewed by user to view all reviews by certain hotel.
router.get("/general/:hotelId", generalHotelReviews)

// get users personal all review
router.get("/usersreview/:userId/all", verifyToken, getUserReviews)

// Get users personal  id of a review
router.get("/usersreview/:userId/:reviewid", verifyToken, getUserSingleReview)

// get owners all review  --check hotel kyc
router.get("/ownersreview/:hotelid", verifyToken, isVerifiedOwner, getOwnerReviews)

// Get owners id of a review   --check hotel kyc
router.get("/ownersreview/:hotelid/:reviewid", verifyToken, isVerifiedOwner, getOwnerSingleReview)

//get reviews of all booking by Admin
router.get("/adminreview", verifyToken, verifyAdmin, getAllReviewsByAdmin)

//get single review by Admin
router.get("/adminreview/:reviewid", verifyToken, verifyAdmin, getReviewByAdmin)

router.delete("/:reviewid", verifyToken, verifyAdmin, deleteReview)

module.exports = router