const cron = require('node-cron');
const Booking = require('../models/bookingModel')


// Task 1: Define the taskExpiredBooking to run every 24 hours (at midnight) and This is set to 2 days later
const taskExpiredBooking = cron.schedule('0 0 */24 * * *', async () => {
  // The task first finds all bookings where the check-in date has passed the current day (two Days Later) and the status is not already expired, then updates their status to "Expired". 

  console.log('Running booking check...');
  const currentDate = new Date();
  const twoDaysLater = new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000);

  // Find all bookings where the check-in date has passed and the status is not already expired
  const expiredBookings = await Booking.find({
    'bookingRecords.roomDetails.checkIn': { $lt: twoDaysLater },
    'bookingRecords.bookingInfo.bookingStatus': { $ne: 'Expired' }
  });
  
  console.log(expiredBookings);

  // Update the status of the expired bookings
  await Promise.all(expiredBookings.map(async booking => {
    booking.bookingRecords.forEach(record => {
      if (record.roomDetails.checkIn < twoDaysLater && record.bookingInfo.bookingStatus !== 'Expired') {
        record.bookingInfo.bookingStatus = 'Expired';
        record.bookingInfo.isExpired.status = true;
        record.bookingInfo.isExpired.date = new Date();
      }
    });
    await booking.save();
  }));

  console.log(`Booking check completed. ${expiredBookings.length} bookings updated.`);
}, { scheduled: true });

//Reminder: untested
// Task 2: Define the commissionReconciliationJob to run every 30 days
// const commissionReconciliationJob = cron.schedule('0 0 1 * * *', async () => {
//   try {
//     // Get all bookings that have been checked out in the last month
//     const monthAgo = new Date();
//     monthAgo.setMonth(monthAgo.getMonth() - 1);
//     const bookings = await Booking.find({
//       "bookingRecords.bookingInfo.isCheckOut.status": true,
//       "bookingRecords.bookingInfo.isCheckOut.date": { $gte: monthAgo },
//     });

//     // Group bookings by hotel
//     const bookingsByHotel = bookings.reduce((result, booking) => {
//       const hotelId = booking.bookingRecords[0].hotelDetails.hotelId.toString();
//       if (!result[hotelId]) {
//         result[hotelId] = {
//           hotelName: booking.bookingRecords[0].hotelDetails.hotelName,
//           totalCommissionPaid: 0,
//           totalCommissionDue: 0,
//         };
//       }

//       booking.bookingRecords.forEach(record => {
//         if (record.paymentType === "onsite") {
//           result[hotelId].totalCommissionPaid += record.commission;
//         } else {
//           result[hotelId].totalCommissionDue += record.commission;
//         }
//       });

//       return result;
//     }, {});

//     // Send reminders for outstanding payments
//     const owners = await Owner.find({});
//     owners.forEach(owner => {
//       const hotelId = owner.hotelId.toString();
//       const hotelInfo = bookingsByHotel[hotelId];
//     // If hotel has any outstanding commission due, send a reminder
//     if (hotelInfo && hotelInfo.totalCommissionDue > 0) {
//       const emailContent = `Dear ${owner.name},\n\nThis is a reminder that your hotel ${hotelInfo.hotelName} has an outstanding commission payment of $${hotelInfo.totalCommissionDue} due to us. Please make the payment as soon as possible.\n\nBest regards,\nThe Commission Reconciliation Team`;
//       sendEmail(owner.email, 'Commission Payment Reminder', emailContent);
//       }
//     });

//   console.log('Commission reconciliation job ran successfully');
// } catch (error) {
//   console.log('Error running commission reconciliation job:', error.message);
// }
// }, { scheduled: true });

// Task 3: Define the taskCheckOutBooking to run Automatic checkout date function, if the checkout wasn't done after 2 days by the user provided that the user checked in before  




// Start the tasks
taskExpiredBooking.start();
// commissionReconciliationJob.start();
module.exports = { taskExpiredBooking  };
