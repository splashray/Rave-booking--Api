const mongoose = require('mongoose')

const PasswordResetSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    token:{
        type: String,
        required: true
    },
})

module.exports = mongoose.model('PasswordReset', PasswordResetSchema)