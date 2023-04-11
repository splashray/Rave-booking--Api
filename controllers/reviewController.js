const Review = require('../models/reviewModel')
const Booking = require('../models/bookingModel')
const createError = require('../utils/error')

const createReview  = async (req, res, next)=>{
    // #swagger.tags = ['Review']
    // #swagger.description = 'Endpoint to create Review for a hotel through booking.'
    try {
        const {fullName, location, reviewTitle, reviewContent, starRating} = req.body

        const bookid = req.params.bookingid
        if (!bookid)  return next(createError(400, "Booking Id required!"))

        const booking =  await Booking.findOne({'bookingRecords._id':bookid, })
       
        if (!booking){
           return next(createError(404, "Booking  not found!")) 
        } 
        const bookingRecord = booking.bookingRecords.find(record => record._id.toString() === bookid);
        if (!bookingRecord) {
          return res.status(404).json({ message: 'Booking record not found' });
        }
    
        if(bookingRecord.bookingInfo.isCheckIn.status === false){ return next(createError(404, "Booking  not Checkin, Kindly Checkin first!"))
        }
 
        const bookingHotelId = bookingRecord.hotelDetails.hotelId
        const bookingUser = req.user.id;

        const cBookingId = await Review.findOne({bookingid:bookid})
        if(!cBookingId){
            const newReview = new Review({ 
                 bookingid: bookid,
                 userId: bookingUser, 
                 hotelId : bookingHotelId,

                 fullName: fullName || "Anonymous",
                 location: location,
                 reviewTitle: reviewTitle || "Honest Review", 
                 reviewContent: reviewContent, 
                 starRating: starRating
            })
            await newReview.save()
            if(!newReview) return next(createError(500, "Review not created'!"))
             res.status(201).json({review: newReview, message: "Thanks for your honest review of the reservation."})
        }else{
            return next(createError(400, "Review already created for the booking!"))
        }

    } catch (err) {
        next(err)
    }
}

const generalHotelReviews = async (req, res, next) => {
    // #swagger.tags = ['Review']
    // #swagger.description = 'Endpoint to get reviews of a particular hotel sorted by date.'
    try {
      const hotelid = req.params.hotelId;
      if (!hotelid) return next(createError(400, "Hotel ID required!"));
  
      // Set default limit to 10 or use the client-provided limit
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  
      const reviews = await Review.find({ hotelId: hotelid })
        .sort({ createdAt: -1 }) // sort by date (latest first)
        .limit(limit); // limit to the specified number of reviews
  
      if (!reviews || reviews.length === 0)
        return next(createError(404, "Reviews not found for your hotel!"));
      res.status(200).json({ reviews });
    } catch (err) {
      next(err);
    }
};

const getUserReviews = async (req, res, next)=>{
    // #swagger.tags = ['Review']
    // #swagger.description = 'Endpoint to Get Reviews of all booking by users.'
    try {
        const userId =  req.params.userId
        const allReviews = await Review.find({userId:userId})
         if(!allReviews || allReviews.length === 0) return next(createError(401, "All Reviews are Not Found'!"))
            res.status(200).json({allReviews: allReviews}) 
    } catch (err) {
        next(err)
    }
}

const getUserSingleReview = async (req, res, next)=>{
    // #swagger.tags = ['Review']
   // #swagger.description = 'Endpoint to Get  single Review of booking by users.'
   try {
       const reviewId =  req.params.reviewid
       const userId =  req.params.userId
       if (!reviewId && !userId)  return next(createError(400, "Review Id required!"))
       const review = await Review.findOne({_id:reviewId, userId: userId})
        if(!review || review.length === 0) return next(createError(401, "Review Not Found!"))
           res.status(200).json({review:review}) 
   } catch (err) {
       next(err)
   }
}

const getOwnerReviews = async (req, res, next)=>{
    // #swagger.tags = ['Review']
    // #swagger.description = 'Endpoint to Get Reviews of all booking of a particular owner.'
    try {
          // Set default limit to 10 or use the client-provided limit
          const limit = req.query.limit ? parseInt(req.query.limit) : 10;

        const hotelid =  req.params.hotelid
        const allReviews = await Review.find({hotelId: hotelid})
        .sort({ createdAt: -1 }) // sort by date (latest first)
        .limit(limit); // limit to the specified number of reviews

         if(!allReviews || allReviews.length === 0) return next(createError(401, "All Reviews are Not Found'!"))
            res.status(200).json({allReviews: allReviews}) 
    } catch (err) {
        next(err)
    }
}

const getOwnerSingleReview = async (req, res, next)=>{
    // #swagger.tags = ['Review']
   // #swagger.description = 'Endpoint to Get single Review of booking of a particular owner.'
   try {
       const reviewId =  req.params.reviewid
       const hotelid =  req.params.hotelid
       if (!reviewId && !hotelid)  return next(createError(400, "Review Id required'!"))
       const review = await Review.findOne({_id:reviewId,hotelId: hotelid})
        if(!review && review.length === 0) return next(createError(401, "Review Not Found or not assocaited with your hotel'!"))
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
          // Set default limit to 10 or use the client-provided limit
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  
      
        const allReviews = await Review.find()
        .sort({ createdAt: -1 }) // sort by date (latest first)
        .limit(limit); // limit to the specified number of reviews

         if(!allReviews && allReviews.length === 0) return next(createError(401, "All Reviews are Not Found'!"))
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
    createReview, getAllReviewsByAdmin, getReviewByAdmin, getOwnerSingleReview, getOwnerReviews, getUserSingleReview, getUserReviews, deleteReview, generalHotelReviews
}

