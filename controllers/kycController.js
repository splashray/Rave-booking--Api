const Kyc = require('../models/kycModel')
const Hotel = require('../models/hotelModel')

const createError = require('../utils/error')
const { sendNewHotelKycEmail, sendHotelKycVerfiedEmail, sendHotelKycFailedEmail } = require('../utils/email')

const createKyc  = async (req, res, next)=>{
    // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to create Kyc Details of owner.'
    try {
        const hotelId = req.params.hotelId
        const checkStatus = await Hotel.findOne({
            _id:hotelId, submittedKyc: "not-submitted", isKyc: false
        })
        if(!checkStatus) return next(createError(401, "KYC form is  In-Review already || Not allowed to Create KYC'!"))

        const newKyc = new Kyc({ ...req.body, 
            hotelId: hotelId,
            ownerId: req.user.id, 
            ownerEmail :req.user.email, 
        })
       const savedKyc = await newKyc.save()

       if(!savedKyc){
        return next(createError(400, "KYC form Not saved'!"))
       }else{
        const updatedHotel = await Hotel.findByIdAndUpdate(
        hotelId, {$set: {
            submittedKyc: "in-Review", 
            hotelKycId: savedKyc._id
        }},{new: true})

        if(!updatedHotel) return next(createError(401, "Error in Updating Owner to submittedKyc - in-Review'!"))

          //send email to notify the owner
          sendNewHotelKycEmail(updatedHotel, res)

          res.status(200).json({savedKyc,
          message: "Your Kyc Details has been sent and awaiting verification, An Email will be sent to you once verified."
          })
  
       } 
    } catch (err) {
        next(err)
    }
}

 const updateKyc = async (req, res, next)=>{
    // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to update Kyc Details of owner.'
    try {
        const hotelKycId = req.params.id
        const checkStatus = await Hotel.findOne({
            hotelKycId:hotelKycId, submittedKyc: "failed", isKyc: false
        })
        if(!checkStatus) return next(createError(401, "KYC form is  In-Review already || Not allowed to Update KYC'!"))

        const updatedKyc = await Kyc.findByIdAndUpdate(
            hotelKycId, 
            {$set: {...req.body, 
                VerificationMessage: `KYC Details has been resent for Verification`,
              }},
            {new: true}
        )
        if(!updatedKyc){ return next(createError(401, "KYC form Not Found'!"))
         }else{
            
        const hotelId = updatedKyc.hotelId
        const updatedKycOwner = await Hotel.findOneAndUpdate(
            hotelId, 
            {$set: {isKyc: false,
                submittedKyc:"in-Review"
            }},
            {new: true}
         )
         if(!updatedKycOwner)return next(createError(401, "Error in Updating Owner's hotel to in-Review KYC'!"))

            res.status(200).json({updatedKyc,
                            message:`Kyc's Details updated`
            })
    }

    } catch (err) {
        next(err)
    }
}

const updateFailedKycByAdmin = async (req, res, next)=>{
    // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to update (Failed Kyc By Admin) Kyc Details of owner.'
    try {
        const updatedKycStatus = await Kyc.findByIdAndUpdate(
            req.params.id, 
            {$set: {
            VerificationMessage:req.body.VerificationMessage||`KYC Verification Failed`
            }},
            {new: true}
            )
        if(!updatedKycStatus){
            return next(createError(401, "KYC form Not Found'!"))
        }else{
            
            const hotelId = updatedKycStatus.hotelId
            const verification_message = updatedKycStatus.VerificationMessage

            const updatedKycOwner = await Hotel.findByIdAndUpdate(
                hotelId, 
                {$set: {isKyc: false,
                    submittedKyc:"failed"
                }},
                {new: true}
             )
             if(!updatedKycOwner)return next(createError(401, "Error in Updating Owner's hotel to failed KYC'!"))

             sendHotelKycFailedEmail(updatedKycOwner,verification_message, res) 

            res.status(200).json({updatedOwner:updatedKycStatus, message:`Kyc's Status updated`})
        }
        
          
    } catch (err) {
        next(err)
    }
}

const updateSuccessKycByAdmin = async (req, res, next)=>{
    // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to update (Success Kyc By Admin) Kyc Details of owner.'
    try {
        const updatedKycStatus = await Kyc.findByIdAndUpdate(
            req.params.id, 
            {$set: {...req.body, 
                VerificationMessage: req.body.VerificationMessage||`KYC Verification is Successful`,
              }},
            {new: true}
            )

         if(!updatedKycStatus){ next(createError(401, "KYC form Not Found'!"))}
         else{
            const hotelId = updatedKycStatus.hotelId
            const verification_message = updatedKycStatus.VerificationMessage

            const updatedKycOwner = await Hotel.findByIdAndUpdate(
                hotelId, 
                {$set: {isKyc: true,
                    submittedKyc:"success",
                    bookable: true,
                    featured: true   
                }},
                {new: true}
             )
             if(!updatedKycOwner)return next(createError(401, "Error in Updating Owner's hotel to Verifed KYC'!"))

        sendHotelKycVerfiedEmail(updatedKycOwner,verification_message, res) 

        res.status(200).json({updatedKycStatus, message:`Kyc's Status updated to success`})
         }
    } catch (err) {
        next(err)
    }
}

const deleteKycByAdmin = async (req, res, next)=>{
     // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to delete (Delete Kyc By Admin) Kyc Details of owner.'
    try {
       const deleteKyc =  await Kyc.findByIdAndDelete(req.params.id)
       if(!deleteKyc) return next(createError(401, "Kyc Details Not Found'!"))
        res.status(200).json({message:`KYC Details wth Id:${req.params.id} deleted`})
    } catch (err) {
        next(err)
    }
}

const getKyc = async (req, res, next)=>{
    // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to get Kyc Details of owner.'
    try {
        const hotelKycId = req.params.id

        const kycDetails = await Kyc.findById(hotelKycId)
         if(!kycDetails) return next(createError(401, "Owner kyc Details Not Found'!"))
            res.status(200).json({kycDetails:kycDetails}) 
    } catch (err) {
        next(err)
    }
}

const getKycStatus = async (req, res, next)=>{
    // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to get Kyc Details of owner.'
    try {
        const hotelKycId = req.params.id
        const kycDetails = await Hotel.findOne({hotelKycId:hotelKycId})
         if(!kycDetails) return next(createError(401, "Owner kyc Status Not Found'!"))
        const isKyc = kycDetails.isKyc
        const submittedKyc = kycDetails.submittedKyc

        res.status(200).json({isKyc, submittedKyc }) 
    } catch (err) {
        next(err)
    }
}

const getKycByAdmin = async (req, res, next)=>{
     // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to Get (Get Kyc By Admin) Kyc Details of owner.'
    try {
        const kycDetails = await Kyc.findById( req.params.id)
         if(!kycDetails) return next(createError(401, "Owner kyc Details Not Found'!"))
            res.status(200).json({kycDetails:kycDetails}) 
    } catch (err) {
        next(err)
    }
}

const getAllOwnersKycByAdmin = async (req, res, next)=>{
    // #swagger.tags = ['Kyc']
    // #swagger.description = 'Endpoint to Get (get All Owner Kyc By Admin) Kyc Details of owner.'
    try {
        const kycDetails = await Kyc.find()
         if(!kycDetails) return next(createError(401, "Owners kyc Details are Not Found'!"))
            res.status(200).json({kycDetails: kycDetails}) 
    } catch (err) {
        next(err)
    }
}



module.exports ={
    createKyc, updateKyc, updateSuccessKycByAdmin, getKyc, getKycStatus, getKycByAdmin, getAllOwnersKycByAdmin, deleteKycByAdmin, updateFailedKycByAdmin
}
