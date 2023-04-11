const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    bookingid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bookings', required: true,  unique: true},
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
 
    //General details to fill
    fullName :  {type: String, required: true},
    location :  {type: String, required: true},
    reviewTitle :  {type: String},
    reviewContent :  {type: String, required: true},
    starRating :  {type: Number, required: true},
 
},{timestamps:true})

module.exports = mongoose.model('reviews', ReviewSchema)
