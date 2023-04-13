const Owner = require('../models/ownerModel')
const Otp = require('../models/otpModel')
const User = require('../models/userModel')
const PasswordReset = require('../models/passwordResetModel')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const cron = require('node-cron')

const createError = require('../utils/error')
const {generateToken} = require('../utils/verifyToken')
const { sendOwnerVerificationEmail, sendChangePasswordEmail, sendOwnerVerificationSuccessEmail } = require('../utils/email')
const config = require('./../utils/config')


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

//Only Owner sections
 const checkEmail  = async (req, res, next)=>{
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint to Check Owner's Email.'
        try {
            const {email} = req.body
           const cEmail = await Owner.findOne({email:email})
           if(!cEmail) return res.status(200).json({message: "Email address available."})  
           res.status(400).json({message: "Email address already existed, choose another one."}) 
        } catch (err) {
            next(err)
        }
}

 const ownerRegister  = async (req, res, next)=>{
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint to Register Owner's Account.'
    try {
        // const { firstName, lastName, email, phoneNumber, password } = req.body;
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)

        const newOwner = new Owner({ ...req.body, password:hash})
        await newOwner.save();
        res.status(201).json({ newOwner, message: 'Otp has been sent to the email address provided' });

    } catch (err) {
        res.status(500).json({ message: 'An error occurred while creating owner', err });
        console.log(err)
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
        if(!signinOwner) return next(createError(404, "Owner not found"))

        if(!signinOwner.isVerified) {
           next(createError(401, "Your Account has not been verified")) 
        }else{
            const  isPasswordCorrect = await bcrypt.compare(password, signinOwner.password)
            if(!isPasswordCorrect) return next(createError(400, "Wrong password or Email!"))
            
            res.status(200).send({
                _id: signinOwner._id,
                firstName: signinOwner.firstName,
                lastName: signinOwner.lastName,
                phoneNumber: signinOwner.phoneNumber,
                email: signinOwner.email,
                isVerified: signinOwner.isVerified,
           
                token: generateToken(signinOwner),
            })
        }

    } catch (err) {
        next(err)
    }
} 

    // Schedule task to run every 1 week
    // cron.schedule('0 0 0 * * 1', function() {
    //     // Code to delete unverified owners
    //     Owner.deleteMany({ isVerified: false }, function(err) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log("Successfully deleted unverified Owners.");
    //         }
    //     });
    // });

  // The cron expression 0 0 0 * * 1 means that the task will run every Sunday at midnight (00:00:00).

// const owner = await Owner.findOne({ ownerId }).select('email firstName lastName isVerified').exec();


//other owners sections
const sendOwnerOtp = async (req, res, next) => {
        // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint to send Owner's OTP to their email.'
    try {
    const ownerId = req.params.ownerId;
    console.log(ownerId);

    const owner = await Owner.findOne({ _id: ownerId }).exec();
    if (!owner || owner.isVerified) {
    return res.status(401).send({ error: !owner ? "No Owner with this Id" : "Owner is already verified" });
    }
    const { email, firstName, lastName } = owner;
        // Check to see if we already have an OTP for this owner
        const existingOtp = await Otp.findOne({ owner: ownerId }).exec();
    
        let newOtp;
        let otp;
        // Only generate a new OTP if one does not already exist
        if (!existingOtp) {
            newOtp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
            // const otp = crypto.randomBytes(3).toString('hex');
            otp = await Otp.create({
                owner: ownerId,
                otp: newOtp
            })
        } else {
            // Use existing OTP
            newOtp = existingOtp.otp;
            otp = existingOtp;
        }

    const link = `${config.SITE_URL}/owners/verifyEmail`;
    senderHandler(email, firstName, lastName, newOtp, link,  otp,  res);

    } catch (err) {
        console.log(err); 
        res.status(500).send({error:"Operation failed, Can't send otp to owner"})
    }
}

    const senderHandler = async (email, firstName, lastName, newOtp, link, otp, res) => {
        console.log(firstName, lastName, email, newOtp);
        const emailSent = await sendOwnerVerificationEmail({ firstName, lastName, email, newOtp, link}, res);    
        if (!emailSent) {
            Otp.findByIdAndDelete(otp._id).exec;
            return res.status(500).send({error:"Operation failed"})
        }
        return res.status(200).json({message: "OTP has been sent to your email" })
    }


const ownerVerification = async (req, res, next) => {
        // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint to Verify Owner's Account via OTP.'
    try {
        const { email, otp } = req.body;
        const owner = await Owner.findOne({ email });
        if (!owner) return res.status(404).json({ message: 'Owner not found' });

        const otpDoc = await Otp.findOne({ owner: owner._id }).exec()
        if (!otpDoc) return res.status(404).json({ message: 'OTP not found or Expired' });

        if (otpDoc.otp !== otp) return res.status(401).json({ message: 'Invalid or Expired OTP' });
        // if (otpDoc.expires < new Date()) return res.status(401).json({ message: 'OTP expired' });

        owner.isVerified = true;
        await owner.save();
        await otpDoc.remove();
        await sendOwnerVerificationSuccessEmail({owner, email, res })

        return res.status(200).json({ message: 'Owner verified successfully' });

    } catch (error) {
        res.status(500).json({ message: 'An error occurred while verifying owner', error });
    }
}

/// May need to change this part to otp as well
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

    const link = `${config.SITE_URL}/changepassword/${token}`

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


module.exports ={
    checkEmail, ownerRegister, ownerLogin, checkUserEmail, userRegister, userLogin, sendOwnerOtp, ownerVerification, forgotPassword, changePassword
}