const cron = require('node-cron');
const Booking = require('../models/bookingModel')


// Define the taskExpiredBooking to run every 24 hours (at midnight) and This is set to 2 days later
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

// Define the taskCheckOutBooking to run Automatic checkout date function, if the checkout wasn't done after 2 days by the user provided that the user checked in before  

// Start the task
taskExpiredBooking.start();

module.exports = { taskExpiredBooking };
