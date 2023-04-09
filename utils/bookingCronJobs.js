const cron = require('node-cron');
const Booking = require('../models/bookingModel')

// In this script, we use node-cron to schedule the task to run every 24 hours (at midnight). 
// The task first finds all bookings where the check-in date has passed and the status is not already expired, then updates their status to "Expired". 


// Define the task to run every 24 hours
const task = cron.schedule('0 0 */24 * * *', async () => {
// const task = cron.schedule('*/2 * * * *', async () => {

    console.log('Running booking check...');
    const currentDate = new Date();
console.log(currentDate);
    // Find all bookings where the check-in date has passed and the status is not already expired
    const expiredBookings = await Booking.find({
      'bookingRecords.roomDetails.checkIn': { $lt: currentDate },
      'bookingRecords.bookingInfo.bookingStatus': { $ne: 'Expired' }
    });
    console.log(expiredBookings);
    // Update the status of the expired bookings
    await Promise.all(expiredBookings.map(async booking => {
      booking.bookingRecords.forEach(record => {
        if (record.roomDetails.checkIn < currentDate && !record.bookingInfo.isCheckIn[0].status) {
          record.bookingInfo.bookingStatus = 'Expired';
          record.bookingInfo.isExpired[0].status = true;
          record.bookingInfo.isExpired[0].date = new Date();
          console.log("checkin" + record.roomDetails.checkIn);
          console.log("checkout" + record.bookingInfo.isCheckIn[0].status);
        }
      });
      await booking.save();
    }));
    console.log(`Booking check completed. ${expiredBookings.length} bookings updated.`);
  }, { scheduled: true });
  
  // Start the task
  task.start();

  module.exports = { task };
