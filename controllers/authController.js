const Owner = require('../models/ownerModel')
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const createError = require('../utils/error')
const {generateToken} = require('../utils/verifyToken')


//Only Owner sections
 const checkEmail  = async (req, res, next)=>{
        try {
            const {email} = req.body
           const cEmail = await Owner.findOne({email:email})
           if(!cEmail){ res.status(200).json({message: "Email address available."})  }
           else{ res.status(400).json({message: "Email address already existed, choose another one."}) }
        } catch (err) {
            next(err)
        }
}

 const ownerRegister  = async (req, res, next)=>{
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)

        const newOwner = new Owner({
            ...req.body,
            password:hash,
        })
        
        const saveResult = await newOwner.save()

         res.status(200).json({message: "Property Owner has been created."})
    } catch (err) {
        console.log(err)

        if(err.code === 11000){
            res.status(400).json({message: "Email address not available. Please specify another email address."})
        }else{
            next(err)
        }
    }
}

 const ownerLogin  = async (req, res, next)=>{
    try { 
        const {email, password} = req.body
        //empty login parameters
        
        if(email ==="" || password ==="") return next(createError(400, "password or Email field is Empty!"))
        
        const  signinOwner = await Owner.findOne({email:email.toLowerCase()})

        if(!signinOwner) return next(createError(404, "User not found"))
        
        const  isPasswordCorrect = await bcrypt.compare(password, signinOwner.password)
        
        if(!isPasswordCorrect) return next(createError(400, "Wrong password or Email!"))
        
        res.status(200).send({
            _id: signinOwner._id,
            firstName: signinOwner.firstName,
            lastName: signinOwner.lastName,
            phoneNumber: signinOwner.phoneNumber,
            email: signinOwner.email,
            isVerified: signinOwner.isVerified,
            isKyc: signinOwner.isKyc,
            token: generateToken(signinOwner),
        })

    } catch (err) {
        next(err)
    }
} 

//Only Users/Admin sections
 const checkUserEmail  = async (req, res, next)=>{
    try {
        const {email} = req.body
       const cEmail = await User.findOne({email:email})
       if(!cEmail){ res.status(200).json({message: "Email address available."})  }
       else{ res.status(400).json({message: "Email address already existed, choose another one."}) }
    } catch (err) {
        next(err)
    }
}

const userRegister  = async (req, res, next)=>{
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)

        const newOwner = new User({
            ...req.body,
            password:hash,
        })
        await newOwner.save()
        res.status(200).json({message: "User has been created."})
    } catch (err) {
        next(err)
    }
}

 const userLogin  = async (req, res, next)=>{
    try {
        const {email, password} = req.body
        //empty login parameters
        if(email ==="" || password ==="") return next(createError(400, "password or Email field is Empty!"))

        const  signinUser = await User.findOne({email:email.toLowerCase()}) 
        if(!signinUser) return next(createError(404, "User not found"))
        const  isPasswordCorrect = await bcrypt.compare(password, signinUser.password)
        if(!isPasswordCorrect) return next(createError(400, "Wrong password or Email!"))

        res.status(200).send({
            _id: signinUser._id,
            firstName: signinUser.firstName,
            lastName: signinUser.lastName,
            phoneNumber: signinUser.phoneNumber,
            email: signinUser.email,
            isAdmin: signinUser.isAdmin,
            token: generateToken(signinUser),
        })

    } catch (err) {
        next(err)
    }
} 

module.exports ={
    checkEmail, ownerRegister, ownerLogin, checkUserEmail, userRegister, userLogin
}