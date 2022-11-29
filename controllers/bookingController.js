const Booking = require('../models/bookingModel')
const {sendNewBookingEmail} = require('../utils/email')

const createBooking = async (req, res, next) => {
    	// #swagger.tags = ['Bookings']
        // #swagger.description = 'Endpoint to create booking.'

    const generateId = async() => {
        // genbookingCustomId 
        var genbookingCustomId = Math.floor(Math.random() * 10000000) + 10000000
        //search for availability of generated id
        const search = await Booking.findOne({bookingId:genbookingCustomId})
            if(!search){
                var number = req.body.price;
                var percentToGet = 10;
                var percentCom = (percentToGet / 100) * number;   
                const newBooking = new Booking({
                    ...req.body, 
                    bookingId: `DA${genbookingCustomId}`,  
                    email: req.body.email,
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


// const updateHotel = async (req, res, next)=>{
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


// const OwnersetHotelToBookable = async (req, res, next)=>{
//     try {
//         const updatedHotel = await Hotel.findByIdAndUpdate(
//             req.params.id, 
//             {$set: {bookable:req.body.bookable, featured:true}},
//             {new: true}
//             )
//             if(!updatedHotel) return next(createError(401, "Hotel Not Found'!"))

//             res.status(200).json(updatedHotel)
//     } catch (err) {
//         next(err)
//     }
// }


// const getOwnerHotels = async (req, res, next)=>{
//     try {
//         // const ownerId = req.params.ownerid
//         const hotels = await Hotel.find({user:req.user.id})
//         if(hotels){
//             res.status(200).json({hotels:hotels})
//         }else{
//             res.status(404).send({message: 'hotels created are empty, add atleast one'})
//         }
//     } catch (err) {
//         next(err)
//     }
// }

// const getOwnerSingleHotel = async (req, res, next)=>{
//     try {
//         const hotel = await Hotel.findOne(
//             {_id:req.params.hotelid, user:req.user.id}
//             )
//             res.status(200).json({hotel:hotel})
//     } catch (err) {
//         next(err)
//     }
// }

module.exports ={
    createBooking, deleteBooking, getBooking, getBookings, 
}