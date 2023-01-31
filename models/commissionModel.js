const mongoose = require('mongoose')

const CommissionSchema = new mongoose.Schema({
    bookingId:{type: String, required: true},
    userId: {type: String, required: true},
    hotelId:{type: String, required: true},
    price:{type: Number, required: true},
    commission:{type: Number, required: true},
    
},{timestamps:true})

module.exports = mongoose.model("Commission", CommissionSchema)
