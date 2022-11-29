const swaggerAutogen = require('swagger-autogen')()
const outputFile = './swagger_output.json'
const endpointsFiles = ['./index.js']

const doc = {

    info: {
        version: "1.0.0",
        title: "Awuf-Booking API",
        description: "Documentation for Awuf-Boking automatically generated </b> module."
    },
    // host: "localhost:3000",
    host: "awuf-booking.cyclic.app",
    basePath: "/",
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
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
        
        
        
    ],
     securityDefinitions: {
            bearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                scheme: 'bearer',
                in: 'header',
            },
    },
      
    
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

        }
        
    }





  };


  swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./index.js')
})