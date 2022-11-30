const bcrypt = require('bcryptjs')
const User = require('../models/userModel')
const createError = require('../utils/error')


 const updateUser = async (req, res, next)=>{
    // #swagger.tags = ['Users']
    // #swagger.description = 'Endpoint to update User's details.'

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            {$set: req.body},
            {new: true}
            )
        if(!updatedUser) return next(createError(401, "User Not Found'!"))
            res.status(200).json({updatedUser:updatedUser, message:`User's details updated`})
    } catch (err) {
        next(err)
    }
}
 const updateUserPassword = async (req, res, next)=>{
    // #swagger.tags = ['Users']
    // #swagger.description = 'Endpoint to update User's password.'
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.npassword, salt)
    
        const user = await User.findById(req.params.id)
        if(!user){ 
            return next(createError(401, "User Not Found'!"))
        }else{
            const  isPasswordCorrect = await bcrypt.compare(req.body.opassword, user.password)
            if(!isPasswordCorrect){
                return next(createError(400, "Old Password is wrong"))
            }else{
             user.password =  hash || user.password 
            const updatedUser = await user.save()
            res.status(200).json({updatedUser: updatedUser, message:`Password updated`})
            }
        }
    } catch (err) {
        next(err)
    }
}

 const deleteUser = async (req, res, next)=>{
    // #swagger.tags = ['Users']
    // #swagger.description = 'Endpoint to Delete User.'
    try {
       const user =  await User.findByIdAndDelete(req.params.id)
       if(!user) return next(createError(401, "User Not Found'!"))
        res.status(200).json({message:`User wth Id:${req.params.id} deleted`})
    } catch (err) {
        next(err)
    }
}

 const getUser = async (req, res, next)=>{
    // #swagger.tags = ['Users']
    // #swagger.description = 'Endpoint to Get a User.'
    try {
        const user = await User.findById( req.params.id)
         if(!user) return next(createError(401, "User Not Found'!"))
            res.status(200).json({user:user}) 
    } catch (err) {
        next(err)
    }
}

 const getUsers = async (req, res, next)=>{
    // #swagger.tags = ['Users']
    // #swagger.description = 'Endpoint to Get all Users.'
    try {
        const users = await User.find()
        if(!users) return next(createError(401, "Users Not Found'!"))
            res.status(200).json({users:users})
    } catch (err) {
        next(err)
    }
}



module.exports ={
    updateUser, updateUserPassword, deleteUser, getUser, getUsers
}