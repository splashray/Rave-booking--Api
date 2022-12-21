const Booking = require('../models/bookingModel')
const {sendNewBookingEmail} = require('../utils/email')

const createBooking = async (req, res, next) => {
    	// #swagger.tags = ['Bookings']
        // #swagger.description = 'Endpoint to create booking.'

    const generateId = async() => {
        // genbookingCustomId 
        var genbookingCustomId = Math.floor(Math.random() * 1000000) + 1000000
        //search for availability of generated id
        const search = await Booking.findOne({bookingId:genbookingCustomId})
            if(!search){
                var number = req.body.price;  // room price
                var percentToGet = 10;    //company percentage 
                var percentCom = (percentToGet / 100) * number;  //Commission

                const newBooking = new Booking({
                    ...req.body, 
                    user: req.user.id, 
                    email:req.user.email,
                    bookingId: `${genbookingCustomId}`,  
                    commission: percentCom
                })
                try {
                    newBooking.save()
                    .then(result=>{
                        //send new Booking email
                        sendNewBookingEmail(result, res)
                    }).catch(err =>{
                        console.log(err);
                        res.json({status:"FAILED", message:"An error occurred while saving Boooking details"})
                    })
                }catch (err) {
                    next(err)
                }
            }else{
                generateId()
            }
    }

    generateId()
}



const deleteBooking = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to Delete booking.'

    try {
        await Booking.findByIdAndDelete(
            req.params.id
        )
        res.status(200).json({message:`Booking has been deleted`})
    } catch (err) {
        next(err)
    }
}

const getBooking = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get a booking by id.'

    try {
        const booking = await Booking.findById(
            req.params.id
            )
            res.status(200).json({booking:booking})
    } catch (err) {
        next(err)
    }
}

const getBookings = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get all booking.'

      try {
          const booking = await Booking.find({})
              res.status(200).json({booking:booking})
      } catch (err) {
          next(err)
      }
  }


const getOwnerBoookings = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get all owners booking.'

    try {
        const hotelid = req.params.hotelid
        const bookings = await Booking.find({'hotelDetails.hotelId':hotelid})
        if(bookings){
            res.status(200).json({Bookings:bookings})
        }else{
            res.status(404).send({message: 'No Booking associated with account'})
        }
    } catch (err) {
        next(err)
    }
}

const getOwnerSingleBookings = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get single owner's booking.'

    try {
        const hotelid = req.params.hotelid
        const bookingid = req.params.bookingid
        const booking = await Booking.findOne(
            {_id:bookingid, 'hotelDetails.hotelId':hotelid}
            )
        if(booking){
             res.status(200).json({Boooking:booking})

        }else{
                res.status(404).send({message: `No Booking associated with hotel or no booking with id ${bookingid}`})
        }

    } catch (err) {
        next(err)
    }
}

const getUserBoookings = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get all users booking.'

    try {
        const booking = await Booking.find({user:req.user.id})
        if(booking){
            res.status(200).json({userbooking:booking})
        }else{
            res.status(404).send({message: `You haven't created Booking yet`})
        }
    } catch (err) {
        next(err)
    }
}

const getUserSingleBookings = async (req, res, next)=>{
    // #swagger.tags = ['Bookings']
    // #swagger.description = 'Endpoint to get single user's booking.'

    try {
        const bookid = req.params.bookid
        const booking = await Booking.findOne(
            {_id:bookid, user:req.user.id}
            )
            if(booking){
                res.status(200).json({Boooking:booking})
           }else{
                   res.status(404).send({message: `Booking with id ${bookingid} cannot be found`})
           }
    } catch (err) {
        next(err)
    }
}

// const updateBooking = async (req, res, next)=>{
//     try {
//         const updatedHotel = await Hotel.findByIdAndUpdate(
//             req.params.id, 
//             {$set: req.body},
//             {new: true}
//             )
//             res.status(200).json(updatedHotel)
//     } catch (err) {
//         next(err)
//     }
// }

// const AdminHotel = async (req, res, next)=>{
//     try {
//         const updatedHotel = await Hotel.findByIdAndUpdate(
//             req.params.id, 
//             {$set: {...req.body, featured:req.body.featured, verified:req.body.verified , bookable:req.body.bookable   }},
//             {new: true}
//             )
//             res.status(200).json(updatedHotel)
//     } catch (err) {
//         next(err)
//     }
// }


module.exports ={
    createBooking, deleteBooking, getBooking, getBookings, getOwnerBoookings, getOwnerSingleBookings, getUserBoookings,  getUserSingleBookings
}