const mongoose = require('mongoose')

const HotelSchema = new mongoose.Schema({
    category:{
        type: String,
        default: `hotel`
    },
    hotelCustomId:{type: String, required: true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    email:{type: String, required: true},
    hotelBasicInfo: {
        hotelName:    {type: String, required: true},
        starRating:   {type: String, required: true},
        contactName:  {type: String, required: true},
        contactPhone: {type: String, required: true},
        altPhone:     {type: String, required: true},
        ManyHotelOptions:  {type: String, default: `no`},
        streetAddress:  {type: String, required: true},
        city: {type: String, required: true},
        state:     {type: String, required: true},
        country:  {type: String, required: true},
    },
    rooms:{
        type: [String],
    },
    hotelFS: {
        parking:  {type: String, required: true},
        breakfast: {type: String, required: true},
        staffLang: {type: String, required: true},
        facilitiesOption: [{ option: String }],
    },
    hotelAmenities: {
        extraBedOption:{type: String, required: true},
        amenitiesOption: [{ option: String }],
    },
    photos:{
        type: [{ photo: String }],
    },
    hotelPolicies: {
        checkInFrom:{type: String},
        checkInTo:{type: String},
        checkOutFrom:{type: String},
        checkOutTo:{type: String},
        children: {type: String},
        pet: {type: String},
    },
    hotelPayment: {
        cardPayment: {type: String, required: true},
        commissionPaymentName: {type: String, required: true},
    },
    desc:{
        type: String,
        required: true,
    },
    rating:{
        type: Number,
        min: 0,
        max: 5,
    },
    verified:{
        type: Boolean,
        default: false,
    },
    bookable:{
        type: Boolean,
        default: false,
    },
    featured:{
        type: Boolean,
        default: false,
    },
    isKyc:{
        type: Boolean,
        default: false,
    },
    submittedKyc:{
        type: String,
        enum: ["not-submitted", "in-Review", "failed", "success"],
        default: "not-submitted"
    },
    hotelKycId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Kyc-Details'
    },

},{timestamps:true})

module.exports = mongoose.model('Hotel', HotelSchema)
