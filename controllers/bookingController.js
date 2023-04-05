const Booking = require('../models/bookingModel')
const Hotel = require('../models/hotelModel')
const Payment = require('../models/paymentModel')
const config = require('../utils/config')

const axios = require('axios')
const token = config.PAYSTACK_CLIENT_ID

const paystackConfig = {
    headers: { 
         Authorization: `Bearer ${token}`,'Content-Type': 'application/json'
    }
};

const {sendNewBookingEmailToUser, sendNewBookingEmailToOwner} = require('../utils/email')

const validatePaymentType = (req, res, next) => {
    const { paymentType } = req.body;
    if (!paymentType) {
      return res.status(400).json({ error: 'Payment type is required.' });
    }
    if (!['online', 'onsite'].includes(paymentType)) {
      return res.status(400).json({ error: 'Payment type must be either online or onsite. Try again' });
    }
    next();
}

  
const createBooking = async (req, res, next) => {
    	// #swagger.tags = ['Bookings']
        // #swagger.description = 'Endpoint to create booking.'  
    try {
        const {email, noOfRooms, nightsNumber, checkIn, checkOut, guestCount,oneRoom, firstName, lastName, phoneNumber, title, address, paymentType } = req.body

        // use the hotel id to generate all hotel details
        const hotel = await Hotel.findById(req.params.hotelId)
        if(!hotel) return res.status(404).json({error: "Hotel id not found"})

        const user = req.user.id;
        const price = parseFloat(req.body.price);  
        if (isNaN(price)) {
            console.log('Price is not a number');
            return res.status(403).json({error:"Price is not valid"})
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
            paymentType,
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

        if (paymentType === 'online') {
            console.log("online");

            const paymentData = {
                amount: lastBookingRecord.price * 100, 
                email: lastBookingRecord.email,
                currency: "NGN",
                callback_url: 'http://localhost:5000', //user will be directed to this route when payment is successful
                metadata: {
                    cancel_action: "http://localhost:5000", //user will be directed to this route once payment fails
                    bookingId: lastBookingRecord._id,
                    bookingInfo: lastBookingRecord
                },

            };

            //we are going to return a url which user will be redirected to on the frontend to make payment
            let clientPaymentdata 
            try {
                const response = await axios.post(
                "https://api.paystack.co/transaction/initialize",
                paymentData,
                paystackConfig
                );
                clientPaymentdata = response.data

            } catch (error) {
                console.log(error);
            }

            if (!clientPaymentdata) return res.status(500).json({error:"could not initialize payment", status: "Failed"});

        //Todo: delete the booking saved and restart since clientpayment Data wasn't successful

            res.status(200).json({ clientPaymentdata ,lastBookingRecord});

        }else{
            console.log("onsite");
            // Save new Payment info into the Payment model
                const paymentData = {
                    bookingId: lastBookingRecord._id,
                    amount: lastBookingRecord.price,
                    status: 'unpaid',
                    paymentType: 'onsite',
                    transactionId: '',
                };
                const paymentRecord = new Payment(paymentData);
                const savedPayment = await paymentRecord.save();
                
                if(!savedPayment)return res.status(404).json("Payment info not saved")

            // send email of the latest booking to user Email address provided
            sendNewBookingEmailToUser(lastBookingRecord, res);

            // send email of the latest booking to owner Email address provided
            sendNewBookingEmailToOwner(lastBookingRecord, res);

            return res.status(201).json({
            status: "SUCCESS",
            messageToUser: "Booking created successfully and Confirmation Email has been sent",
            messageToOwner: "Booking sent to your hotel successfully",
            booking: lastBookingRecord,
            PaymentInfo: savedPayment
            });

        }

    } catch (err) {
        next(err);
    }
}

const paymentVerification = async (req, res, next) => {
    const { reference } = req.query;
    try {
        if (!reference) return res.status(404).json({ error: 'reference not found.' });
            
        let clientPaymentdata;
        try {
            const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            paystackConfig
            );
            clientPaymentdata = response.data;
        } catch (error) {
            // console.log(error);
            return res.status(404).json({
                error: 'Invalid reference number.',
                data: { status: false, message: 'Transaction reference not found'} 
            });
        }

        const status = clientPaymentdata.status;
        let response;
        const paymentStatus = clientPaymentdata.data.status; 

    //check if verification has been previously ran successfully
    const ifPaymentCheckOperationExist = await Payment.findOne({
        transactionId: reference,
    });
    if (!ifPaymentCheckOperationExist) {
        switch (status) {
            case true:
            response = true;
            if(paymentStatus === 'success'){
                const paymentData = {
                    bookingId: clientPaymentdata.data.metadata.bookingId,
                    amount: clientPaymentdata.data.amount / 100,
                    status: 'success',
                    paymentType: 'online',
                    transactionId: clientPaymentdata.data.reference,
                };
                const paymentRecord = new Payment(paymentData);
                const savedPayment = await paymentRecord.save();
                const lastBookingRecord = clientPaymentdata.data.metadata.bookingInfo

                     // send email of the latest booking to user Email address provided
                    sendNewBookingEmailToUser(lastBookingRecord, res);

                    // send email of the latest booking to the owner Email address provided
                    sendNewBookingEmailToOwner(lastBookingRecord, res);
                        console.log('payment success and saved to the payment model');

                    return res.status(201).json({
                        status: "SUCCESS",
                        messageToUser: "Booking created successfully and Confirmation Email has been sent",
                        messageToOwner: "Booking sent to your hotel successfully",
                        booking: lastBookingRecord,
                        PaymentInfo: savedPayment
                    });

            }else if(paymentStatus==='failed'||'pending'){
            //Todo: perform actions on the failed and pending transactions
            console.log(paymentStatus);
            }
            else{
                //Todo: perform general action on the paymentstatus
                console.log(paymentStatus);
            }
             res.status(200).json({paymentStatus});
             
            break;
            case false:
            response = false;
            res.status(404).json({ error: 'Transaction failed.', response});

            break;
            default:
            response = false;
            throw res.status(404).json({ error: 'Transaction failed.', response });
        }
  
    } else {
    res.status(200).json({message: "verification successful already", response}).end();
    }

    } catch (error) {
      console.error(error);
      next(err);
    //   return res.status(500).json({ error: 'Unable to verify payment.' });
    }

}

const paymentRegeneration = async (req, res, next) => {
   
}

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

        //check if the hotel with the id has a verified kyc 
        const checkKyc = await Hotel.findOne({_id:hotelId, isKyc: true})
        if (!checkKyc) {
            return res.status(404).json({ msg: 'KYC not verified || Hotel Verification not returned' });
        }

        // Check equivalent bookings
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

         //check if the hotel with the id has a verified kyc 
         const checkKyc = await Hotel.findOne({_id:hotelId, isKyc: true})
         if (!checkKyc) {
             return res.status(404).json({ msg: 'KYC not verified || Hotel Verification not returned' });
         }
         
        // Check equivalent booking 
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
        // Perform a commission transaction taged as unpaid
        // Perform a debit transactions to the hotel owners wallet
            res.status(200).json(checkin)
    } catch (err) {
        next(err)
    }
}

const checkoutBooking = async (req, res, next)=>{

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
    validatePaymentType, createBooking, paymentVerification, paymentRegeneration, getBooking, getBookings, getOwnerBoookings, getOwnerSingleBookings, getUserBoookings,  getUserSingleBookings, checkinBooking, checkoutBooking
}




  // if (paymentDetails.status === 'success') {
        //     const paymentData = {
        //     bookingId: paymentDetails.data.metadata.bookingId,
        //     amount: paymentDetails.data.amount / 100,
        //     status: paymentDetails.data.status,
        //     transactionId: paymentDetails.data.reference,
        //     };
        //     const paymentRecord = new Payment(paymentData);
        //     const savedPayment = await paymentRecord.save();

        //     //Updating Booking Record
        //     const bookingRecord = await Booking.findOne({ 'bookingRecords.bookingId': paymentData.bookingId });
        //     if (!bookingRecord) {
        //     return res.status(404).json({ error: 'Booking not found.' });
        //     }

        //     bookingRecord.bookingRecords.forEach(async (booking, index) => {
        //     if (booking.bookingId === paymentData.bookingId) {
        //         booking.paymentStatus = paymentData.status;
        //         booking.paymentTransactionId = paymentData.transactionId;
        //         bookingRecord.bookingRecords[index] = booking;
        //         await bookingRecord.save();
        //     }
        //     });
        //     return res.status(200).json({ message: 'Payment verified and booking record updated.' });
        // } else {
        //     return res.status(400).json({ error: 'Payment verification failed.' });
        // }