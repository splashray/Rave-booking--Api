const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expires: {
        type: Date, 
        default: Date.now, 
        expires: 300
    }, 
    
});
module.exports = mongoose.model('Otp', otpSchema);

