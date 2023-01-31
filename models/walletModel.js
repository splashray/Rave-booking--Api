const mongoose = require('mongoose');
const { Schema } = require('mongoose')

const WalletSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    commissionBalance: {
        type: Number,
        required: true,
        default : 0
    },
    totalCommissionPaid: {
        type: Number,
        required: true,
        default : 0
    },
    transactions:[
        {   
            amount: {type:Number, required:true},
            type:{type: String, required:true, enum:['credit','debit',]},
            date:{type: Date, default:Date.now },

            desc:{type: String, required:true, default:`Payment Unspecified`},
            currency: {type: String, required:true, default:`NGN`},
        }
    ],

}, { timestamps: true });

module.exports = mongoose.model("Wallet", WalletSchema);