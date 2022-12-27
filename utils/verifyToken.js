const jwt = require('jsonwebtoken')
const createError = require('../utils/error')
const config = require('../utils/config')

const generateToken = (user) => {
    return jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified ? user.isVerified :``,
        isKyc: user.isKyc ? user.isKyc :``
    },
      config.JWT_SECRET,
       { expiresIn: "24h" }
    );
  };
  
  
const verifyToken = (req, res, next) =>{
    const BearerToken = req.headers.authorization
    if(!BearerToken){
      res.status(401).send({message: 'You are not authenticated!'})
    }else{
      const token = BearerToken.slice(7, BearerToken.length)
      jwt.verify(token, config.JWT_SECRET,(err, data)=>{
          if(err){
            res.status(401).send({message: 'Token is not Valid!'})
          }else{
            req.user = data
            next()
          }
      })
    }
  }
  
const  verifyAdmin  = (req, res, next) =>{
    if(req.user && req.user.isAdmin){
      next()
    }else{
      res.status(401).send({message: 'You are not Authorized!'})
    }
  }

const  isVerifiedOwner  = (req, res, next) =>{
    if(req.user && req.user.isVerified){
      next()
    }else{
      res.status(401).send({message: 'You have not been Authorized and Verified as owner!'})
    }
  }

const  isKycOwner  = (req, res, next) =>{
    if(req.user && req.user.isKyc){
      next()
    }else{
      res.status(401).send({message: 'You have not been Authorized as owner, Do your KYC!'})
    }
  }

  module.exports ={
    generateToken, verifyToken, verifyAdmin, isVerifiedOwner, isKycOwner
}