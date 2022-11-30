const bcrypt = require('bcryptjs')
const Owner = require('../models/ownerModel')
const createError = require('../utils/error')

 const updateOwner = async (req, res, next)=>{
    // #swagger.tags = ['Owners']
    // #swagger.description = 'Endpoint to update Owner's Details.'
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
 const updateOwnerPassword = async (req, res, next)=>{
    // #swagger.tags = ['Owners']
    // #swagger.description = 'Endpoint to update Owner's Password.'
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

 const deleteOwner = async (req, res, next)=>{
    // #swagger.tags = ['Owners']
    // #swagger.description = 'Endpoint to Delete  a Owner's Details.'
    try {
        const owner =  await Owner.findByIdAndDelete(req.params.id )
        if(!owner) return next(createError(401, "Owner Not Found'!"))
        res.status(200).json({message:`Property Owner with Id:${req.params.id} deleted`})
    } catch (err) {
        next(err)
    }
}

 const getOwner = async (req, res, next)=>{
    // #swagger.tags = ['Owners']
    // #swagger.description = 'Endpoint to Get a Owner's Details.'
    try {
        const owner = await Owner.findById(req.params.id)
        if(!owner) return next(createError(401, "Owner Not Found'!"))
        res.status(200).json({owner:owner})
    } catch (err) {
        next(err)
    }
}

 const getOwners = async (req, res, next)=>{
    // #swagger.tags = ['Owners']
    // #swagger.description = 'Endpoint to Get all Owners.'
    try {
        const owners = await Owner.find()
        if(!owners) return next(createError(401, "Owner Not Found'!"))
        res.status(200).json({owners:owners})
    } catch (err) {
        next(err)
    }
}


module.exports ={
    updateOwner, updateOwnerPassword, deleteOwner, getOwner, getOwners
}