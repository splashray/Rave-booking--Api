const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
//import coustom middlware
const connectDB = require("./utils/dbConn");
const config = require('./utils/config')
const notFound = require('./middlewares/not-found')
//import Swagger ui
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
//import custom router
const authRouter = require('./routes/authRouter')
const ownersRouter = require('./routes/ownerRouter')
const usersRouter = require('./routes/userRouter')
const hotelsRouter = require('./routes/hotelRouter')
const roomsRouter = require('./routes/roomRouter')
const kycsRouter = require('./routes/kycRouter')
const bookingsRouter = require('./routes/bookingRouter')
const reviewsRouter = require('./routes/reviewRouter')


const app = express();
connectDB();

//middleware
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.status(200).send(`Welcome to Rave-Booking Api - https://rave-booking.onrender.com/doc`)
});

app.use('/api/auth', authRouter);
app.use('/api/owners', ownersRouter);
app.use('/api/users', usersRouter);
app.use('/api/hotels', hotelsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/kycs', kycsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);


app.use((err, req, res, next)=>{
  const errorStatus = err.status || 500
  const errorMessage = err.message || "Something went wrong!"
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  })
})

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.use(notFound)

mongoose.connection.once("open", () => {
  console.log("connected to MongoDB");
  app.listen(config.PORT, () => {
    console.log(`connected to backend @ ${config.PORT}`);
  });
});
//with this setup, app won't listen until mongoDB is cconnected. Helps avoid future error