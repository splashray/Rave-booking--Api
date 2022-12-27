const express = require('express');

const { createReview, getReviewByAdmin, getAllReviewsByAdmin, getOwnerSingleReview, getOwnerReviews, getUserSingleReview, getUserReviews, deleteReview } = require('../controllers/reviewController');
const router = express.Router()

const {isKycOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");

// post a new review
router.post('/:bookingid', verifyToken, createReview)

// get users personal all review
router.get("/usersreview/:email/all", verifyToken, getUserReviews)

// Get users personal  id of a review
router.get("/usersreview/:email/:reviewid", verifyToken, getUserSingleReview)

// get owners all review
router.get("/ownersreview/:hotelid", verifyToken, isKycOwner, getOwnerReviews)

// Get owners id of a review
router.get("/ownersreview/:hotelid/:reviewid", verifyToken, isKycOwner, getOwnerSingleReview)

//get reviews of all booking by Admin
router.get("/adminreview", verifyToken, verifyAdmin, getAllReviewsByAdmin)

//get single review by Admin
router.get("/adminreview/:reviewid", verifyToken, verifyAdmin, getReviewByAdmin)

router.delete("/:reviewid", verifyToken, verifyAdmin, deleteReview)

module.exports = router