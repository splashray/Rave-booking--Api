const swaggerAutogen = require('swagger-autogen')()
const outputFile = './swagger_output.json'
const endpointsFiles = ['./index.js']

const doc = {

    info: {
        version: "1.0.0",
        title: "Rave-Booking API",
        description: "Documentation for Rave-Boking automatically generated </b> module."
    },
    servers: [
        // {
        //   url: "http://localhost:3000",
        //   description: "Testing on Local Machine"
        // },
        {
          url: "https://rave-booking.onrender.com",
          description: "Confirmed working well"
        }
      ],
    // host: "",
    basePath: "/",
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
        JWT: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            in: 'header',
        },
    },
    tags: [
        {
            "name": "Auth",
            "description": "Authentication Endpoints"
        },
        {
            "name": "Hotels",
            "description": "Hotels Endpoints"
        },
        {
            "name": "Users",
            "description": "Users Endpoints"
        },
        {
            "name": "Users/Admin",
            "description": "Users/Admin Endpoints"
        },
        {
            "name": "Admin",
            "description": "Admin Endpoints"
        },
        {
            "name": "Owners",
            "description": "Owners Endpoints"
        },
        {
            "name": "Kyc",
            "description": "KYC Endpoints"
        },
          {
            "name": "Rooms",
            "description": "Roooms Endpoints"
        },
        {
            "name": "Bookings",
            "description": "Bookings Endpoints"
        },
        {
            "name": "Commissions",
            "description": "Commissions Endpoints"
        },
        {
            "name": "Review",
            "description": "Reviews Endpoints"
        },
        {
            "name": "Historys",
            "description": "Historys Endpoints"
        },
        
        
        
    ],
    definitions: {
        User: {
            firstName: "John",
            lastName: "John",
            email:"test@gmail.com",
            phoneNumber:"+2349031874139",
            password:"2021",
            gender:"male",
            title:"Mr.",
            address:"Ilorin, kwara state",
            image:"img.jpg",
        },
        Owner: {
            firstName: "John",
            lastName: "John",
            email:"test@gmail.com",
            phoneNumber:"+2349031874139",
            password:"2021",
            image:"img.jpg",
        },
        Room: {
            roomType:"Kings",
            smokingPolicy:"Smoking",
            numberOfRooms:16,
            bedOptions: {
                bedKinds:"Twins Bed",
                bedNo:3,
                guestMax:4,
                roomSize:39
            },
            price: 13560
        },
        Hotel: {
            hotelBasicInfo: {
                hotelName: "Kings Hotel and Suite",
                starRating: "2",
                contactName: "The Great Fichub Team",
                contactPhone: "09068658564",
                altPhone:  "08046483946",
                ManyHotelOptions:  "yes",
                streetAddress:  "223, sango area",
                city: "saro",
                state:  "osun state",
                country:  "Nigeria",
            },
            hotelFS: {
                parking: "Yes, Paid",
                breakfast: "no",
                staffLang: "English",
                facilitiesOption: [
                     {option: "free-wifi"}, {option: "room-service"},{option: "Water-park"},{option: "Garden"} 
                ]
            },
            hotelAmenities: {
                extraBedOption:"no",
                 amenitiesOption: [ {option: "spa"}, {option: "Watch"},{option: "swim"},{option: "Fly"} ]
            },
            hotelPolicies: {
                checkInFrom:"12:ooam",
                checkInTo: "9:00am",
                checkOutFrom:"12:ooam",
                checkOutTo:"6:ooam",
                children: "yes",
                pet: "yes"
            },
            hotelPayment: {
                cardPayment: "no",
                commissionPaymentName: "Ajala Dewunmi"
            },
            photos: [ 
                {photo: "one.jpg"}, 
                {option: "two.jpg"}
            ],
            desc:"best hotel in with diverse features",
            rating:5

        },
        Booking:{
            userId : "6412781be57fddc8204891b1",
            bookingId: 4353466,
            email: "booker@gmail.com",
            price: 39000,
            commission:3900,
            paymentStatus: true,
            paymentType:'online',
            bookingRecords:[{
                hotelDetails:{
                    hotelId:"63856ebfc92910673c8a412f",
                    hotelEmail: "Besthotel@gmail.com",
                    hotelName:"Grid Hotel",
                    hotelAddress:"Amazona street, ikorodu lagos"
                },
                roomDetails:{
                    roomType:"Double Arena Room",
                    noOfRooms:2,
                    nightsNumber:5,
                    checkIn:"25/11/2022",
                    checkOut:"30/11/2022",
                    guestCount:  [{picked: "Adults", amount:2 },{ picked: "Children", amount:5 }]
                },
                userDetails:{
                    firstName:"John",
                    lastName:"Tayo",
                    phoneNumber:"09031874139",
                    title:"Mr",
                    address:"32, Toke street, ikorodu"
                },
                bookingInfo:{
                    bookingStatus: "Pending",
                    // Each part need to be updated
                    cancelReservation:{ 
                        status:  false, date: Date  
                    },
                    isExpired:{ 
                        status: false,  date: Date  
                    },
                    isCheckIn:{ 
                        status: false, date: Date 
                    },
                    isCheckOut:{ 
                        status:  false, date: Date 
                    },
                    isReview: { 
                        status: false, date: Date 
                    },  
                    isPaymentRefund: { 
                        status: false, date: Date
                    },               
                },  
            createdAt: Date
            }]

        },
        Kyc:{
                "PropertyDetails": {
                "fullNameOfTheAccommodation": "DKN suite",
                "addressStreetName": "14, Shola street",
                "zipCode": "3433",
                "townCity": "ilorin",
                "country":  "Nigeria"
                },
                "ownerOfProperty":{
                    "propertyOwner": "businessEntity",
            
                    "businessEntity":{
                        "fullNameOfBusinessEntity":"GLK Suites",
                        "operationOfBusinessName": "GKL Limited",
                        "bnRc" : "Gwej3j",
                        "addressOfBusinessEntity" : "ikorodu road, lagos",
                        "unitNumberOfBusinessEntity" : 243435,
                        "cityOfBusinessEntity" : "lagos",
                        "zipCodeOfBusinessEntity" : 353513,
                        "countryOfBusinessEntity" : "Nigeria",
                        "firstNameOfBeneficialOwner": "John",
                        "lastNameOfBeneficialOwner": "Tayo",
                        "dobOfBeneficialOwner": "23-10-1984"
                    }
                },

                "managerOfProperty":{
                    "propertyManagerType": "managementCompany",
                        "ManagementCompany":{
                        "fullNameOfManagementCompany":"Splashray creations suite",
                        "addressOfManagementCompany" : "splashray limited",
                        "unitNumberOfManagementCompany" : 24235,
                        "cityOfManagementCompany" : "ikeja ",
                        "zipCodeOfManagementCompany" : 24124,
                        "countryOfManagementCompany" : "Nigeria",
                        "firstNameOfManagementCompany": "John",
                        "lastNameOfManagementCompany": "Tayo",
                        "dobOfManagementCompany": "20/10/2022"
                    }
                }
      
        },
        Review: {
        "bookingid": "6435565ff74ff207e8f84875",
        "userId": "641276a4e57fddc820489188",
        "hotelId" : "6412781be57fddc8204891b13",
        "fullName" :  "John-doe",
        "location": "New York",
        "reviewTitle": "Great hotel!",
        "reviewContent":"I had a fantastic stay at this hotel.",
        "starRating" :  4,       
        } 
    }

  };


  swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./index.js')
})