const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    bookingid: {type:String, required: true, unique: true},
    user: { type: String, required: true },
    email:{type: String, required: true},
    hotelId :  {type: String, required: true},
    hotelName :  {type: String, required: true},
    hotelAddress: {type: String, required: true},
    image :  {type: String, required: true},
    firstName :  {type: String, required: true},
    content :  {type: String, required: true},
    starRating :  {type: Number, required: true},
    submitted:{ type: Boolean, default: false },
 
},{timestamps:true})

module.exports = mongoose.model('reviews', ReviewSchema)
