import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
// import  config  from '../utils/config.js';

export const verifyToken = (req, res, next)=>{
    const token = req.cookies.access_token;
    if(!token){
        return next(createError(401, "You are not authenticated!"))
    }

    jwt.verify(token,process.env.JWT_SECRET,(err, user)=>{
    if(err)  return next(createError(403, "Token is not Valid!"))
        req.user = user;
        next()
    })
}


export const verifyOwner  = (req, res, next)=>{
        if (req.user.id === req.params.id && req.user.isVerified) {
             next() 
        }else {
            return next(createError(403, "You are not Authorized!"))
        }
    
}

export const verifyAdmin  = (req, res, next)=>{
        if (req.user.isAdmin) {
             next() 
        }else {
            return next(createError(403, "You are not Authorized!"))
        }
}