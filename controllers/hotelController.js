const Hotel = require('../models/hotelModel')
const Room = require('../models/roomModel')
const {sendNewHotelRegistrationEmail} = require('../utils/email')

const createHotel = async (req, res, next) => {
    const generateId = async() => {
        // genhotelCustomId 
        var genhotelCustomId = Math.floor(Math.random() * 10000000) + 10000000
        //search for availability of generated id
        const search = await Hotel.findOne({hotelCustomId:genhotelCustomId})
            if(!search){
                const newHotel = new Hotel({
                    ...req.body, 
                    hotelCustomId: `AOW${genhotelCustomId}`,  
                    user: req.user.id, 
                    email:req.user.email 
                })
                try {
                    newHotel.save()
                    .then(result=>{
                        // handle account verification
                        sendNewHotelRegistrationEmail(result, res)
                    }).catch(err =>{
                        console.log(err);
                        res.json({status:"FAILED", message:"An error occurred while saving hotel details"})
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

const updateHotel = async (req, res, next)=>{
    try {
        const updatedHotel = await Hotel.findByIdAndUpdate(
            req.params.id, 
            {$set: req.body},
            {new: true}
            )
            res.status(200).json(updatedHotel)
    } catch (err) {
        next(err)
    }
}

const FeaturedHotel = async (req, res, next)=>{
    try {
        const updatedHotel = await Hotel.findByIdAndUpdate(
            req.params.id, 
            {$set: {...req.body, featured:req.body.featured, verified:req.body.verified , bookable:req.body.bookable   }},
            {new: true}
            )
            res.status(200).json(updatedHotel)
    } catch (err) {
        next(err)
    }
}

const deleteHotel = async (req, res, next)=>{
    try {
        await Hotel.findByIdAndDelete(
            req.params.id
        )
        res.status(200).json({message:`hotel has been deleted`})
    } catch (err) {
        next(err)
    }
}

const getHotel = async (req, res, next)=>{
    try {
        const hotel = await Hotel.findById(
            req.params.id
            )
            res.status(200).json({hotel:hotel})
    } catch (err) {
        next(err)
    }
}

const getHotels = async (req, res, next)=>{
      try {
          const hotels = await Hotel.find({})
              res.status(200).json({hotels:hotels})
      } catch (err) {
          next(err)
      }
  }

const getOwnerHotels = async (req, res, next)=>{
    try {
        // const ownerId = req.params.ownerid
        const hotels = await Hotel.find({user:req.user.id})
        if(hotels){
            res.status(200).json({hotels:hotels})
        }else{
            res.status(404).send({message: 'hotels created are empty, add atleast one'})
        }
    } catch (err) {
        next(err)
    }
}

const getOwnerSingleHotel = async (req, res, next)=>{
    try {
        const hotel = await Hotel.findOne(
            {_id:req.params.hotelid, user:req.user.id}
            )
            res.status(200).json({hotel:hotel})
    } catch (err) {
        next(err)
    }
}

//  const getHotels = async (req, res, next)=>{
//   const {min, max, ...others}= req.query
//     try {
//         const hotels = await Hotel.find({
//             ...others,
//             cheapestPrice: {$gt: min | 1, $lt: max || 999},
//         }).limit(req.query.limit)
//             res.status(200).json(hotels)
//     } catch (err) {
//         next(err)
//     }
// }

//  const countByCity = async (req, res, next)=>{
//     const cities = req.query.cities.split(",")
//     try {
//         const list = await Promise.all(cities.map(city=>{
//             return Hotel.countDocuments({city:city})
//         }))
//         res.status(200).json(list)
//     } catch (err) {
//         next(err)
//     }
// }

//  const countByType = async (req, res, next)=>{
//     try {
//         const hotelCount = await Hotel.countDocuments({ type: "hotel" });
//         const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
//         const resortCount = await Hotel.countDocuments({ type: "resort" });
//         const villaCount = await Hotel.countDocuments({ type: "villa" });
//         const cabinCount = await Hotel.countDocuments({ type: "cabin" });
    
//         res.status(200).json([
//           { type: "hotel", count: hotelCount },
//           { type: "apartments", count: apartmentCount },
//           { type: "resorts", count: resortCount },
//           { type: "villas", count: villaCount },
//           { type: "cabins", count: cabinCount },
//         ]);
//     } catch (err) {
//         next(err)
//     }
// }

const getHotelRooms = async (req, res, next)=>{
    try{
        const hotel = await Hotel.findById(req.params.id)
        const list = await Promise.all(hotel.rooms.map(room=>{
            return Room.findById(room)
        }))
            res.status(200).json({Rooms:list})
    }catch(err){
        next(err)
    }
}


module.exports ={
    createHotel, updateHotel, FeaturedHotel, deleteHotel, getHotel, getHotels, getOwnerHotels, getOwnerSingleHotel,getHotelRooms
}