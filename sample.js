const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommissionSchema = new Schema({
  bookingId: {type: Schema.Types.ObjectId, ref: 'Booking', required: true},
  customBookingId: {type: String, required: true},
  price: {type: Number, required: true},
  commission: {type: Number, required: true},
  paymentStatus: {type: Boolean, required: true},
  paymentType: {type: String, required: true},
  paymentSettlement: {type: String, required: true},
  balanceAfterCommission: {type: Number, required: true},
  createdAt: {type: Date, required: true},
});

const CommissionRecordSchema = new Schema({
  monthName: {type: String, required: true},
  monthCommission: [CommissionSchema],
  monthBalance: {type: Number, default: 0},
});

const OwnerHotelWalletSchema = new Schema({
  hotelId: {type: Schema.Types.ObjectId, ref: 'Hotel', required: true},
  commissionRecords: [CommissionRecordSchema],
});

OwnerHotelWalletSchema.methods.addCommissionRecord = async function() {
  const currentDate = new Date();
  const currentMonth = getMonthNameAndYear(currentDate);
  const commissionRecord = {monthName: currentMonth, monthCommission: [], monthBalance: 0};
  this.commissionRecords.push(commissionRecord);
  await this.save();
};

function getMonthNameAndYear(date) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return monthNames[date.getMonth()] + ' ' + date.getFullYear();
}

const OwnerHotelWalletModel = mongoose.model('OwnerHotelWallet', OwnerHotelWalletSchema);

module.exports = OwnerHotelWalletModel;






   // const ownerCommissionWallet = await OwnerHotelWallet.findOne({ hotelId: bookingRecord.hotelDetails.hotelId });
                    // if (!ownerCommissionWallet) {
                    // throw new Error('Owner commission wallet not found');
                    // }
                    // let checkResponse = ownerCommissionWallet.commissionRecords.some(record => record.bookingId === bookingRecord._id);
                    // switch (checkResponse) {
                    //     case true:
                    //         // The booking has already been saved before
                    //         return res.status(400).json({ message: "Booking has already been saved" });
                    //     case false:
                    //             // The booking has not been saved before
                    //             switch (bookingRecord.paymentType) {
                    //                 case "online":
                    //                     if (bookingRecord.paymentStatus) {
                    //                     // Online and paid, settled to company
                    //                     const commissionRecord1 = {
                    //                         bookingId: bookingRecord._id,
                    //                         customBookingId: bookingRecord.bookingId,
                    //                         userId: booking.userId,
                    //                         price: bookingRecord.price,
                    //                         commission: bookingRecord.commission,
                    //                         paymentStatus: true,
                    //                         paymentType: bookingRecord.paymentType,
                    //                         date: Date.now(),
                    //                         paymentSettlement: {
                    //                         status: 'settled To Company',
                    //                         date: Date.now()
                    //                         }
                    //                     };
                    //                     ownerCommissionWallet.commissionRecords.push(commissionRecord1);
                    //                     ownerCommissionWallet.commissionPaidToCompany += commissionRecord1.commission;

                    //                     // Save commission wallet changes
                    //                     await ownerCommissionWallet.save();      

                    //                     // futher transaction operation will be on checkout, as the commission  operation is saved already
                    //                     return res.status(200).json({ updatedBooking: bookingRecord, message: 'Checkin successful' });

                    //                     } else {
                    //                     // Online and unpaid
                    //                     return res.status(400).json({ message: "Booking is unpaid" }).end()
                    //                     }
                                    
                    //                 case "onsite":
                    //                     if (bookingRecord.paymentStatus) {
                    //                     // Onsite and paid, settled to owner
                    //                     const commissionRecord2 = {
                    //                         bookingId: bookingRecord._id,
                    //                         customBookingId: bookingRecord.bookingId,
                    //                         userId: booking.userId,
                    //                         price: bookingRecord.price,
                    //                         commission: bookingRecord.commission,
                    //                         paymentStatus: true,
                    //                         paymentType: bookingRecord.paymentType,
                    //                         date: Date.now(),
                    //                         paymentSettlement: {
                    //                         status: 'settled To Owner',
                    //                         date: Date.now()
                    //                         }
                    //                     };
                    //                     ownerCommissionWallet.commissionRecords.push(commissionRecord2);
                    //                     ownerCommissionWallet.commissionYetToPay += commissionRecord2.commission;

                    //                     // Save commission wallet changes
                    //                     await ownerCommissionWallet.save();      

                    //                     // futher transaction operation will be on checkout, as the commission  operation is saved already
                    //                     return res.status(200).json({ updatedBooking: bookingRecord, message: 'Checkin successful' });
                    //                     } else {
                    //                     // Onsite and unpaid, unsettled to owner
                    //                     const commissionRecord3 = {
                    //                         bookingId: bookingRecord._id,
                    //                         customBookingId: bookingRecord.bookingId,
                    //                         userId: booking.userId,
                    //                         price: bookingRecord.price,
                    //                         commission: bookingRecord.commission,
                    //                         paymentStatus: false,
                    //                         paymentType: bookingRecord.paymentType,
                    //                         date: Date.now(),
                    //                         paymentSettlement: {
                    //                         status: 'unsettled To Owner'
                    //                         }
                    //                     };
                    //                     ownerCommissionWallet.commissionRecords.push(commissionRecord3);
                    //                     ownerCommissionWallet.commissionYetToPay += commissionRecord3.commission;

                    //                     // Save commission wallet changes
                    //                     await ownerCommissionWallet.save();      

                    //                     // futher transaction operation will be on checkout, as the commission  operation is saved already
                    //                     return res.status(200).json({ updatedBooking: bookingRecord, message: 'Checkin successful' });
                    //                     // TODO: Trigger the action to call the user and owner and remind them to settle the payment onsite.
                    //                     } 
                    //                 default:
                    //                 // Invalid payment type or status
                    //                 return res.status(400).json({ message: "Invalid payment type or status" }).end();          
                    //             }
                    //     default:
                    //     // Unable to check the response of booking saved in commission already.
                    //     return res.status(400).json({ message: "Unable to check the response if booking saved in commission already" }).end();
                    // }
