const mongoose = require('mongoose')
const BookingSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,  unique: true},
    bookingRecords:[
        {
            // booking details 
            bookingId:{type: String, required: true},
            email:{ type: String, required: true},
            price:{type: Number, required: true},
            commission:{type: Number, required: true, default: 0},
            paymentStatus: {type:Boolean, default: false},
            paymentType:{ type:String, enum: ['online','onsite'], required: true },

                // hotel details 
                hotelDetails: { 
                    hotelId: {type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required:true}, 
                    hotelEmail:{type: String, required: true},
                    hotelName:{type:String, required:true},
                    hotelAddress:{type:String, required:true},
                },

                //change checkin and out to date type
                roomDetails:{
                    noOfRooms:{type: Number, required: true},
                    nightsNumber:{type: Number, required: true},
                    checkIn:{
                        type: Date,
                        required: true,
                        // validate: {
                        //   async validator(value) {
                        //     const currentDate = new Date();
                        //     return value >= currentDate;
                        //   },
                        //   message: props => `Check-in date (${props.value}) must not be before the current date.`
                        // }
                    },
                    checkOut:{
                        type: Date,
                        required: true,
                        // validate: {
                        //     async validator(value) {
                        //         return value >= this.checkIn;
                        //     },
                        //     message: props => `Check-out date (${props.value}) must not be before check-in date.`
                        // }
                    },
                    guestCount:  [{ picked: String, amount: Number}],
                    oneRoom: [{roomType: String, singlePrice: Number}],
                }, 
            
                // user details 
                userDetails:{
                    firstName:{type: String, required: true},
                    lastName:{type: String, required: true},
                    phoneNumber:{type: String,required: true},
                    title:{type: String,enum: ['Mr','Mrs','Miss','Dr','Professor', 'Reverend','Honorable','Mayor','King','Queen','Prince','Princess','His Excellency','Her Excellency'], required: true},
                    address:{type: String, required: true},
                },
            
                // Booking information details
                bookingInfo:{
                    bookingStatus:{type: String,
                        enum: ['Pending','Active','Inactive','Cancelled','Expired', 'Refund','Closed'],
                        default: "Pending"
                    },
                    // Each part need to be updated
                    cancelReservation:{ 
                        status: {type:Boolean, default: false},
                        date:{type: Date,  } 
                    },
                    isExpired:{ 
                        status: {type:Boolean, default: false},
                        date:{type: Date,  } 
                    },
                    isCheckIn:{ 
                        status: {type:Boolean, default: false},
                        date:{type: Date, } 
                    },
                    isCheckOut:{ 
                        status: {type:Boolean, default: false},
                        date:{type: Date, } 
                    },
                    isReview: { 
                        status: {type:Boolean, default: false},
                        date:{type: Date, } 
                    },  
                    isPaymentRefund: { 
                        status: {type:Boolean, default: false},
                        date:{type: Date, } 
                    },               
                },  
            createdAt: { type: Date, default:Date.now}
        }

    ],
    
},{timestamps:true})


module.exports = mongoose.model("Bookings", BookingSchema)
