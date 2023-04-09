const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,  unique: true},

  paymentRecords:[
    {
      bookingId: { 
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'Bookings', required: true 
      },
      customBookingId:{
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true 
      },
      status: { 
        type: String, 
        enum: ['unpaid', 'success', 'failed', 'pending','refund'],
        required: true 
      },
      paymentType:{
        type:String,
        enum: ['online','onsite'],
      },
      transactionId: { 
        type: String, 
        required: true
      },
      date:{
        type: Date,   
        default: Date.now 
      } 
    }
  ]
  
},{timestamps:true})

module.exports = mongoose.model("Payment", PaymentSchema)

