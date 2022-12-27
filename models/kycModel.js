const mongoose = require('mongoose')

const KycSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email:{type: String, required: true},
    PropertyDetails: {
        fullNameOfTheAccommodation: {type: String, required: true},
        addressStreetName: {type: String, required: true},
        zipCode: {type: String, required: true},
        townCity: {type: String, required: true},
        country:  {type: String, required: true},
    },
    ownerOfProperty:{
        propertyOwner: { type: String, required: true, enum: ["individualEntity", "businessEntity"]},

        individualEntity:{
            firstName:{ type: String},
            lastName:{ type: String},
            dob:{ type: String}
        },
        businessEntity:{
            fullNameOfBusinessEntity:{ type: String},
            operationOfBusinessName: { type: String},
            bnRc : { type: String},
            addressOfBusinessEntity : { type: String},
            unitNumberOfBusinessEntity : { type: Number},
            cityOfBusinessEntity : { type: String},
            zipCodeOfBusinessEntity : { type: Number},
            countryOfBusinessEntity : { type: String},
            firstNameOfBeneficialOwner: { type: String},
            lastNameOfBeneficialOwner: { type: String},
            dobOfBeneficialOwner: { type: String},
        }

    },
    managerOfProperty:{
        propertyManagerType: { type: String, required: true, enum: ["owner", "propertyManager", "managementCompany"]},

        propertyManager:{
            ManagerFullName:{ type: String},
            ManagerDob:{ type: String}
        },
        ManagementCompany:{
            fullNameOfManagementCompany:{ type: String},
            addressOfManagementCompany : { type: String},
            unitNumberOfManagementCompany : { type: Number},
            cityOfManagementCompany : { type: String},
            zipCodeOfManagementCompany : { type: Number},
            countryOfManagementCompany : { type: String},
            firstNameOfManagementCompany: { type: String},
            lastNameOfManagementCompany: { type: String},
            dobOfManagementCompany: { type: String},
        }
    },


    
    VerificationMessage:{type: String, default:`Processing`},
    submitted:{
        type: Boolean,
        default: false,
    },
    verified:{
        type: Boolean,
        default: false,
    },

},{timestamps:true})

module.exports = mongoose.model('Kyc-Details', KycSchema)
