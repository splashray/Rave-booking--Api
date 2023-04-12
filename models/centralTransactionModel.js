const mongoose = require('mongoose');
const { Schema } = require('mongoose')

const CentralTransactionSchema = new mongoose.Schema({
    commissionWalletId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Commission-Wallet",
        unique: true
    },
    // transactions that shows how the payment is released to the owner and from owner to company
    transactions:[{   
            amount: {type:Number, required:true},
            type:{type: String, required:true, enum:['credit','debit','withdrawal']},
            date:{type: Date, default:Date.now },
            desc:{type: String, required:true, default:`Payment Unspecified`},
            currency: {type: String, required:true, default:`NGN`},
    }],

}, { timestamps: true });

module.exports = mongoose.model("Central-Transaction", CentralTransactionSchema);