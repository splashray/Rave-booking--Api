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
        const hotelId = req.params.hotelId
        const bookingId = req.params.bookingId
        const userId = req.params.userId
        if (!hotelId && !bookingId && !userId) {
            return res.status(400).json({ success: false, message: 'Error: bookingId or hotel id or userId missing' });
        }

        const bookingRecord = await Booking.findOne({ userId: userId }, { bookingRecords: 1 })
           if (!bookingRecord) return res.status(404).json({ error: "Booking not found for the specified userId" });
 
           const getBooking =  bookingRecord.bookingRecords.find((record) => record._id.toString() === bookingId);
           if (!getBooking) return res.status(404).json({ error: "Booking record not found for the specified bookingId" });

        console.log(getBooking);

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

module.exports ={
    addCommissionDataManual
}




// This function takes in the `req` and `res` parameters, which represent the request and response objects, respectively. It then extracts the necessary information from the request object, such as the payment type, payment status, and commission amount. The function then searches for the commission record associated with the given payment ID, and updates the payment settlement and balance based on the payment type and status.

// If the payment type is `online`, the function checks whether the payment has been made or not. If the payment has been made, the commission amount is added to the month balance, and the balance after commission is updated accordingly. If the payment has not been made, the function returns a 400 status code with an error message.

// If the payment type is `onsite`, the function simply subtracts the commission amount from the month balance, and updates the balance after commission.

// If the payment type is neither `online` nor `onsite`, the function returns a 400 status code with an error message.

// After updating the commission record, the function tries to save it to the database. If the save operation fails, the function returns a 500 status code with an error message. If the save operation succeeds, the function returns a 200 status code with a success message.

// If any errors occur during the execution of the function, the function catches them and returns a 500 status code with an error message.

// Overall, this function provides a way to update commission records based on payment settlements and balances, and returns appropriate responses based on the success or failure of the operation.
