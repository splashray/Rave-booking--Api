import Hotel from "../models/hotelModel.js"
import Room from "../models/roomModel.js"

export const createHotel = async (req, res, next)=>{
    const newHotel = new Hotel({...req.body,  user: req.user.id})
    try {
        const savedHotel = await newHotel.save()
        res.status(200).json(savedHotel)
    } catch (err) {
        next(err)
    }
}

export const updateHotel = async (req, res, next)=>{
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

export const FeaturedHotel = async (req, res, next)=>{
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

export const deleteHotel = async (req, res, next)=>{
    try {
        await Hotel.findByIdAndDelete(
            req.params.id
        )
        res.status(200).json({message:`hotel has been deleted`})
    } catch (err) {
        next(err)
    }
}

export const getHotel = async (req, res, next)=>{
    try {
        const hotel = await Hotel.findById(
            req.params.id
            )
            res.status(200).json({hotel:hotel})
    } catch (err) {
        next(err)
    }
}

export const getHotels = async (req, res, next)=>{
      try {
          const hotels = await Hotel.find({})
              res.status(200).json({hotels:hotels})
      } catch (err) {
          next(err)
      }
  }

  export const getOwnerHotels = async (req, res, next)=>{
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

export const getOwnerSingleHotel = async (req, res, next)=>{
    try {
        const hotel = await Hotel.findOne(
            {_id:req.params.hotelid, user:req.user.id}
            )
            res.status(200).json({hotel:hotel})
    } catch (err) {
        next(err)
    }
}

// export const getHotels = async (req, res, next)=>{
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

// export const countByCity = async (req, res, next)=>{
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

// export const countByType = async (req, res, next)=>{
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

export const getHotelRooms = async (req, res, next)=>{
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