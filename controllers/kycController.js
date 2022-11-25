const Kyc = require('../models/kycModel')
const Owner = require('../models/ownerModel')
const createError = require('../utils/error')

const createKyc  = async (req, res, next)=>{
    // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to create Kyc Details of owner.'
    try {
        const newKyc = new Kyc({ ...req.body, user: req.user.id, email:req.user.email, submitted: true })
        await newKyc.save()
         res.status(200).json({kyc: newKyc, message: "Your Kyc Details has been sent and awaiting verification, An Email will be sent to you once verified."})
    } catch (err) {
        next(err)
    }
}

 const updateKyc = async (req, res, next)=>{
    // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to update Kyc Details of owner.'
    try {
        const updatedKyc = await Kyc.findByIdAndUpdate(
            req.params.id, 
            {$set: req.body},
            {new: true}
            )
        if(!updatedKyc) return next(createError(401, "KYC form Not Found'!"))

            res.status(200).json({updatedOwner:updatedKyc, message:`Kyc's Status updated`})
    } catch (err) {
        next(err)
    }
}

const updateFailedKycByAdmin = async (req, res, next)=>{
    try {
        const updatedKycStatus = await Kyc.findByIdAndUpdate(
            req.params.id, 
            {$set: {...req.body,
                verified: false,VerificationMessage:req.body.VerificationMessage}},
            {new: true}
            )
        if(!updatedKycStatus) return next(createError(401, "KYC form Not Found'!"))
            res.status(200).json({updatedOwner:updatedKycStatus, message:`Kyc's Status updated`})
    } catch (err) {
        next(err)
    }
}

const updateSuccessKycByAdmin = async (req, res, next)=>{
    try {
        const updatedKycStatus = await Kyc.findByIdAndUpdate(
            req.params.id, 
            {$set: {...req.body, 
                VerificationMessage: `KYC Verification is Successful`,
                verified: true}},
            {new: true}
            )

         if(!updatedKycStatus){ next(createError(401, "KYC form Not Found'!"))}
         else{
            const updatedKycOwner = await Owner.findByIdAndUpdate(
                req.params.ownerid, 
                {$set: {isKyc: true}},
                {new: true}
             )
             if(!updatedKycOwner)return next(createError(401, "Error in Updating Owner to Verifed KYC'!"))
         }
             
        res.status(200).json({updatedOwner:updatedKycStatus, message:`Kyc's Status updated`})
    } catch (err) {
        next(err)
    }
}

const deleteKycByAdmin = async (req, res, next)=>{
    try {
       const deleteKyc =  await Kyc.findByIdAndDelete(req.params.id)
       if(!deleteKyc) return next(createError(401, "Kyc Details Not Found'!"))
        res.status(200).json({message:`KYC Details wth Id:${req.params.id} deleted`})
    } catch (err) {
        next(err)
    }
}

 const getKyc = async (req, res, next)=>{
    try {
        const kycDetails = await Kyc.findById( req.params.id)
         if(!kycDetails) return next(createError(401, "Owner kyc Details Not Found'!"))
            res.status(200).json({kycDetails:kycDetails}) 
    } catch (err) {
        next(err)
    }
}


const getKycByAdmin = async (req, res, next)=>{
    try {
        const kycDetails = await Kyc.findById( req.params.id)
         if(!kycDetails) return next(createError(401, "Owner kyc Details Not Found'!"))
            res.status(200).json({kycDetails:kycDetails}) 
    } catch (err) {
        next(err)
    }
}

const getAllOwnersKycByAdmin = async (req, res, next)=>{
    try {
        const kycDetails = await Kyc.find()
         if(!kycDetails) return next(createError(401, "Owners kyc Details are Not Found'!"))
            res.status(200).json({kycDetails: kycDetails}) 
    } catch (err) {
        next(err)
    }
}



module.exports ={
    createKyc, updateKyc, updateSuccessKycByAdmin, getKyc, getKycByAdmin, getAllOwnersKycByAdmin, deleteKycByAdmin, updateFailedKycByAdmin
}