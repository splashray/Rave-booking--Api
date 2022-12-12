const mongoose = require('mongoose')

const VerificationSchema = new mongoose.Schema({
    verificationId:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
})

module.exports = mongoose.model('Verification', VerificationSchema)