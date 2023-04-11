const mongoose = require('mongoose');

const CommissionWalletModelSchema = new mongoose.Schema({
    hotelId:{type: mongoose.Schema.Types.ObjectId,  ref: 'Hotel', required:true },
    balance: {type: Number, required: true , default: 0},
    commissionYetToPay: {type: Number, required: true , default: 0},
    commissionPaidToCompany: {type: Number, required: true, default: 0},
    
    commissionRecords:[{     
        customBookingId:{type: String, required: true},
        userId: {type: String, required: true},
        price:{type: Number, required: true},
        commission:{type: Number, required: true},
        paymentStatus:{type: Boolean, default: false, required: true},
        date:{type: Date, default:Date.now },

        paymentSettlement:{
          status: {type: String, enum:['unsettled', 'settledToOwner','settledToCompany']},
          date: {type: Date}
        }
        
    }],

},{timestamps:true});

module.exports = mongoose.model("Commission-Wallet", CommissionWalletModelSchema)


//2. Commission of 10% per the total amount of the booking will start calculating when checked-in AND update commission amount when checkout date is extended.

// If onsite user checkin , we will call the users and hotel to confirm to ensure they checkin and the hotel will recieve a new payment in your commission wallet as yet to pay.

// 