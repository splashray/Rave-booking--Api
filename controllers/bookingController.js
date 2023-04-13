const Booking = require('../models/bookingModel')
const Hotel = require('../models/hotelModel')
const Payment = require('../models/paymentModel')
const OwnerHotelWallet = require('../models/ownerHotelWalletModel')

const config = require('../utils/config')

const mongoose = require('mongoose')
const axios = require('axios')
const token = config.PAYSTACK_CLIENT_ID

const paystackConfig = {
    headers: { 
         Authorization: `Bearer ${token}`,'Content-Type': 'application/json'
    }
};

const {generateBookingCustomId, createBookingRecord,  processPaymentType, handleSuccessfulPayment, handleFailedOrPendingPayment, handleGeneralPaymentStatus} = require('../utils/bookingFunction');


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
        console.log(`commission: ${commission}`);

        // generate unique booking ID in the generateBookingCustomId function
        const genbookingCustomId = await generateBookingCustomId();

        // lastbookingRecord in the createBookingRecord function
        const lastBookingRecord = await createBookingRecord(genbookingCustomId, price, commission, email, paymentType, hotel, firstName, lastName, phoneNumber, title, address, noOfRooms, nightsNumber, checkIn, checkOut, guestCount, oneRoom, user);

        // processing of paymentType according to user's option in the processPaymentType function
        const { clientPaymentdata, savedPayment } = await processPaymentType(paymentType, lastBookingRecord, user, res);


        if (!clientPaymentdata && !savedPayment) {
        //the user lastbookingRecord has been deleted before returning here, since the payment can't be processed
            return res.status(500).json({error:"Payment processing failed", status: "Failed"});
        }

        if (clientPaymentdata) {
            return res.status(200).json({ clientPaymentdata ,lastBookingRecord});
        } else {
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
            'paymentRecords.transactionId': reference,
        });
        if (!ifPaymentCheckOperationExist) {
            switch (status) {
                case true:
                response = true;
                    if(paymentStatus === 'success'){
                        return handleSuccessfulPayment(paymentStatus, clientPaymentdata, response,  res);
                    }else if (paymentStatus === 'failed' || paymentStatus === 'pending'){
                    //Todo: perform actions on the failed and pending transactions
                        return handleFailedOrPendingPayment(paymentStatus, response, res);
                    }else{
                    //Todo: perform general action on the paymentstatus
                        return handleGeneralPaymentStatus(paymentStatus, response, res);
                    } 

                case false:
                response = false;
                throw res.status(404).json({ error: 'Transaction failed.', responseFromVerification : response});

                default:
                response = false;
                throw res.status(404).json({ error: 'Transaction failed.', responseFromVerification : response});
            }
        
        } else {
            return res.status(200).json({
                        message: "verification successful already",
                        responseFromVerification : response
                    }).end();
        }

    } catch (error) {
      console.error(error);
      next(err);
    //   return res.status(500).json({ error: 'Unable to verify payment.' });
    }

}

const paymentRegeneration = async (req, res, next) => {
  // Todo: paymentType must be "online" before regeneration of url for payment 
  const bookingId = req.params.id
  const userId = req.user.id

  if(!userId && bookingId) return res.status(404).json({error: "userId and booking id not found"})

 const bookingRecord = await Booking.findOne({ userId: userId }, { bookingRecords: 1 })
    if (!bookingRecord) return res.status(404).json({ message: "Booking record not found" });
    const booking =  bookingRecord.bookingRecords.find((record) => record._id.toString() === bookingId);

    if (!booking){
        return res.status(404).json({ error: "Booking not found" });
    }
    else if (booking.paymentType === 'online' && booking.paymentStatus === false) {
            console.log("payment Type: online and have not been paid before... Generating Payment Url");

            const paymentData = {
                amount: booking.price * 100, 
                email: booking.email,
                currency: "NGN",
                callback_url: `${config.PAYSTACK_CALLBACK_URL}`, //user will be directed to this route when payment is successful
                metadata: {
                    cancel_action: `${config.PAYSTACK_CANCEL_ACTION}`, //user will be directed to this route once payment fails
                    userId: userId,
                    bookingId: booking._id,
                    bookingInfo: booking
                },
            };

            //we are going to return a url which user will be redirected to on the frontend to make payment
            let clientPaymentdata;
            try {
                const response = await axios.post(
                    "https://api.paystack.co/transaction/initialize",
                    paymentData,
                    paystackConfig
                );
                clientPaymentdata = response.data;
            } catch (error) {
                console.log(error);
            }

            if (!clientPaymentdata) {
               return res.status(200).json({ clientPaymentdata: null, GeneratedBooking: booking })
            } else {
                return res.status(200).json({ clientPaymentdata, GeneratedBooking: booking });
            }
    }else{
        return res.status(400).json({ error: "Booking has been paid or Payment method choosen is onsite" });
    }
    
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
            const limit = parseInt(req.query.limit) || 10;
            const bookingRecord = await Booking.findOne({})
                .sort({createdAt: -1})
                .limit(limit)
                .select({bookingRecords: {$slice: -limit}});
                
            if (!bookingRecord) {
                return res.status(404).json({message: "Booking record not found for the user"});
            }
            
            const bookings = bookingRecord.bookingRecords.reverse();
            if (!bookings) {
                return res.status(404).json({error: "Bookings not found"});
            }
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
}

const getOwnerBookings = async (req, res, next) => {
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get all owner bookings.'
  
    try {
      const limit = parseInt(req.query.limit) || 10;
      const hotelId = req.params.hotelId;
      if (!hotelId) return res.status(404).json({ error: "Hotel id not found" });
  
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
  
      const checkKyc = await Hotel.findOne({ _id: hotelId, isKyc: true });
      if (!checkKyc) {
        return res.status(404).json({ msg: 'KYC not verified || Hotel Verification not returned' });
      }
  
      const bookings = await Booking.aggregate([
        { $match: {
          'bookingRecords.hotelDetails.hotelId': mongoose.Types.ObjectId(hotelId),
          'bookingRecords.createdAt': { $gte: startDate, $lte: endDate }
        } },
        { $unwind: "$bookingRecords" },
        { $match: {
          'bookingRecords.hotelDetails.hotelId': mongoose.Types.ObjectId(hotelId),
          'bookingRecords.createdAt': { $gte: startDate, $lte: endDate }
        } },
        { $sort: { "bookingRecords.createdAt": -1 } },
        { $group: { _id: "$_id", bookingRecords: { $push: "$bookingRecords" } } },
        { $unwind: "$bookingRecords" },
        { $sort: { "bookingRecords.createdAt": -1 } },
        { $limit: limit },
        { $group: { _id: "$_id", bookingRecords: { $push: "$bookingRecords" } } },
        { $project: { bookingRecords: { $slice: ["$bookingRecords", limit] } } }
      ]);
  
      if (!bookings || bookings.length === 0) {
        return res.status(404).json({ msg: 'No bookings found for the given hotelId' });
      }
  
      const relatedBookings = bookings[0].bookingRecords;
  
      res.status(200).json({ bookings: relatedBookings });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
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

const getUserBookings = async (req, res, next) => {
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get all users bookings.'
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(404).json({error: "User ID not found"});
        }
        
        const limit = parseInt(req.query.limit) || 5;
        const bookingRecord = await Booking.findOne({userId: userId})
            .sort({createdAt: -1})
            .limit(limit)
            .select({bookingRecords: {$slice: -limit}});
            
        if (!bookingRecord) {
            return res.status(404).json({message: "Booking record not found for the user"});
        }
        
        const bookings = bookingRecord.bookingRecords.reverse();
        if (!bookings) {
            return res.status(404).json({error: "Bookings not found"});
        }
        
        res.status(200).json(bookings);
    } catch (err) {
        next(err);
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
        const { bookingRecordId } = req.params;

        // Get the booking record by ID
        const booking = await Booking.findOne({ "bookingRecords._id": bookingRecordId });

        // Check if the booking record exists
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
    
        const bookingRecord = booking.bookingRecords.find(record => record._id.toString() === bookingRecordId);
        if (!bookingRecord) {
          return res.status(404).json({ message: 'Booking record not found' });
        }
    
        if (bookingRecord.paymentType === "online" && bookingRecord.paymentStatus === false){ 
            return res.status(400).json({ message: "Booking type is online and you haven't make the payment" });
        }else{
           // Those that can checkin are (online paid), (onsite unpaid), (oniste unpaid)
            if (bookingRecord.bookingInfo.isCheckIn.status) {
                return res.status(400).json({ message: "Booking is already checked in" });
            }else{
                // Update isCheckIn status and booking status to Active
                bookingRecord.bookingInfo.isCheckIn.status = true;
                bookingRecord.bookingInfo.isCheckIn.date = new Date();
                bookingRecord.bookingInfo.bookingStatus = 'Active';

                const checkInBooking = await booking.save();
                if (!checkInBooking) {
                    return res.status(500).json({ message: "Checkin process aborted" }).end()
                }else{
                    //  The commision sent to the hotel wallet start here
                    //Todo A: If online and paid create a commission model (as Paid commision- settledToCompany)
                    //Todo B: If onsite and paid already , create a commission model (as Paid commision -settledToOwner )
                    //Todo C: If onsite and unpaid immediatly create a commission model. (as Unpaid commision - unsettledToOwner) -Trigger a call to the user and owners
                    const ownerCommissionWallet = await OwnerHotelWallet.findOne({ hotelId: bookingRecord.hotelDetails.hotelId });
                    if (!ownerCommissionWallet) {
                    throw new Error('Owner commission wallet not found');
                    }
                    let checkResponse = ownerCommissionWallet.commissionRecords.some(record => record.bookingId === bookingRecord._id);
                    switch (checkResponse) {
                        case true:
                            // The booking has already been saved before
                            return res.status(400).json({ message: "Booking has already been saved" });
                        case false:
                                // The booking has not been saved before
                                switch (bookingRecord.paymentType) {
                                    case "online":
                                        if (bookingRecord.paymentStatus) {
                                        // Online and paid, settled to company
                                        const commissionRecord1 = {
                                            bookingId: bookingRecord._id,
                                            customBookingId: bookingRecord.bookingId,
                                            userId: booking.userId,
                                            price: bookingRecord.price,
                                            commission: bookingRecord.commission,
                                            paymentStatus: true,
                                            paymentType: bookingRecord.paymentType,
                                            date: Date.now(),
                                            paymentSettlement: {
                                            status: 'settled To Company',
                                            date: Date.now()
                                            }
                                        };
                                        ownerCommissionWallet.commissionRecords.push(commissionRecord1);
                                        ownerCommissionWallet.commissionPaidToCompany += commissionRecord1.commission;

                                        // Save commission wallet changes
                                        await ownerCommissionWallet.save();      

                                        // futher transaction operation will be on checkout, as the commission  operation is saved already
                                        return res.status(200).json({ updatedBooking: bookingRecord, message: 'Checkin successful' });

                                        } else {
                                        // Online and unpaid
                                        return res.status(400).json({ message: "Booking is unpaid" }).end()
                                        }
                                    
                                    case "onsite":
                                        if (bookingRecord.paymentStatus) {
                                        // Onsite and paid, settled to owner
                                        const commissionRecord2 = {
                                            bookingId: bookingRecord._id,
                                            customBookingId: bookingRecord.bookingId,
                                            userId: booking.userId,
                                            price: bookingRecord.price,
                                            commission: bookingRecord.commission,
                                            paymentStatus: true,
                                            paymentType: bookingRecord.paymentType,
                                            date: Date.now(),
                                            paymentSettlement: {
                                            status: 'settled To Owner',
                                            date: Date.now()
                                            }
                                        };
                                        ownerCommissionWallet.commissionRecords.push(commissionRecord2);
                                        ownerCommissionWallet.commissionYetToPay += commissionRecord2.commission;

                                        // Save commission wallet changes
                                        await ownerCommissionWallet.save();      

                                        // futher transaction operation will be on checkout, as the commission  operation is saved already
                                        return res.status(200).json({ updatedBooking: bookingRecord, message: 'Checkin successful' });
                                        } else {
                                        // Onsite and unpaid, unsettled to owner
                                        const commissionRecord3 = {
                                            bookingId: bookingRecord._id,
                                            customBookingId: bookingRecord.bookingId,
                                            userId: booking.userId,
                                            price: bookingRecord.price,
                                            commission: bookingRecord.commission,
                                            paymentStatus: false,
                                            paymentType: bookingRecord.paymentType,
                                            date: Date.now(),
                                            paymentSettlement: {
                                            status: 'unsettled To Owner'
                                            }
                                        };
                                        ownerCommissionWallet.commissionRecords.push(commissionRecord3);
                                        ownerCommissionWallet.commissionYetToPay += commissionRecord3.commission;

                                        // Save commission wallet changes
                                        await ownerCommissionWallet.save();      

                                        // futher transaction operation will be on checkout, as the commission  operation is saved already
                                        return res.status(200).json({ updatedBooking: bookingRecord, message: 'Checkin successful' });
                                        // TODO: Trigger the action to call the user and owner and remind them to settle the payment onsite.
                                        } 
                                    default:
                                    // Invalid payment type or status
                                    return res.status(400).json({ message: "Invalid payment type or status" }).end();          
                                }
                        default:
                        // Unable to check the response of booking saved in commission already.
                        return res.status(400).json({ message: "Unable to check the response if booking saved in commission already" }).end();
                    }
                }
            }
      }
    } catch (err) {
        next(err)
    }
}

const checkoutBooking = async (req, res, next)=>{
    const { bookingRecordId } = req.params;
    try {
      const booking = await Booking.findOne({ 'bookingRecords._id': bookingRecordId });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      const bookingRecord = booking.bookingRecords.find(record => record._id.toString() === bookingRecordId);
      if (!bookingRecord) {
        return res.status(404).json({ message: 'Booking record not found' });
      }
  
      if (bookingRecord.paymentType === "online" && bookingRecord.paymentStatus === false) {
        return res.status(400).json({ message: "Booking type is online and you havent make the payment" });
      }

      if (bookingRecord.bookingInfo.isCheckOut.status) {
        return res.status(400).json({ message: "Booking is already checked out" });
      }

      // Update isCheckOut status
      bookingRecord.bookingInfo.isCheckOut.status = true;
      bookingRecord.bookingInfo.isCheckOut.date = new Date();

      // Update booking status to Inactive
      bookingRecord.bookingInfo.bookingStatus = 'Inactive';

                  
      // Save the updated booking record
      await booking.save();
  
      return res.status(200).json({ updatedBooking: bookingRecord, message: 'Checkout successful' });
      
        // Perform a commission transaction 
        // Perform a debit transactions to the hotel owners wallet

    } catch (err) {
        next(err)
    }
}

const cancelReservation  = async (req, res, next)=>{
    const { bookingRecordId } = req.params;
    try {
      const booking = await Booking.findOne({ 'bookingRecords._id': bookingRecordId });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      const bookingRecord = booking.bookingRecords.find(record => record._id.toString() === bookingRecordId);
      if (!bookingRecord) {
        return res.status(404).json({ message: 'Booking record not found' });
      }
  
      if (bookingRecord.bookingInfo.cancelReservation.status) {
        return res.status(400).json({ message: "Booking Reservation is already cancelled" });
      }

      // Update cancelReservation status
      bookingRecord.bookingInfo.cancelReservation.status = true;
      bookingRecord.bookingInfo.cancelReservation.date = new Date();

      // Update booking status to Inactive
      bookingRecord.bookingInfo.bookingStatus = 'Cancelled';
  
      await booking.save();
  
      return res.status(200).json({ updatedBooking: bookingRecord, message: 'Reservation Cancelled successfully' });
      
        // Perform a commission transaction 
        // Perform a debit transactions to the hotel owners wallet

    } catch (err) {
        next(err)
    }
}

const  refundBooking   = async (req, res, next)=>{
    const { bookingRecordId } = req.params;
    try {
      const booking = await Booking.findOne({ 'bookingRecords._id': bookingRecordId });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      const bookingRecord = booking.bookingRecords.find(record => record._id.toString() === bookingRecordId);
      if (!bookingRecord) {
        return res.status(404).json({ message: 'Booking record not found' });
      }

       //check paymentstatus and type and refund status
       if (bookingRecord.paymentStatus === false) {
            return res.status(400).json({ message: "Booking hasn't been paid" });
       }
       if (bookingRecord.bookingInfo.isPaymentRefund.status===true) {
            return res.status(400).json({ message: "Booking Refund has been requested already" });
       }

       // Check if the booking is refundable, only pending status is allowed
        if (bookingRecord.bookingInfo.bookingStatus !== "Pending") {
            return res.status(400).json({ message: "Booking cannot be refunded at this time." });
        }

        // Process the refund, 
        // Breakdown  price = 1000 , commision = 100, refund = 1000-100 = 900 , 900 will be returned
        const refundAmount = bookingRecord.price - bookingRecord.commission;
        //TODO: process the refund using a payment gateway and refundBooking model will be submitted and marked as the payment type

        // Update the booking record
        bookingRecord.bookingInfo.bookingStatus = 'Refund'
        bookingRecord.bookingInfo.isPaymentRefund = {
            status: true,
            date: new Date()
        };
        await booking.save();

        // Return success response
        return res.status(200).json({ message: `Refund of ${refundAmount} has been processed.` });
    
    } catch (err) {
        next(err)
    }
}

const deleteBookingOnCanceledPayment  = async (req, res, next)=>{
    const  bookingId  = req.params.bookingId;
    try {
        const booking = await Booking.findOne({ "bookingRecords._id": bookingId });
        if (!booking) {
          console.log("Booking not found");
          return res.status(404).json({message: "Booking not found"})
        }
        const bookingRecord = booking.bookingRecords.find((record) => record._id.toString() === bookingId.toString());
        if (!bookingRecord) {
          console.log("Booking record not found");
          return res.status(404).json({message: "Booking record not found"})
        }
        booking.bookingRecords = booking.bookingRecords.filter((record) => record._id.toString() !== bookingId.toString());

       const deleteRecord = await booking.save();
      if (!deleteRecord) {
        return res.status(200).json({message: "Deleted booking"})
      }

    console.log("Booking deleted"); return res.status(200).json({message: "Deleted booking"})
    } catch (err) {
        next(err)
    }
}


module.exports ={
    validatePaymentType, createBooking, paymentVerification, paymentRegeneration, getBooking, getBookings, getOwnerBookings, getOwnerSingleBookings, getUserBookings,  getUserSingleBookings, checkinBooking, checkoutBooking, cancelReservation, refundBooking , deleteBookingOnCanceledPayment
}
