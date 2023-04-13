const mongoose = require('mongoose');

const OwnerHotelWalletModelSchema = new mongoose.Schema({
    hotelId:{type: mongoose.Schema.Types.ObjectId,  ref: 'Hotel', required:true },
    balance: {type: Number, required: true , default: 0},
    commissionYetToPay: {type: Number, required: true , default: 0},
    commissionPaidToCompany: {type: Number, required: true, default: 0},
    
    commissionRecords:[{  
        bookingId:{type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Bookings', unique:true},
        customBookingId:{type: String, required: true},
        userId: {type: String, required: true},
        price:{type: Number, required: true},
        commission:{type: Number, required: true},
        paymentStatus:{type: Boolean, default: false, required: true},
        paymentType:{ type:String, enum: ['online','onsite'], required: true },
        date:{type: Date, default:Date.now },

        paymentSettlement:{
          status: {type: String, enum:['unsettled To Owner', 'settled To Owner','settled To Company']},
          date: {type: Date}
        } 
    }],

      // transactions that shows how the payment is released to the owner and from owner to company
    transactionRecords:[{   
        amount: {type:Number, required:true},
        type:{type: String, required:true, enum:['credit','debit','fund','withdrawal']},
        date:{type: Date, default:Date.now },
        desc:{type: String, required:true, default:`Payment Unspecified`},
        currency: {type: String, required:true, default:`NGN`},
    }],


},{timestamps:true});

module.exports = mongoose.model("OwnerHotel-Wallet", OwnerHotelWalletModelSchema)


//1.  If onsite user checkin , we will call the users and hotel to confirm to ensure they checkin and the hotel will recieve a new payment in your commission wallet as yet to pay.

//2.  Commission of 10% per the total amount of the booking will start calculating when checked-in AND update commission amount when checkout date is extended.

//3.  