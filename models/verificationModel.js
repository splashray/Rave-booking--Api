const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const VerificationSchema = new mongoose.Schema({
    verificationId:{
        type: String,
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        required: true
    },
    createdAt: Date,
    expiresAt: Date
})

module.exports = mongoose.model('Verification', VerificationSchema)