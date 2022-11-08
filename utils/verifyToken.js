import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import  config  from '../utils/config.js';

// export const verifyToken = (req, res, next)=>{
//     const token = req.cookies.access_token;
//     if(!token){
//         return next(createError(401, "You are not authenticated!"))
//     }

//     jwt.verify(token,config.JWT_SECRET,(err, user)=>{
//     if(err)  return next(createError(403, "Token is not Valid!"))
//         req.user = user;
//         next()
//     })
// }


// export const verifyOwner  = (req, res, next)=>{
//         if (req.user.id === req.params.id && req.user.isVerified) {
//              next() 
//         }else {
//             return next(createError(403, "You are not Authorized!"))
//         }
    
// }

// export const verifyAdmin  = (req, res, next)=>{
//         if (req.user.isAdmin) {
//              next() 
//         }else {
//             return next(createError(403, "You are not Authorized!"))
//         }
// }


export const generateToken = (user) => {
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
      config.JWT_SECRET
    );
  };
  
  
  export const verifyToken = (req, res, next) =>{
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
  
  export const  verifyAdmin  = (req, res, next) =>{
    if(req.user && req.user.isAdmin){
      next()
    }else{
      res.status(401).send({message: 'You are not Authorized!'})
    }
  }

  export const  isVerifiedOwner  = (req, res, next) =>{
    if(req.user && req.user.isVerified){
      next()
    }else{
      res.status(401).send({message: 'You have not been Authorized and Verified as owner!'})
    }
  }

  export const  isKycOwner  = (req, res, next) =>{
    if(req.user && req.user.isKyc){
      next()
    }else{
      res.status(401).send({message: 'You have not been Authorized as owner, Do your KYC!'})
    }
  }