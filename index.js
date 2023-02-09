const express = require('express')
const mongoose = require('mongoose')
// const bodyParser = require('body-parser')
// const cookieParser = require('cookie-Parser')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const cors = require('cors')
const config = require('./utils/config')
const authRouter = require('./routes/authRouter')
const ownersRouter = require('./routes/ownerRouter')
const usersRouter = require('./routes/userRouter')
const hotelsRouter = require('./routes/hotelRouter')
const roomsRouter = require('./routes/roomRouter')
const kycsRouter = require('./routes/kycRouter')
const bookingsRouter = require('./routes/bookingRouter')
const reviewsRouter = require('./routes/reviewRouter')
const notFound = require('./middlewares/not-found')
const path = require('path')
const { expressHbs } = require('express-handlebars')

const app = express();

mongoose.connect(config.MONGODB_URL, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
.then(()=>{
  console.log('Connected to mongodb.');
})
.catch((error)=>{
  console.log(error.reason);
})

//middleware
app.use(cors());
// app.use(cookieParser())
app.use(express.json())
// app.use(bodyParser.json())
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.send(`Welcome to Rave-Booking Api - https://rave-booking.onrender.com/doc`)
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

app.listen(config.PORT , ()=>{
    console.log(`connected to backend - ${config.PORT}`);
});