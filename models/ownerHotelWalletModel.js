const mongoose = require('mongoose');
const crypto = require("crypto");

const OwnerHotelWalletModelSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, unique: true },
    generalBalance: { type: Number, required: true, default: 0 },


    commissionRecords: [{
        monthName: { type: String, required: true },
        monthId:  { type: String, required: true },
        monthBalance: { type: Number, required: true, default: 0 },
        monthCommission: [{
            bookingId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Bookings', unique: true },
            customBookingId: { type: String, required: true },
            userId: { type: String },
            price: { type: Number, required: true },
            commission: { type: Number, required: true },
            paymentStatus: { type: Boolean, default: false, required: true },
            paymentType: { type: String, enum: ['online', 'onsite'], required: true },
            createdAt: { type: Date, default: Date.now },

            paymentSettlement: {type: String, 
              enum: ['unsettled To Owner', 'settled To Owner', 'settled To Company'],
              required: true
            },
            balanceAfterCommission: { type: Number, required: true },
        }]
    }],

    // transactions that show how the payment is released to the owner and from owner to company
    transactionRecords: [{
        // bookingId will be changed to the month id the transaction will be referencing to: 
        // for instance, January-2023 as a month will be referencing to a transactionRecord, which will have a type of 'payout to owner' or 'credit from owner' 
        bookingId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Bookings', unique: true },
        amount: { type: Number, required: true },
        type: { type: String, required: true, enum: ['payout to owner', 'credit from owner'] },
        date: { type: Date, default: Date.now },
        desc: { type: String, required: true, default: `Payment Unspecified` },
        currency: { type: String, required: true, default: `NGN` },
    }],

}, { timestamps: true });

    // function to generate month name and year
    function getMonthNameAndYear(date) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${month}-${year}`;
    }

    // add a new commission record every month
    OwnerHotelWalletModelSchema.methods.addCommissionRecord = async function () {
        const currentDate = new Date();
        const currentMonth = getMonthNameAndYear(currentDate);
        const monthId = crypto.randomBytes(10).toString("hex");

        const recordExists = this.commissionRecords.some(record => record.monthName === currentMonth);
        if (!recordExists) {
            const newCommissionRecord = {
                monthName: currentMonth,
                monthId: monthId,
                monthBalance: 0,
                monthCommission: []
            }
            this.commissionRecords.push(newCommissionRecord);
            await this.save();
        }
    }

module.exports = mongoose.model('OwnerHotelWallet', OwnerHotelWalletModelSchema);

  //     // add a transaction record
  //     OwnerHotelWalletModelSchema.methods.addTransactionRecord = async function (bookingId, amount, type, desc, currency) {
  //     const newTransactionRecord = {
  //       bookingId: bookingId,
  //       amount: amount,
  //       type: type,
  //       desc: desc,
  //       currency: currency,
  //     }
  //     this.transactionRecords.push(newTransactionRecord);
  //     await this.save();
  //     }
      
  //     // update balance after transaction
  //     OwnerHotelWalletModelSchema.post('save', async function (doc) {
  //     const transaction = doc.transactionRecords[doc.transactionRecords.length - 1];
  //     const booking = await mongoose.model('Bookings').findById(transaction.bookingId).lean();
  //     if (transaction.type === 'payout to owner') {
  //       const hotelWallet = await mongoose.model('OwnerHotelWallet').findOne({ hotelId: booking.hotelId });
  //       hotelWallet.commissionRecords.forEach(record => {
  //           const commissionIndex = record.monthCommission.findIndex(commission => commission.bookingId.toString() === transaction.bookingId.toString());
  //           if (commissionIndex !== -1) {
  //               const balanceAfterCommission = record.monthCommission[commissionIndex].balanceAfterCommission;
  //               record.balance -= balanceAfterCommission;
  //           }
  //       });
  //       await hotelWallet.save();
  //   } else if (transaction.type === 'credit from owner') {
  //       const hotelWallet = await mongoose.model('OwnerHotelWallet').findOne({ hotelId: booking.hotelId });
  //       hotelWallet.commissionRecords.forEach(record => {
  //           const commissionIndex = record.monthCommission.findIndex(commission => commission.bookingId.toString() === transaction.bookingId.toString());
  //           if (commissionIndex !== -1) {
  //               const balanceAfterCommission = record.monthCommission[commissionIndex].balanceAfterCommission;
  //               record.balance += balanceAfterCommission;
  //           }
  //       });
  //       await hotelWallet.save();
  //   }
    
  // });

