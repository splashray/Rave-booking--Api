const mongoose = require('mongoose');

const CommissionWalletModelSchema = new mongoose.Schema({
    hotelId:{type: mongoose.Schema.Types.ObjectId,  ref: 'Hotel', required:true },
    balance: {type: Number, required: true , default: 0},
    commissionYetToPay: {type: Number, required: true , default: 0},
    commissionPaidToCompany: {type: Number, required: true, default: 0},
    
    commissionRecords:[{     
        bookingId:{type: String, required: true},
        userId: {type: String, required: true},
        price:{type: Number, required: true},
        commission:{type: Number, required: true},
        hasPaid:{type: Boolean, default: false, required: true}
    }],
    TransactionRecords:[{      
      amount: {type:Number, required:true},
      type:{type: String, required:true, enum:['credit','debit','withdrawal']},
      date:{type: Date, default:Date.now },
      desc:{type: String, required:true, default:`Payment Unspecified`},
      currency: {type: String, required:true, default:`NGN`},
    }]
},{timestamps:true});

module.exports = mongoose.model("Commission-Wallet", CommissionWalletModelSchema)

