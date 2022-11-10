import Owner from "../models/ownerModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import { generateToken } from "../utils/verifyToken.js";

//Only Owner sections
export const checkEmail  = async (req, res, next)=>{
        try {
            const {email} = req.body
           const cEmail = await Owner.findOne({email:email})
           if(!cEmail){ res.status(200).json({message: "Email address available."})  }
           else{ res.status(400).json({message: "Email address already existed, choose another one."}) }
        } catch (err) {
            next(err)
        }
}

export const ownerRegister  = async (req, res, next)=>{
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)

        const newOwner = new Owner({
            ...req.body,
            password:hash,
        })
        await newOwner.save()
         res.status(200).json({message: "Property Owner has been created."})
    } catch (err) {
        next(err)
    }
}

export const ownerLogin  = async (req, res, next)=>{
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
export const checkUserEmail  = async (req, res, next)=>{
    try {
        const {email} = req.body
       const cEmail = await User.findOne({email:email})
       if(!cEmail){ res.status(200).json({message: "Email address available."})  }
       else{ res.status(400).json({message: "Email address already existed, choose another one."}) }
    } catch (err) {
        next(err)
    }
}

export const userRegister  = async (req, res, next)=>{
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

export const userLogin  = async (req, res, next)=>{
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