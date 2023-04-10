const cron = require('node-cron');
const Booking = require('../models/bookingModel')

// In this script, we use node-cron to schedule the task to run every 24 hours (at midnight). 
// The task first finds all bookings where the check-in date has passed and the status is not already expired, then updates their status to "Expired". 

// const task = cron.schedule('*/2 * * * *', async () => {

// This is set to 2 days later
// Define the task to run every 24 hours
const task = cron.schedule('0 0 */24 * * *', async () => {
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


// Start the task
task.start();

module.exports = { task };
