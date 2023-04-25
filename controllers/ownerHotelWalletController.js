const OwnerHotelWallet = require('../models/ownerHotelWalletModel')
const Booking = require('../models/bookingModel')
// const { addCommissionRecord } = require('../models/ownerHotelWalletModel');

    // function to generate month name and year
    function getMonthNameAndYear(date) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${month}-${year}`;
    }

    const checkBookingExists = (wallet, bookingId) => {
        // Loop through each commission record in the commissionRecords array
        for (const commissionRecord of wallet.commissionRecords) {
          // Loop through each monthCommission in the commission record
          for (const monthCommission of commissionRecord.monthCommission) {
            // Check if the bookingId already exists in the monthCommission array
            if (monthCommission.bookingId.equals(bookingId)) {
                //TODO: if the booking id already exist check and help the user to check in if not checkin
              return true; // bookingId already exists, return true
            }
          }
        }
        return false; // bookingId does not exist in any of the commissionRecords
    };

const addCommissionDataManual = async (req, res, next) => {
    // #swagger.tags = ['Commissions']
    // #swagger.description = 'Manual commission creation depends on type of payment and payment status.'
    try {    
        const bookingId = req.params.bookingId
        const userId = req.params.userId
        if (!bookingId && !userId) {
            return res.status(400).json({ success: false, message: 'Error: bookingId or userId missing' });
        }

        const bookingRecord = await Booking.findOne({ userId: userId }, { bookingRecords: 1 })
           if (!bookingRecord) return res.status(404).json({ error: "Booking not found for the specified userId" });
 
           const getBooking =  bookingRecord.bookingRecords.find((record) => record._id.toString() === bookingId);
           if (!getBooking) return res.status(404).json({ error: "Booking record not found for the specified bookingId" });

        console.log(getBooking);

        const hotelId = getBooking.hotelDetails.hotelId
        const customBookingId  = getBooking.bookingId
        const price = getBooking.price
        const commission = getBooking.commission
        const paymentType = getBooking.paymentType
        const paymentStatus = getBooking.paymentStatus

        //Automatic commission can be executed with the remaining code below passing in bookingRecord Details.
        const currentDate = new Date(); // Get the current date
        const currentMonth = getMonthNameAndYear(currentDate); // Get the current month name and year
     

        let wallet = await OwnerHotelWallet.findOne({ hotelId:hotelId});
        if (!wallet) {
            return res.status(400).json({ success: false, message: 'Error: Unable to add comission due to hotel wallet Missing' });
        }

        // Check whether the bookingId already exists in the commissionRecords array
        const isBookingExists = checkBookingExists(wallet, bookingId);
        if (isBookingExists) {
            return res.status(400).json({ success: false, message: 'Error: Booking ID has already been added to the commission.' });
        }

        // Find the commission record for the current month
        const commissionRecord = wallet.commissionRecords.find(record => record.monthName === currentMonth);
        if (!commissionRecord) {
            // Create a new commission record if it doesn't exist
            await wallet.addCommissionRecord();
            // await addCommissionRecord.call(wallet);

            // Get the newly created commission record
            const newCommissionRecord = wallet.commissionRecords.find(record => record.monthName === currentMonth);
    
            // Set the payment settlement and date based on payment type and status
            let paymentSettlement;
            switch (paymentType) {
                case 'online':
                    if (paymentStatus) {
                    paymentSettlement = 'settled To Company';
                    newCommissionRecord.monthBalance += commission;
                    //   newCommissionRecord.balanceAfterCommission = newCommissionRecord.monthBalance;
                    } else {
                    return res.status(400).json({ success: false, message: 'Error: Payment is not yet paid and is online.' });
                    }
                    break;
                case 'onsite':
                    if (paymentStatus) {
                    paymentSettlement = 'settled To Owner';
                    newCommissionRecord.monthBalance -= commission;
                    //   newCommissionRecord.balanceAfterCommission = newCommissionRecord.monthBalance;
                    } else {
                    paymentSettlement = 'unsettled To Owner';
                    newCommissionRecord.monthBalance -= commission;
                    //   newCommissionRecord.balanceAfterCommission = newCommissionRecord.monthBalance;
                    }
                    break;
                default:
                    return res.status(400).json({ success: false, message: 'Error: Invalid payment type.' });
            }
    
            // Create a new commission record for this booking
            const newCommission = {
                bookingId: bookingId,
                customBookingId: customBookingId,
                userId: userId,
                price: price,
                commission: commission,
                paymentStatus: paymentStatus,
                paymentType: paymentType,
                paymentSettlement: paymentSettlement,
                balanceAfterCommission: newCommissionRecord.monthBalance,
                createdAt: currentDate
            };
    
            // Add the new commission data
            newCommissionRecord.monthCommission.push(newCommission);
        } else {
            // Update the payment settlement and balance
            switch (paymentType) {
            case 'online':
                if (paymentStatus) {
                paymentSettlement = 'settled To Company';
                commissionRecord.monthBalance += commission;
                //   commissionRecord.balanceAfterCommission = commissionRecord.monthBalance;
                } else {
                return res.status(400).json({ success: false, message: 'Error: Payment is not yet paid and is online.' });
                }
                break;
            case 'onsite':
                if (paymentStatus) {
                paymentSettlement = 'settled To Owner';
                commissionRecord.monthBalance -= commission;
                //   commissionRecord.balanceAfterCommission = commissionRecord.monthBalance;
                } else {
                paymentSettlement = 'unsettled To Owner';
                commissionRecord.monthBalance -= commission;
                //   commissionRecord.balanceAfterCommission = commissionRecord.monthBalance;
                }
                break;
            default:
                return res.status(400).json({ success: false, message: 'Error: Invalid payment type.' });
            }

            // Create a new commission record for this booking
            const newCommission = {
                bookingId: bookingId,
                customBookingId: customBookingId,
                userId: userId,
                price: price,
                commission: commission,
                paymentStatus: paymentStatus,
                paymentType: paymentType,
                paymentSettlement: paymentSettlement,
                balanceAfterCommission: commissionRecord.monthBalance,
                createdAt: currentDate
            };

            // Add the new commission data
            commissionRecord.monthCommission.push(newCommission);
        }

        // Save the commission record
        try {
            await wallet.save();
        } catch (err) {
            return res.status(500).json({ success: false, 
                message: 'Error: Unable to save commission record.' });
        }
        // Return success response
        return res.status(200).json({ success: true, message: 'Commission record updated successfully.' });

    } catch (err) {
        console.log(err);
        next(err)
        // return res.status(500).json({ success: false, message: 'Error: Unable to update commission record.' });
    }

      
}

const checkinBooking = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
// #swagger.description = 'Endpoint to checkin booking(Commission are calculated).'
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

            //  The commision sent to the hotel wallet start here
            //Todo A: If online and paid create a commission model (as Paid commision- settledToCompany)
            //Todo B: If onsite and paid already , create a commission model (as Paid commision -settledToOwner )
            //Todo C: If onsite and unpaid immediatly create a commission model. (as Unpaid commision - unsettledToOwner) -Trigger a call to the user and owners

                const currentDate = new Date(); // Get the current date
                const currentMonth = getMonthNameAndYear(currentDate); // Get the current month name and year
            
                const hotelId = bookingRecord.hotelDetails.hotelId  //details coming from the bookingRecord
                const userId = bookingRecord.userDetails.userId
                const bookingId  = bookingRecord._id
                const customBookingId  = bookingRecord.bookingId
                const price = bookingRecord.price
                const commission = bookingRecord.commission
                const paymentType = bookingRecord.paymentType
                const paymentStatus = bookingRecord.paymentStatus  //details coming from the bookingRecord

                let wallet = await OwnerHotelWallet.findOne({ hotelId:hotelId});
                if (!wallet) {
                    return res.status(400).json({ success: false, message: 'Error: Unable to add comission due to hotel wallet Missing' });
                }

                // Check whether the bookingId already exists in the commissionRecords array
                const isBookingExists = checkBookingExists(wallet, bookingId);
                if (isBookingExists) {
                    return res.status(400).json({ success: false, message: 'Error: Booking ID has already been added to the commission.' });
                }

                // Find the commission record for the current month
                const commissionRecord = wallet.commissionRecords.find(record => record.monthName === currentMonth);
                if (!commissionRecord) {
                    console.log("New month commission record");
                    // Create a new commission record if it doesn't exist
                    await wallet.addCommissionRecord();
                    // await addCommissionRecord.call(wallet);

                    // Get the newly created commission record
                    const newCommissionRecord = wallet.commissionRecords.find(record => record.monthName === currentMonth);
            
                    // Set the payment settlement and date based on payment type and status
                    let paymentSettlement;
                    switch (paymentType) {
                        case 'online':
                            if (paymentStatus) {
                            paymentSettlement = 'settled To Company';
                            newCommissionRecord.monthBalance += commission;
                            //   newCommissionRecord.balanceAfterCommission = newCommissionRecord.monthBalance;
                            } else {
                            return res.status(400).json({ success: false, message: 'Error: Payment is not yet paid and is online.' });
                            }
                            break;
                        case 'onsite':
                            if (paymentStatus) {
                            paymentSettlement = 'settled To Owner';
                            newCommissionRecord.monthBalance -= commission;
                            //   newCommissionRecord.balanceAfterCommission = newCommissionRecord.monthBalance;
                            } else {
                            paymentSettlement = 'unsettled To Owner';
                            newCommissionRecord.monthBalance -= commission;
                            //   newCommissionRecord.balanceAfterCommission = newCommissionRecord.monthBalance;
                            }
                            break;
                        default:
                            return res.status(400).json({ success: false, message: 'Error: Invalid payment type.' });
                    }
            
                    // Create a new commission record for this booking
                    const newCommission = {
                        bookingId: bookingId,
                        userId: userId,
                        customBookingId: customBookingId,
                        price: price,
                        commission: commission,
                        paymentStatus: paymentStatus,
                        paymentType: paymentType,
                        paymentSettlement: paymentSettlement,
                        balanceAfterCommission: newCommissionRecord.monthBalance,
                        createdAt: currentDate
                    };
            
                    // Add the new commission data
                    newCommissionRecord.monthCommission.push(newCommission);
                } else {
                    console.log("old month commission record");
                    // Update the payment settlement and balance
                    switch (paymentType) {
                    case 'online':
                        if (paymentStatus) {
                        paymentSettlement = 'settled To Company';
                        commissionRecord.monthBalance += commission;
                        //   commissionRecord.balanceAfterCommission = commissionRecord.monthBalance;
                        } else {
                        return res.status(400).json({ success: false, message: 'Error: Payment is not yet paid and is online.' });
                        }
                        break;
                    case 'onsite':
                        if (paymentStatus) {
                        paymentSettlement = 'settled To Owner';
                        commissionRecord.monthBalance -= commission;
                        //   commissionRecord.balanceAfterCommission = commissionRecord.monthBalance;
                        } else {
                        paymentSettlement = 'unsettled To Owner';
                        commissionRecord.monthBalance -= commission;
                        //   commissionRecord.balanceAfterCommission = commissionRecord.monthBalance;
                        }
                        break;
                    default:
                        return res.status(400).json({ success: false, message: 'Error: Invalid payment type.' });
                    }

                    // Create a new commission record for this booking
                    const newCommission = {
                        bookingId: bookingId,
                        userId: userId,
                        customBookingId: customBookingId,
                        price: price,
                        commission: commission,
                        paymentStatus: paymentStatus,
                        paymentType: paymentType,
                        paymentSettlement: paymentSettlement,
                        balanceAfterCommission: commissionRecord.monthBalance,
                        createdAt: currentDate
                    };

                    // Add the new commission data
                    commissionRecord.monthCommission.push(newCommission);
                }

                // Save the commission record in wallet and update the booking to checkin
                try {  
                    // Save the commission record in wallet
                    const savedWallet = await wallet.save();
                    if (!savedWallet) {
                        return res.status(500).json({ success: false, message: 'Error: Unable to save commission record.' });
                    }else{
                        // Update isCheckIn status and booking status to Active
                        bookingRecord.bookingInfo.isCheckIn.status = true;
                        bookingRecord.bookingInfo.isCheckIn.date = new Date();
                        bookingRecord.bookingInfo.bookingStatus = 'Active';
                        const checkInBooking = await booking.save();

                        if (!checkInBooking) {
                            return res.status(500).json({ message: "Checkin process aborted" }).end();
                        } 
                    return res.status(200).json({ success: true, messageToUser: 'Checkin Successful', messageToAdmin: 'Commission record updated successfully' });   
                    }
                
                } catch (err) {
                    console.log(err);
                    return res.status(500).json({ success: false, message: 'Error: Unable to save commission record.' });
                }
        }
    }
} catch (err) {
    next(err)
}
}

const checkoutBooking = async (req, res, next)=>{
// #swagger.tags = ['Bookings']
// #swagger.description = 'Endpoint to checkout booking(Transaction are paid out).'

    try {  
        const { bookingRecordId } = req.params;
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
        
            // Perform a commission transaction with second verification to determine if the commision wil be charged by the company or owner in their wallet

    } catch (err) {
        next(err)
    }
}

const cancelReservation  = async (req, res, next)=>{
// #swagger.tags = ['Bookings']
// #swagger.description = 'Endpoint to Cancel booking Reservation.'

    try { 
        const { bookingRecordId } = req.params;
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
 // #swagger.tags = ['Bookings']
// #swagger.description = 'Endpoint to Refund booking Reservation to users.'
    try {
        const { bookingRecordId } = req.params;
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

const getWalletIdByHotelId = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const ownerHotelWallet = await OwnerHotelWallet.findOne({ hotelId });
        if (!ownerHotelWallet) {
          return res.status(404).json({ message: 'Owner hotel wallet not found' });
        }
        const wallet = ownerHotelWallet.toObject();
        return res.status(200).json({ wallet });
    } catch (err) {
        next(err)
    }
};
 
const getWalletDataByHotelIdAndMonthId = async (req, res, next) => {
    try {
        const { hotelId, monthId } = req.params;
        const ownerHotelWallet = await OwnerHotelWallet.findOne({
          hotelId,
          'commissionRecords._id': monthId,
        });
        if (!ownerHotelWallet) {
          return res.status(404).json({ message: 'Owner hotel wallet not found' });
        }
        const commissionRecord = ownerHotelWallet.commissionRecords.find(
          (record) => record._id.toString() === monthId
        );
        if (!commissionRecord) {
          return res.status(404).json({ message: 'Commission record not found' });
        }
        return res.status(200).json({ commissionRecord });
    } catch (err) {
      next(err);
    }
};
 
const getCommissionRecordsofLast3MonthByHotelId = async (req, res, next) => {
    try {
        const { hotelId } = req.params;

        // get the current date and the date 3 months ago
        const currentDate = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

        // query for the owner hotel wallet and filter the commission records
        const ownerHotelWallet = await OwnerHotelWallet.findOne({ hotelId });
        if (!ownerHotelWallet) {
        return res.status(404).json({ message: 'Owner hotel wallet not found' });
        }
        const commissionRecords = ownerHotelWallet.commissionRecords.filter(record => {
        const recordDate = new Date(record.createdAt);
        const monthName = `${recordDate.toLocaleString('default', { month: 'long' })}-${recordDate.getFullYear()}`;
        return monthName === `${currentDate.toLocaleString('default', { month: 'long' })}-${currentDate.getFullYear()}` || 
                monthName === `${currentDate.toLocaleString('default', { month: 'long' })}-${currentDate.getFullYear() - 1}` ||
                monthName === `${currentDate.toLocaleString('default', { month: 'long' })}-${currentDate.getFullYear() - 2}`;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.status(200).json({ commissionRecords });
    } catch (err) {
      next(err);
    }
};
  

module.exports ={
    addCommissionDataManual, checkinBooking, checkoutBooking,  cancelReservation,  refundBooking, getWalletIdByHotelId, getWalletDataByHotelIdAndMonthId, getCommissionRecordsofLast3MonthByHotelId
} 




// This function takes in the `req` and `res` parameters, which represent the request and response objects, respectively. It then extracts the necessary information from the request object, such as the payment type, payment status, and commission amount. The function then searches for the commission record associated with the given payment ID, and updates the payment settlement and balance based on the payment type and status.

// If the payment type is `online`, the function checks whether the payment has been made or not. If the payment has been made, the commission amount is added to the month balance, and the balance after commission is updated accordingly. If the payment has not been made, the function returns a 400 status code with an error message.

// If the payment type is `onsite`, the function simply subtracts the commission amount from the month balance, and updates the balance after commission.

// If the payment type is neither `online` nor `onsite`, the function returns a 400 status code with an error message.

// After updating the commission record, the function tries to save it to the database. If the save operation fails, the function returns a 500 status code with an error message. If the save operation succeeds, the function returns a 200 status code with a success message.

// If any errors occur during the execution of the function, the function catches them and returns a 500 status code with an error message.

// Overall, this function provides a way to update commission records based on payment settlements and balances, and returns appropriate responses based on the success or failure of the operation.
