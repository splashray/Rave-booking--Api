const Booking = require('../models/bookingModel')
const Hotel = require('../models/hotelModel')
const {sendNewBookingEmailToUser, sendNewBookingEmailToOwner} = require('../utils/email')

const createBooking = async (req, res, next) => {
    	// #swagger.tags = ['Bookings']
        // #swagger.description = 'Endpoint to create booking.'    
        try {
            const {email,noOfRooms, nightsNumber, checkIn, checkOut, guestCount,oneRoom, firstName, lastName, phoneNumber, title, address } = req.body

            // use the hotel id to generate all hotel details
            const hotel = await Hotel.findById(req.params.hotelId)
            if(!hotel) return res.status(404).json({error: "Hotel id not found"})

            const user = req.user.id;
            const price = parseFloat(req.body.price);  
            if (isNaN(price)) {
                console.log('Price is not a number');
                return;
            }        
            const percentToTheBookingCompany = 10;    //company percentage 
            const commission = (percentToTheBookingCompany / 100) * price // Commission
            console.log(commission);
            // generate unique booking ID
            function generateCustomId() {
                return Math.floor(Math.random() * 10000000);
            }
                
            async function createUniqueId() {
                let bookingId = generateCustomId();
                let idExists = await Booking.exists({'bookingRecords.bookingId': bookingId});
                while (idExists) {
                    bookingId = generateCustomId();
                    idExists = await Booking.exists({ bookingId });
                }
                console.log(bookingId);
                return bookingId;
            }

            const genbookingCustomId = await createUniqueId();

            // prepare the booking record array to be appended to the user booking model 
            const bookingRecords = [{
                bookingId: `${genbookingCustomId}`, 
                price,
                commission,
                email:email,
                hotelDetails: {
                    hotelId: hotel._id,
                    hotelEmail: hotel.email,
                    hotelName: hotel.hotelBasicInfo.hotelName,
                    hotelAddress: hotel.hotelBasicInfo.streetAddress
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
                    guestCount: guestCount.map(cnt => {
                        return {
                            picked: cnt.picked,
                            amount: cnt.amount 
                        }
                    }),
                    oneRoom: oneRoom.map(orm=>{
                        return{
                            roomType: orm.roomType, 
                            singlePrice: orm.singlePrice 
                        }
                    })
                }
            }];
            
            // find a user booking model
            let userbookingDetails = await Booking.findOne({ userId: user });
            
            // If user doesn't have a booking model on the DB, create one and add the booking record to it
            if (!userbookingDetails) {
                userbookingDetails = await Booking.create({
                    userId: user, 
                    bookingRecords: bookingRecords
                });
                console.log("New user Booking");
            } else {
            // Else, append the booking record to the booking model of such user
                 userbookingDetails.bookingRecords = [...userbookingDetails.bookingRecords, ...bookingRecords];
                 await userbookingDetails.save();
                console.log("Old user Booking");
            }
            const lastBookingRecord = userbookingDetails.bookingRecords[userbookingDetails.bookingRecords.length - 1];

            // send email of the latest booking to user Email address provided
            sendNewBookingEmailToUser(lastBookingRecord, res);

             // send email of the latest booking to user Email address provided
             sendNewBookingEmailToOwner(lastBookingRecord, res);

            res.status(201).json({
             status: "SUCCESS",
             messageToUser: "Booking created successfully and Confirmation Email has been sent",
             messageToOwner: "Booking sent to your hotel successfully",
             booking: lastBookingRecord
            });
        } catch (err) {
            next(err);
        }
}

// const deleteBooking = async (req, res, next)=>{
//     // #swagger.tags = ['Bookings']
//     // #swagger.description = 'Endpoint to Delete booking.'

//       try {
//         const bookingId  = req.params.bookingId;
//         if(!bookingId) return res.status(404).json({error: "booking id not found"})

//         const booking = await Booking.updateOne({},{ $pull: { bookingRecords: { _id: bookingId } }} );
    
//         if (!booking) { return res.status(404).json({ success: false, message: 'Booking not found'})}
    
//         return res.status(200).json({ success: true, message: 'Booking deleted successfully'});
//       } catch (error) {
//         return res.status(500).json({ success: false, message: 'Server error', error: error.message});
//       }
    
// }

const getBooking = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get a booking by id.'

    try {
        const userId = req.params.userId
        const bookingId = req.params.bookingId
        console.log(bookingId);
        if(!userId && bookingId) return res.status(404).json({error: "userId and booking id not found"})

       const bookingRecord = await Booking.findOne({ userId: userId }, { bookingRecords: 1 })
          if (!bookingRecord) return res.status(404).json({ error: "Booking not found for the specified userId" });

          const booking =  bookingRecord.bookingRecords.find((record) => record._id.toString() === bookingId);
          if (!booking) return res.status(404).json({ error: "Booking record not found for the specified bookingId" });

          res.status(200).json(booking);
    } catch (err) {
        next(err)
    }
}

const getBookings = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get all booking.'

      try {
          const bookingRecord = await Booking.find({})
          if (!bookingRecord) return res.status(404).json({ error: "Booking not found" });
          res.status(200).json({bookingRecord})
      } catch (err) {
          next(err)
      }
  }


const getOwnerBoookings = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get all owners booking.'

    try {
        const hotelId = req.params.hotelId;
        if(!hotelId) return res.status(404).json({error: "Hotel id not found"})

        const bookings = await Booking.find({ 'bookingRecords.hotelDetails.hotelId': hotelId });
    
        if (!bookings) {
          return res.status(404).json({ msg: 'No bookings found for the given hotelId' });
        }
    
        const relatedBookings = bookings.reduce((acc, booking) => {
          const relatedBookingRecords = booking.bookingRecords.filter(record => {
            return record.hotelDetails.hotelId.toString() === hotelId;
          });
    
          return [...acc, ...relatedBookingRecords];
        }, []);
    
        res.status(200).json({ bookings: relatedBookings });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
}

const getOwnerSingleBookings = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get single owner's booking.'

        const { hotelId, bookingId } = req.params;

        if(!hotelId && bookingId) return res.status(404).json({error: "hotelId and booking id not found"})

        try {
          const booking = await Booking.findOne({ "bookingRecords.hotelDetails.hotelId": hotelId});
        
          if (!booking) {return res.status(404).send({ error: "Owner's hotel not found" })}
      
          const bookingRecord = booking.bookingRecords.find(
            (record) => record.hotelDetails.hotelId.toString() === hotelId && record._id.toString() === bookingId
          );
          if (!bookingRecord) {return res.status(404).send({ error: "Booking record not found" })}

          res.status(200).json({ bookingRecord });
        } catch (error) {
          res.status(500).send({ error: "Error retrieving booking" });
        }
}

const getUserBoookings = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get all users booking.'

    try {
        const userId = req.params.userId
        if(!userId ) return res.status(404).json({error: "id not found"})

       const bookingRecord = await Booking.findOne({ userId: userId }, { bookingRecords: 1 })
          if (!bookingRecord) return res.status(404).json({ message: "Booking record not found for the user" });
          const booking = bookingRecord.bookingRecords
          if (!booking) return res.status(404).json({ error: "Bookings not found" });
          res.status(200).json(booking);

    } catch (err) {
        next(err)
    }
}

const getUserSingleBookings = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get single user's booking.'
    try {
        const userId = req.params.userId
        const bookingId = req.params.bookingId
        if(!userId && bookingId) return res.status(404).json({error: "userId and booking id not found"})

       const bookingRecord = await Booking.findOne({ userId: userId }, { bookingRecords: 1 })
          if (!bookingRecord) return res.status(404).json({ message: "Booking record not found" });
          const booking =  await bookingRecord.bookingRecords.find((record) => record._id.toString() === bookingId);
          if (!booking) return res.status(404).json({ error: "Booking not found" });
    
          res.status(200).json(booking);
    } catch (err) {
        next(err)
    }
}

const checkinBooking = async (req, res, next)=>{

    try {
        const checkin = await Booking.findByIdAndUpdate(
            req.params.id, 
            {$set: {
                hasCheckedin: true,

            }},
            {new: true}
            )
        // Perform a commission transaction 
        // Perform a debit transactions to the hotel owners wallet


            res.status(200).json(checkin)

    } catch (err) {
        next(err)
    }
}



module.exports ={
    createBooking, getBooking, getBookings, getOwnerBoookings, getOwnerSingleBookings, getUserBoookings,  getUserSingleBookings, checkinBooking
}
