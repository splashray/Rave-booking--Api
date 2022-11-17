const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-Parser')
const cookieParser = require('cookie-Parser')
const cors = require('cors')
const config = require('./utils/config')
const authRouter = require('./routes/authRouter')
const ownersRouter = require('./routes/ownerRouter')
const usersRouter = require('./routes/userRouter')
const hotelsRouter = require('./routes/hotelRouter')
const roomsRouter = require('./routes/roomRouter')
const kycsRouter = require('./routes/kycRouter')
const notFound = require('./middlewares/not-found')


const app = express();

mongoose.connect(config.MONGODB_URL, {
})
.then(()=>{
  console.log('Connected to mongodb.');
})
.catch((error)=>{
  console.log(error.reason);
})

//middleware
app.use(cors());
app.use(cookieParser())
app.use(express.json())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Welcome to Awuf-Booking Api')
});

app.use('/api/auth', authRouter);
app.use('/api/owners', ownersRouter);
app.use('/api/users', usersRouter);
app.use('/api/hotels', hotelsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/kycs', kycsRouter);


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

app.use(notFound)

app.listen(config.PORT , ()=>{
    console.log(`connected to backend - ${config.PORT}`);
});