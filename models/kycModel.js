const mongoose = require('mongoose')

const KycSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email:{type: String, required: true},
    PropertyDetails: {
        fullNameOfTheAccommodation: {type: String, required: true},
        addressStreetName: {type: String, required: true},
        zipCode: {type: String, required: true},
        townCity: {type: String, required: true},
        country:  {type: String, required: true},
    },
    ownerOfProperty:{type: String, required: true},
    managerOfProperty:{type: String, required: true},
    VerificationMessage:{type: String, default:`Processing`},
    submitted:{
        type: Boolean,
        default: false,
    },
    verified:{
        type: Boolean,
        default: false,
    },

},{timestamps:true})

module.exports = mongoose.model('Kyc-Details', KycSchema)
