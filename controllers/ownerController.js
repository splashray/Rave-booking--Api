import bcrypt from "bcryptjs";
import Owner from "../models/ownerModel.js"
import { createError } from "../utils/error.js";

export const updateOwner = async (req, res, next)=>{
    try {
        const updatedOwner = await Owner.findByIdAndUpdate(
            req.params.id, 
            {$set: req.body},
            {new: true}
            )
            if(!updatedOwner) return next(createError(401, "Owner Not Found'!"))
            res.status(200).json({updatedOwner:updatedOwner, message:`Property Owner's details updated`})
    } catch (err) {
        next(err)
    }
}
export const updateOwnerPassword = async (req, res, next)=>{
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.npassword, salt)
    
        const owner = await Owner.findById(req.params.id)
        if(!owner){ 
            return next(createError(401, "Owner Not Found'!"))
        }else{
            const  isPasswordCorrect = await bcrypt.compare(req.body.opassword, owner.password)
            if(!isPasswordCorrect){
                return next(createError(400, "Old Password is wrong"))
            }else{
             owner.password =  hash || owner.password 
            const updatedOwner = await owner.save()
            res.status(200).json({updatedOwner:updatedOwner, message:`Password updated`})
            }
        }
    } catch (err) {
        next(err)
    }
}


export const deleteOwner = async (req, res, next)=>{
    try {
        const owner =  await Owner.findByIdAndDelete(req.params.id )
        if(!owner) return next(createError(401, "Owner Not Found'!"))
        res.status(200).json({message:`Property Owner with Id:${req.params.id} deleted`})
    } catch (err) {
        next(err)
    }
}

export const getOwner = async (req, res, next)=>{
    try {
        const owner = await Owner.findById(req.params.id)
        if(!owner) return next(createError(401, "Owner Not Found'!"))
        res.status(200).json({owner:owner})
    } catch (err) {
        next(err)
    }
}

export const getOwners = async (req, res, next)=>{

    try {
        const owners = await Owner.find()
        if(!owners) return next(createError(401, "Owner Not Found'!"))
        res.status(200).json({owners:owners})
    } catch (err) {
        next(err)
    }
}