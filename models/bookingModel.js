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
                checkIn:{type: Date, required: true},
                checkOut:{ type: Date, required: true},
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
        
            // Booking Status details
            BookingStatus:{
                hotelStatus:{type: String,
                    enum: ['Pending','Confirmed','Check-In','Check-Out','Cancelled','Expired','No-Show'],
                    default: "Pending"
                },

                Confirmed:[{ 
                    status: {type:Boolean, default: false},
                    date:{type: Date, default:Date.now } 
                }],
                cancelReservation:[{ 
                    status: {type:Boolean, default: false},
                    date:{type: Date, default:Date.now } 
                }],
                isCheckIn:[{ 
                    status: {type:Boolean, default: false},
                    date:{type: Date, default:Date.now } 
                }],
                isCheckOut:[{ 
                    status: {type:Boolean, default: false},
                    date:{type: Date, default:Date.now } 
                }],
                isReview: [{ 
                    status: {type:Boolean, default: false},
                    date:{type: Date, default:Date.now } 
                }],
            },
            
        }

    ],
    
},{timestamps:true})

module.exports = mongoose.model("Bookings", BookingSchema)
