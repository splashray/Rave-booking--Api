import  express from "express";
import mongoose from "mongoose";
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import cors from "cors";
import  config  from './utils/config.js';
import authRouter from "./routes/authRouter.js"
import ownersRouter from "./routes/ownerRouter.js"
import usersRouter from "./routes/userRouter.js"
import hotelsRouter from "./routes/hotelRouter.js"
// import roomsRoute from "./routes/rooms.js"
import {notFound} from "./middlewares/not-found.js"


mongoose.connect(config.MONGODB_URL, {
})
.then(()=>{
  console.log('Connected to mongodb.');
})
.catch((error)=>{
  console.log(error.reason);
})

const app = express();
app.use(cors());
app.use(cookieParser())
app.use(express.json())
app.use(bodyParser.json())

app.use('/api/auth', authRouter);
app.use('/api/owners', ownersRouter);
app.use('/api/users', usersRouter);
app.use('/api/hotels', hotelsRouter);
 
app.get("/", (req, res) => {
    res.send('Welcome to Awuf-Booking Api ')
});

app.use(notFound)
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

const port = config.PORT || 3000
app.listen(port, ()=>{
    console.log(`connected to backend - ${port}`);
});