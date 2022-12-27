const Review = require('../models/reviewModel')
const Booking = require('../models/bookingModel')
const createError = require('../utils/error')

const createReview  = async (req, res, next)=>{
    // #swagger.tags = ['Review']
    // #swagger.description = 'Endpoint to create Review for a hotel through booking.'
    try {
        const bookid = req.params.bookingid
        if (!bookid)  return next(createError(400, "Booking Id required!"))

        const getBooking =  await Booking.findOne({_id:bookid})
        const bookingUser = getBooking.user
        const bookingEmail = getBooking.email
        const bookingHotelId = getBooking.hotelDetails.hotelId
        const bookingHotelName = getBooking.hotelDetails.hotelName
        const bookingHotelAddress = getBooking.hotelDetails.hotelAddress
        const bookingFirstName = getBooking.userDetails.firstName


        const cBookingId = await Review.findOne({bookingid:bookid})
        if(!cBookingId){
            const newReview = new Review({ 
                ...req.body,
                 bookingid: bookid,
                 user: bookingUser, 
                 email: bookingEmail, 
                 hotelId : bookingHotelId,
                 hotelName : bookingHotelName,
                 hotelAddress: bookingHotelAddress,
                 firstName: bookingFirstName,
                 submitted: true 
            })
            await newReview.save()
            if(!newReview) return next(createError(500, "Review not created'!"))
             res.status(200).json({review: newReview, message: "Thanks for your honest review of the reservation."})
        }else{
            return next(createError(400, "Review already created for the booking!"))
        }

    } catch (err) {
        next(err)
    }
}

const getUserReviews = async (req, res, next)=>{
    // #swagger.tags = ['Review']
    // #swagger.description = 'Endpoint to Get Reviews of all booking by users.'
    try {
        const userEmail =  req.params.email
        const allReviews = await Review.find({email:userEmail})
         if(!allReviews) return next(createError(401, "All Reviews are Not Found'!"))
            res.status(200).json({allReviews: allReviews}) 
    } catch (err) {
        next(err)
    }
}

const getUserSingleReview = async (req, res, next)=>{
    // #swagger.tags = ['Review']
   // #swagger.description = 'Endpoint to Get  single Review of booking by users.'
   try {
       const reviewid =  req.params.reviewid
       const userEmail =  req.params.email
       if (!reviewid)  return next(createError(400, "Review Id required!"))
       const review = await Review.findOne({_id:reviewid, email: userEmail})
        if(!review) return next(createError(401, "Review Not Found!"))
           res.status(200).json({review:review}) 
   } catch (err) {
       next(err)
   }
}

const getOwnerReviews = async (req, res, next)=>{
    // #swagger.tags = ['Review']
    // #swagger.description = 'Endpoint to Get Reviews of all booking of a particular owner.'
    try {
        const hotelid =  req.params.hotelid
        const allReviews = await Review.find({hotelId: hotelid})
         if(!allReviews) return next(createError(401, "All Reviews are Not Found'!"))
            res.status(200).json({allReviews: allReviews}) 
    } catch (err) {
        next(err)
    }
}

const getOwnerSingleReview = async (req, res, next)=>{
    // #swagger.tags = ['Review']
   // #swagger.description = 'Endpoint to Get single Review of booking of a particular owner.'
   try {
       const reviewid =  req.params.reviewid
       const hotelid =  req.params.hotelid
       if (!reviewid)  return next(createError(400, "Review Id required'!"))
       const review = await Review.findOne({_id:reviewid,hotelId: hotelid})
        if(!review) return next(createError(401, "Review Not Found'!"))
           res.status(200).json({review:review}) 
   } catch (err) {
       next(err)
   }
}

const getReviewByAdmin = async (req, res, next)=>{
     // #swagger.tags = ['Review']
    // #swagger.description = 'Endpoint to Get  single Review of booking by users.'
    try {
        const reviewid =  req.params.reviewid
        if (!reviewid)  return next(createError(400, "Review Id required'!"))
        const review = await Review.findById(reviewid)
         if(!review) return next(createError(401, "Review Not Found'!"))
            res.status(200).json({review:review}) 
    } catch (err) {
        next(err)
    }
}

const getAllReviewsByAdmin = async (req, res, next)=>{
    // #swagger.tags = ['Review']
    // #swagger.description = 'Endpoint to Get Reviews of all booking by users.'
    try {
        const allReviews = await Review.find()
         if(!allReviews) return next(createError(401, "All Reviews are Not Found'!"))
            res.status(200).json({allReviews: allReviews}) 
    } catch (err) {
        next(err)
    }
}

const deleteReview = async (req, res, next)=>{
    // #swagger.tags = ['Review']
    // #swagger.description = 'Endpoint to Delete Review of a booking by users.'
    try {
        const reviewid =  req.params.reviewid
        if (!reviewid)  return next(createError(400, "Review Id required'!"))
        const allReviews = await Review.findByIdAndDelete({_id:reviewid})
         if(!allReviews) return next(createError(401, "Review can not been deleted'!"))
            res.status(200).json({message: "Review has been deleted"}) 
    } catch (err) {
        next(err)
    }
}

module.exports ={
    createReview, getAllReviewsByAdmin, getReviewByAdmin, getOwnerSingleReview, getOwnerReviews, getUserSingleReview, getUserReviews, deleteReview
}

