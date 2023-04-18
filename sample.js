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
