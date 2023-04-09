const axios = require("axios");
const crypto = require("crypto");

const Booking = require('../models/bookingModel')
const Payment = require('../models/paymentModel')
const {sendNewBookingEmailToUser, sendNewBookingEmailToOwner} = require('../utils/email')
const config = require('../utils/config')

const token = config.PAYSTACK_CLIENT_ID
const paystackConfig = {
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
};

//fucntion to generate Booking custom id
async function generateBookingCustomId() {
    const generateCustomId = () => Math.floor(Math.random() * 10000000);
    let bookingId = generateCustomId();
    let idExists = await Booking.exists({'bookingRecords.bookingId': bookingId});
    while (idExists) {
        bookingId = generateCustomId();
        idExists = await Booking.exists({ bookingId });
    }
    return bookingId;
}
//Fucntion to create a booking Record 
const createBookingRecord = async (genbookingCustomId, price, commission, email, paymentType, hotel, firstName, lastName, phoneNumber, title, address, noOfRooms, nightsNumber, checkIn, checkOut, guestCount, oneRoom, user) => {
    // prepare the booking record array to be appended to the user booking model 
    const bookingRecords = [{
        bookingId: `${genbookingCustomId}`, 
        price,
        commission,
        email:email,
        paymentStatus: false,
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

    return lastBookingRecord;
};

//Function to process payment based on type
const processPaymentType = async(paymentType, lastBookingRecord, user, res) => {
    if (paymentType === 'online') {
        console.log("payment Type: online");

        const paymentData = {
            amount: lastBookingRecord.price * 100, 
            email: lastBookingRecord.email,
            currency: "NGN",
            callback_url: 'http://localhost:5000', //user will be directed to this route when payment is successful
            metadata: {
                cancel_action: "http://localhost:5000", //user will be directed to this route once payment fails
                userId: user,
                bookingId: lastBookingRecord._id,
                bookingInfo: lastBookingRecord
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
            // Todo: If error, delete the booking saved and restart since client payment data wasn't successful
            const bookingId = lastBookingRecord._id
            await deleteLastBookingRecord(bookingId);

            return { clientPaymentdata: null, savedPayment: null };
        } else {
        return { clientPaymentdata, savedPayment: null };
        }

    } else {

        console.log('payment Type: onsite');
       // Save new Payment info into the Payment model
        const tnsId = crypto.randomBytes(10).toString("hex");

        const paymentData = [{
            bookingId: lastBookingRecord._id,
            customBookingId: lastBookingRecord.bookingId,
            amount: lastBookingRecord.price,
            status: 'unpaid',
            paymentType: 'onsite',
            transactionId: `s${tnsId}`,
        }];

        // find a user payment model
        let userPaymentDetails = await Payment.findOne({ userId: user });
            
        // If user doesn't have a payment  model on the DB, create one and add the payment record to it
        if (!userPaymentDetails) {
                userPaymentDetails = await Payment.create({
                userId: user, 
                paymentRecords: paymentData
            });
            console.log("New user payment data");
        } else {
            // Else, append the payment record to the payment model of such user
            userPaymentDetails.paymentRecords = [...userPaymentDetails.paymentRecords, ...paymentData];
            await userPaymentDetails.save();
            console.log("Old user payment data");
        }
        const savedPayment = userPaymentDetails.paymentRecords[userPaymentDetails.paymentRecords.length - 1];


        if (!savedPayment) {
               // Todo: delete the booking saved and restart since saved payment wasn't successful
               const bookingId = lastBookingRecord._id
               await deleteLastBookingRecord(bookingId);

            return { clientPaymentdata: null, savedPayment: null };
        } else {
            // send email of the latest booking to user Email address provided
            sendNewBookingEmailToUser(lastBookingRecord, res);

            // send email of the latest booking to owner Email address provided
            sendNewBookingEmailToOwner(lastBookingRecord, res);

            return { clientPaymentdata: null, savedPayment };
        }

    }
}

//Function to delete a booking when error occured while processing  the payment in both online and onsite
const deleteLastBookingRecord = async (bookingId) => {
    try {
      const booking = await Booking.findOne({ "bookingRecords._id": bookingId });
      if (!booking) {
        console.log("Booking not found");
        return;
      }
      const bookingRecord = booking.bookingRecords.find((record) => record._id.toString() === bookingId.toString());
      if (!bookingRecord) {
        console.log("Booking record not found");
        return;
      }
      booking.bookingRecords = booking.bookingRecords.filter((record) => record._id.toString() !== bookingId.toString());
      await booking.save();
      console.log(`Booking record with id ${bookingId} deleted successfully`);
    } catch (error) {
      console.log(error);
    }
};

//Function to update booking record when the payment verification was successful i.e set paymentStatus to true
const updateBookingRecord = async (bookingId, paymentStatus) => {
    try {
        const booking = await Booking.findOne({ "bookingRecords._id": bookingId });
        if (!booking) {
            console.log("Booking not found");
            return;
        }
        const bookingRecord = booking.bookingRecords.find((record) => record._id.toString() === bookingId.toString());
        if (!bookingRecord) {
            console.log("Booking record not found");
            return;
        }
        bookingRecord.paymentStatus = paymentStatus;
        await booking.save();
        console.log(`Booking record with id ${bookingId} updated successfully`);
    } catch (error) {
        console.log(error);
    }
};

const handleSuccessfulPayment = async (paymentStatus, clientPaymentdata, response, res) => {
    const paymentData = [{
      bookingId: clientPaymentdata.data.metadata.bookingId,
      customBookingId: clientPaymentdata.data.metadata.bookingInfo.bookingId,
      amount: clientPaymentdata.data.amount / 100,
      status: paymentStatus,
      paymentType: 'online',
      transactionId: clientPaymentdata.data.reference,
    }];
    const userId = clientPaymentdata.data.metadata.userId
    const lastBookingRecord = clientPaymentdata.data.metadata.bookingInfo
    const bookingId = clientPaymentdata.data.metadata.bookingId

    // find a user payment model
    let userPaymentDetails = await Payment.findOne({ userId: userId });
  
    // If user doesn't have a payment  model on the DB, create one and add the payment record to it
    if (!userPaymentDetails) {
      userPaymentDetails = await Payment.create({
        userId: userId,
        paymentRecords: paymentData
      });
      console.log("New user payment data");
    } else {
      // Else, append the payment record to the payment model of such user
      userPaymentDetails.paymentRecords = [...userPaymentDetails.paymentRecords, ...paymentData];
      await userPaymentDetails.save();
      console.log("Old user payment data");
    }
    const savedPayment = userPaymentDetails.paymentRecords[userPaymentDetails.paymentRecords.length - 1];
  
    //Update the booking Model since the payment was successful
    await updateBookingRecord(bookingId, true );
  
    // send email of the latest booking to user Email address provided
    sendNewBookingEmailToUser(lastBookingRecord, res);
  
    // send email of the latest booking to the owner Email address provided
    sendNewBookingEmailToOwner(lastBookingRecord, res);
    console.log('payment success and saved to the payment model');
  
    return res.status(201).json({
      status: "SUCCESS",
      responseFromVerification : response,
      messageToUser: "Booking created successfully and Confirmation Email has been sent",
      messageToOwner: "Booking sent to your hotel successfully",
      booking: lastBookingRecord,
      PaymentInfo: savedPayment
    });

};

const handleFailedOrPendingPayment = async (paymentStatus, response, res) => {
    // Todo: perform actions on the failed and pending transactions
    console.log(paymentStatus);
    res.status(200).json({ paymentStatus,  responseFromVerification : response });
};
    
const handleGeneralPaymentStatus = async (paymentStatus, response, res) => {
    // Todo: perform general action on the paymentstatus

    //Todo: payment regeneration of url for payment
    console.log(paymentStatus);
    res.status(200).json({ paymentStatus, responseFromVerification : response });
};
module.exports = {
    generateBookingCustomId, createBookingRecord, processPaymentType, handleSuccessfulPayment, handleFailedOrPendingPayment, handleGeneralPaymentStatus
} 
