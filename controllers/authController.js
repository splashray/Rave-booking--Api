const Owner = require('../models/ownerModel')
const User = require('../models/userModel')
const Verification = require('../models/verificationModel')
const PasswordReset = require('../models/passwordResetModel')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const UUID = require('pure-uuid')
const mongoose = require('mongoose')
const createError = require('../utils/error')
const {generateToken} = require('../utils/verifyToken')
const { sendOwnerVerificationEmail, sendChangePasswordEmail } = require('../utils/email')
const config = require('./../utils/config')


//Only Owner sections
 const checkEmail  = async (req, res, next)=>{
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint to Check Owner's Email.'
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
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint to Register Owner's Account.'
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)

        // Check if an existing owner has the same email with the new owner
        const emailExists = await Owner.findOne({ email: req.body.email })

        if(emailExists){
           return res.status(400).json({message: "The email address provided is in use by an existing owner."}).end()
        }

        const newOwner = new Owner({
            ...req.body,
            password:hash,
        })

        const verificationId = crypto.randomBytes(20).toString('hex')

        const hashedVerificationId = bcrypt.hashSync(verificationId, 10);

        let ownerSaved = null

        // Create a transaction to execute the two queries below
        const session = await mongoose.startSession()

        const transaction = await session.withTransaction( async () => {

            ownerSaved = await newOwner.save({session: session})            
            
            //Save the verificationId alongside the registered owner's email
            await new Verification({ verificationId: hashedVerificationId, userId: ownerSaved._id, expiresAt: Date.now() + 21600000 }).save({session: session})
            
        })

        session.endSession()
        
        if(transaction && transaction.ok){

            const verificationUrl = `https://ravebooking.netlify.app/owners/confirmation.html?verify=true&token=${verificationId}&userId=${ownerSaved._id}`
            
            const emailSent = await sendOwnerVerificationEmail(ownerSaved, res, verificationUrl)

            if(!emailSent){
                await Verification.findOneAndDelete({ userId:ownerSaved._id }).exec()

                await Owner.findByIdAndDelete(ownerSaved._id).exec();

                return res.status(500).json({message: "Registration failed"})
            }
            
            res.status(200).json({message: "Verification email has been sent"})
        }
        
        
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
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint to Login Owner's Account.'
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

//other owners sections
const ownerVerification = async (req, res, next) => {
    /**
       #swagger.tags = ['Auth']
       #swagger.description = 'Endpoint for owner verification'
       #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            $token : '42e2a46a-e56f-4e4d-be0e-0675b7026f58'
            $userId: '63984b5022a619a24fd5f033'
          }
       }
     */

    const { token, userId } = req.body

    if(!token || !userId) return res.status(400).json({ error: true, message: "Invalid verification link" })

    const verificationDoc = await Verification.findOne({ userId }).exec()
    
    if(!verificationDoc) return res.status(400).json({error: true, message: "Invalid verification details"})

    // If verification link has expired delete the owner details and verification record
    if(verificationDoc.expiresAt < Date.now()){
        await Verification.findByIdAndDelete( verificationDoc._id ).exec()

        await Owner.findByIdAndDelete(verificationDoc.userId).exec()

        return res.status(400).json({message: "Verification link has expired. Please signup again."})
    }

    const tokenMatch = bcrypt.compareSync(token, verificationDoc.verificationId);

    const ownerVerified = false;

    if(tokenMatch){

        await Verification.findByIdAndDelete( verificationDoc._id ).exec()

        // Set the owner's verified status to true
        ownerVerified = await Owner.findOneAndUpdate({ _id: verificationDoc.userId }, {isVerified: true}).exec()
    }

    if(!ownerVerified) return res.status(500).json({error: true, message: "Internal server error"})

    res.status(200).json({ error: false, message: 'Verification successful'})
}

const forgotPassword = async (req, res, next) => {
    /**
       #swagger.tags = ['Auth']
       #swagger.description = 'Endpoint for forgot password'
       #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            $email : 'test-user@mail.com'
          }
       }
     */
    const { email } = req.body

    if(!email) return res.status(400).json({error: true, message: 'No email was provided'})
       
    const userFound = await User.findOne({ email }).exec()

    if(!userFound) return res.status(400).json({error: true, message: 'No user account matches with the provided email' })

    const token = crypto.randomBytes(10).toString("hex")

    const link = `${process.env.SITE_URL}/changepassword/${token}`

    // Save the token and id of user in database
    const passResetToken = await new PasswordReset({userId: userFound._id, token}).save()

    if(!passResetToken) return res.status(500).json({ error: true,  message: "Operation failed"})

    const emailSent = await sendChangePasswordEmail({ email, link })

    if(emailSent) return res.status(200).json({error: false, message: "password reset link sent to your email account"})

    // If email was not sent, remove the saved token
    await PasswordReset.findByIdAndDelete(passResetToken._id).exec()

    return res.status(500).json({error: true, message: "Operation failed"})
} 

const changePassword = async (req, res) => {
    /**
       #swagger.tags = ['Auth']
       #swagger.description = 'Endpoint for change password'
       #swagger.parameters['path'] = {
          in: 'path',
          required: true,
          schema: {
            $token : '42e2a46a-e56f-4e4d-be0e-0675b7026f58'
          }
       }
     */
    const { token } = req.params
  
    if (!token) return res.status(400).json(handleResponse({}, "token is required"))

    const { newpassword, confirmpassword } = req.body
  
    if (!newpassword || !confirmpassword) return res.status(400).json(handleResponse({}, "newpassword and confirmpassword are required"))
  
    if (newpassword != confirmpassword) return res.status(400).json(handleResponse({}, "Both passwords do not match"))
  
    const passResetDoc = await PasswordReset.findOneAndDelete({token}).exec()

    const user = await User.findById(passResetDoc.userId)
  
    user.password = await bcrypt.hash(newpassword, 10)
  
    await user.save()
  
    res.status(200).json(handleResponse({}, "password successfully changed"))
  }


  //Only Users/Admin sections (users and Admin controller are the same)
 const checkUserEmail  = async (req, res, next)=>{
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint to Check User's Account.'
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
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint to Register User's Account.'
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
     // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint to Login User's Account.'
    try {
        const {email, password} = req.body
        //empty login parameters
        if(email ==="" || password ==="") return next(createError(400, "password or Email field is Empty!"))

        const  signinUser = await User.findOne({email:email.toLowerCase()}).exec() 
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
    checkEmail, ownerRegister, ownerLogin, checkUserEmail, userRegister, userLogin, ownerVerification, forgotPassword, changePassword
}