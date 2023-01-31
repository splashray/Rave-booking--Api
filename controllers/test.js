const Booking = require('../models/bookingModel')
const {sendNewBookingEmail} = require('../utils/email')

const createBooking = async (req, res, next) => {
    	// #swagger.tags = ['Bookings']
        // #swagger.description = 'Endpoint to create booking.'    
        try {
            const {
                email, hotelId, hotelCustomId, hotelName, hotelAddress, 
                noOfRooms, nightsNumber, checkIn, checkOut, picked, amount, roomType, singlePrice,
                firstName, lastName, phoneNumber, title, address, price
            } = req.body

            const user = req.user.id;
            const percentToGet = 10;    //company percentage 
            const commission = (percentToGet / 100) * price;  // Commission

            // generate unique booking ID
            function generateCustomId() {
                return Math.floor(Math.random() * 1000000);
            }
                
            async function createUniqueId() {
                let bookingId = generateCustomId();
                let idExists = await Booking.exists({ bookingId });
                while (idExists) {
                    bookingId = generateCustomId();
                    idExists = await Booking.exists({ bookingId });
                }
                return bookingId;
            }

            const genbookingCustomId = await createUniqueId();

            // prepare the booking record array to be appended to the user booking model 
            const bookingRecords = {
                bookingId: `${genbookingCustomId}`, 
                email,
                price,
                commission: commission,
                hotelDetails: {
                    hotelId: hotelId,
                    hotelCustomId: hotelCustomId,
                    hotelName: hotelName,
                    hotelAddress: hotelAddress
                },
                userDetails: {
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: phoneNumber,
                    title: title,
                    address: address
                },
                roomDetails: {
                    noOfRooms: noOfRooms,
                    nightsNumber: nightsNumber,
                    checkIn: checkIn,
                    checkOut: checkOut,
                    guestCount: [{ picked: picked, amount: amount }],
                    oneRoom: [{roomType: roomType, singlePrice: singlePrice }]
                }
            };

            // find a user booking model
            let userbookingDetails = await Booking.findOne({ userId: user });

            // If user doesn't have a booking model on the DB, create one and add the booking record to it
            if (!userbookingDetails) {
                userbookingDetails = await Booking.create({
                    userId: user, 
                    bookingRecords: [bookingRecords]
                });
            } else {
                // Else, append the booking record to the booking model of such user
                userbookingDetails.bookingRecords.push(bookingRecords);
                await userbookingDetails.save();
            }

            // send new booking email
            // sendNewBookingEmail(userbookingDetails, res);
            res.status(201).json({status: "SUCCESS", message: "Booking created successfully"});
        } catch (err) {
            next(err);
        }
}


////////////////////////////////

// const Booking = require('../models/bookingModel')
// const {sendNewBookingEmail} = require('../utils/email')

// const createBooking = async (req, res, next) => {
//     	// #swagger.tags = ['Bookings']
//         // #swagger.description = 'Endpoint to create booking.'    
//         try {
//             const {
//                 email, hotelId, hotelCustomId, hotelName, hotelAddress, 
//                 noOfRooms, nightsNumber, checkIn, checkOut, picked, amount, roomType, singlePrice,
//                 firstName, lastName, phoneNumber, title, address,
//             } = req.body

//             const user = req.user.id;
//             const price = req.body.price
//             const percentToTheBookingCompany = 10;    //company percentage 
//             const commission = (percentToTheBookingCompany / 100) * price // Commission
//             console.log(commission);
//             // generate unique booking ID
//             function generateCustomId() {
//                 return Math.floor(Math.random() * 10000000);
//             }
                
//             async function createUniqueId() {
//                 let bookingId = generateCustomId();
//                 let idExists = await Booking.exists({ bookingId });
//                 while (idExists) {
//                     bookingId = generateCustomId();
//                     idExists = await Booking.exists({ bookingId });
//                 }
//                 console.log(bookingId);
//                 return bookingId;
//             }

//             const genbookingCustomId = await createUniqueId();

//             // prepare the booking record array to be appended to the user booking model 
//             const bookingRecords = {
//                 bookingId: `${genbookingCustomId}`, 
//                 email,
//                 price,
//                 commission,
//                 "hotelDetails.hotelId":hotelId,
//                 "hotelDetails.hotelCustomId":hotelCustomId,
//                 "hotelDetails.hotelName":hotelName,
//                 "hotelDetails.hotelAddress":hotelAddress,
//                 "userDetails.firstName": firstName,
//                 "userDetails.lastName": lastName,
//                 "userDetails.phoneNumber": phoneNumber,
//                 "userDetails.title": title,
//                 "userDetails.address": address,
//                 "roomDetails.noOfRooms": noOfRooms,
//                 "roomDetails.nightsNumber":nightsNumber,
//                 "roomDetails.checkIn":checkIn,
//                 "roomDetails.checkOut":checkOut,
//                 "roomDetails.guestCount":  [{ "picked": picked, "amount": amount}],
//                 "roomDetails.oneRoom": [{"roomType": roomType, "singlePrice": singlePrice}]
//                 // hotelDetails: {
//                 //     hotelId: hotelId,
//                 //     hotelCustomId: hotelCustomId,
//                 //     hotelName: hotelName,
//                 //     hotelAddress: hotelAddress
//                 // },
//                 // userDetails: {
//                 //     firstName: firstName,
//                 //     lastName: lastName,
//                 //     phoneNumber: phoneNumber,
//                 //     title: title,
//                 //     address: address
//                 // },
//                 // roomDetails: {
//                 //     noOfRooms: noOfRooms,
//                 //     nightsNumber: nightsNumber,
//                 //     checkIn: checkIn,
//                 //     checkOut: checkOut,
//                 //     guestCount: [{ picked: picked, amount: amount }],
//                 //     oneRoom: [{roomType: roomType, singlePrice: singlePrice }]
//                 // }
//             };
            
//             // find a user booking model
//             let userbookingDetails = await Booking.findOne({ userId: user });
            
//             // If user doesn't have a booking model on the DB, create one and add the booking record to it
//             if (!userbookingDetails) {
//                 userbookingDetails = await Booking.create({
//                     userId: user, 
//                     bookingRecords: [bookingRecords]
//                 });
//                 console.log(userbookingDetails.roomDetails.nightsNumber);
//             } else {
//                 // Else, append the booking record to the booking model of such user
//                 userbookingDetails.bookingRecords.push(bookingRecords);
//                 await userbookingDetails.save();
//                 console.log(userbookingDetails.roomDetails.nightsNumber);

//             }

//             // send new booking email
//             // sendNewBookingEmail(userbookingDetails, res);
//             res.status(201).json({status: "SUCCESS", message: "Booking created successfully"});
//         } catch (err) {
//             next(err);
//         }
// }



{
    "bookingRecords": [{
        "email": "tolu@gmail.com",
        "price": 1000,
        "hotelDetails":{
            "hotelId":"63a243413a6a4d277f4c2fbb",
            "hotelCustomId":"H-138063",
            "hotelName":"Dove man Hotel",
            "hotelAddress":"223, sango area"
        },

        "roomDetails":{
            "noOfRooms":2,
            "nightsNumber":5,
            "checkIn":"25/11/2022",
            "checkOut":"30/11/2022",
            "guestCount":  [{ "picked": "Adults", "amount":2 },{ "picked": "Children", "amount":5 }],
            "oneRoom": [{ "roomType":"Single Arena Room", "singlePrice": 9300},{ "roomType":"Double Arena Room","singlePrice": 2500 },{ "roomType":"Royal Room","singlePrice": 2500 }]
        },
        "userDetails":{
            "firstName":"John",
            "lastName":"Tayo",
            "phoneNumber":"09031874139",
            "title":"Mr.",
            "address":"32, Toke street, ikorodu"
        }
    }]
    

}