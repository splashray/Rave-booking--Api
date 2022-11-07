import Owner from "../models/ownerModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import  config  from '../utils/config.js';
import jwt from "jsonwebtoken";

//Only Owner sections
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
        const  owner = await Owner.findOne({email:req.body.email}) 
        if(!owner) return next(createError(404, "User not found"))
        const  isPasswordCorrect = await bcrypt.compare(req.body.password, owner.password)
        if(!isPasswordCorrect) return next(createError(400, "Wrong password or Email!"))

         const token = jwt.sign(
            {id: owner._id, isVerified: owner.isVerified},
            config.JWT_SECRET
         )
       
        const {password, isVerified, ...otherDetails } = owner._doc
        res
        .cookie("access_token", token, {
            httpOnly: true,
        })
        .status(200)
        .json({details:{...otherDetails}, isVerified})
    } catch (err) {
        next(err)
    }
} 

//Only Users/Admin sections
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
        const  user = await User.findOne({email:req.body.email}) 
        if(!user) return next(createError(404, "User not found"))
        const  isPasswordCorrect = await bcrypt.compare(req.body.password, user.password)
        if(!isPasswordCorrect) return next(createError(400, "Wrong password or Email!"))

         const token = jwt.sign(
            {id: user._id, isAdmin: user.isAdmin},
            config.JWT_SECRET
         )
       
        const {password, isAdmin, ...otherDetails } = user._doc
        res
        .cookie("access_token", token, {
            httpOnly: true,
        })
        .status(200)
        .json({details:{...otherDetails}, isAdmin})
    } catch (err) {
        next(err)
    }
} 