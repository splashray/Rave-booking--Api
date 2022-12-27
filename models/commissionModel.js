const mongoose = require('mongoose')

const CommissionSchema = new mongoose.Schema({
    bookingId:{type: String, required: true},
    user: {type: String, required: true},
    email:{ type: String, required: true},
    hotelDetails:{
        hotelId:{type: String, required: true},
        hotelName:{type:String, required:true},
    },
    roomDetails:{
        noOfRooms:{type: Number, required: true},
        nightsNumber:{type: Number, required: true},
        checkIn:{type: String, required: true},
        checkOut:{ type: String, required: true},
        guestCount:  [{ picked: String, amount: Number}],
        oneRoom: [{roomType: String, singlePrice: Number}]
    },

    BookingStatus:{
        cancelReservation:{ type: Boolean,default: false},
        confirmCheckIn:{ type: Boolean, 
            default: false},
        confirmCheckOut:{ type: Boolean, 
            default: false}
    },
    price:{type: Number, required: true},
    commission:{type: Number, required: true},
    commissionPayable:{ type: Number, default: 0},

},{timestamps:true})

module.exports = mongoose.model("Commission", CommissionSchema)
