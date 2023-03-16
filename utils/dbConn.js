const config = require('../utils/config')
const mongoose = require("mongoose");
const inProduction = process.env.NODE_ENV = 'production';

const connectDB = async () => {
  mongoose.set({strictQuery: true});
  try {
    await mongoose.connect(config.MONGODB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      autoIndex: inProduction ? false : true
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;