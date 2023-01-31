const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true,
    },
    otp: {
        type: Number,
        required: true,
    },
    expires: {
        type: Date, 
        default: Date.now, 
        // expires: 300
        expireAfterSeconds: 120 // 2 mins
    }, // 5 mins
    
});
module.exports = mongoose.model('Otp', otpSchema);

