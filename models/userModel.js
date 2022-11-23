const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    gender:{
        type: String,
        required: true,
    },
    
    title:{
        type: String,
    },
    address:{
        type: String,
    },
    image:{
        type: String,
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
},{timestamps:true})

module.exports = mongoose.model("User", UserSchema)
