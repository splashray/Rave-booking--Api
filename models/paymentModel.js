const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'Bookings', required: true 
  },
  amount: {
     type: Number,
     required: true 
  },
  status: { 
    type: String, 
    enum: ['unpaid', 'success', 'failed', 'pending',],
    required: true 
  },
  paymentType:{
    type:String,
    enum: ['online','onsite'],
  },
  transactionId: { 
    type: String, 
    // required: true
  },
  date:{
    type: Date,   
    default: Date.now 
  } 

},{timestamps:true})

module.exports = mongoose.model("Payment", PaymentSchema)

