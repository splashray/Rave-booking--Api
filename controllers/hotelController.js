const Hotel = require('../models/hotelModel')
const Room = require('../models/roomModel')
const {sendNewHotelRegistrationEmail} = require('../utils/email')

const createHotel = async (req, res, next) => {
    	// #swagger.tags = ['Hotels']
        // #swagger.description = 'Endpoint to create Hotel.'

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
                        //send hotel new listing email
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
    // #swagger.tags = ['Hotels']
    // #swagger.description = 'Endpoint to Update Hotel.'
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

const AdminHotel = async (req, res, next)=>{
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

const OwnersetHotelToBookable = async (req, res, next)=>{
    try {
        const updatedHotel = await Hotel.findByIdAndUpdate(
            req.params.id, 
            {$set: {bookable:req.body.bookable, featured:true}},
            {new: true}
            )
            if(!updatedHotel) return next(createError(401, "Hotel Not Found'!"))

            res.status(200).json(updatedHotel)
    } catch (err) {
        next(err)
    }
}

const deleteHotel = async (req, res, next)=>{
    // #swagger.tags = ['Hotels']
    // #swagger.description = 'Endpoint to Delete Hotel.'
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
    // #swagger.tags = ['Hotels']
    // #swagger.description = 'Endpoint to get a Hotel by id.'
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
    // #swagger.tags = ['Hotels']
    // #swagger.description = 'Endpoint to get all Hotels.'
      try {
          const hotels = await Hotel.find({})
              res.status(200).json({hotels:hotels})
      } catch (err) {
          next(err)
      }
  }

const getOwnerHotels = async (req, res, next)=>{
    	// #swagger.tags = ['Hotels']
        // #swagger.description = 'Endpoint to get Hotels by a specific owner.'

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
    // #swagger.tags = ['Hotels']
    // #swagger.description = 'Endpoint to get a Hotel by an id of a specific owner.'
    try {
        const hotel = await Hotel.findOne(
            {_id:req.params.hotelid, user:req.user.id}
            )
            res.status(200).json({hotel:hotel})
    } catch (err) {
        next(err)
    }
}

const getSearchHotels = async (req, res, next)=>{
    // #swagger.tags = ['Hotels']
    // #swagger.description = 'Endpoint to get Hotels by search queries.'
      try {
        const { searchInput } = req.params

        const searchParamsArr = searchInput.trim().split(' ')

        const hotelCity = searchParamsArr.length === 2 ? searchParamsArr[0] : searchInput

        const hotelName = searchParamsArr.length === 2 ? searchParamsArr[1] : ''

        let data = await Hotel.find({
            $and: [
                {'hotelBasicInfo.city': {$regex: hotelCity, $options: 'i'}},
                {'hotelBasicInfo.hotelName': {$regex: hotelName, $options: 'i'}}
            ]}
        ).exec()
        
        if(!data){
            data = await Hotel.find({
                $or: [{'hotelBasicInfo.city': {$regex: hotelCity, $options: 'i'}},
                {'hotelBasicInfo.hotelName': {$regex: hotelName, $options: 'i'}} 
            ]})
        }

        res.send(data)

      } catch (err) {
          next(err)
      }
}

const getSearchHotelById = async (req, res, next)=>{
    
    try {
    const { hotelCustomId } = req.params    

    const searchResultsArr = []

    let matchedHotel = await Hotel.findOne({ hotelCustomId }).exec()
    
    searchResultsArr.push(matchedHotel)

    otherHotels = await Hotel.find({
        'hotelBasicInfo.city': {$regex: matchedHotel.hotelBasicInfo.city, $options: 'i'}, 
        hotelCustomId: {$ne : hotelCustomId}
    })
    
    searchResultsArr.push(...otherHotels)

    res.send(searchResultsArr)

    } catch (err) {
        next(err)
    }
}

// const getSearchHotels = async (req, res, next)=>{
//   const {hotelName, state, ...others}= req.query
//     try {
//         const hotels = await Hotel.find({
//             ...others,
//              hotelName: hotelName, 
//              state : state
//             })
//             res.status(200).json(hotels)
//     } catch (err) {
//         next(err)
//     }
// }

// const getSearchHotels = async (req, res, next)=>{
//     const {hotelName, state, ...others}= req.query
//       try {
//           const hotels = await Hotel.find({
//               ...others,
              
//           }).limit(req.query.limit)
//               res.status(200).json(hotels)
//       } catch (err) {
//           next(err)
//       }
//   }

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
    // #swagger.tags = ['Rooms']
    // #swagger.description = 'Endpoint to get Roooms by a specific hotel.'
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
    createHotel, 
    updateHotel, 
    AdminHotel, 
    OwnersetHotelToBookable, 
    deleteHotel, 
    getHotel, 
    getHotels, 
    getOwnerHotels, 
    getOwnerSingleHotel,
    getHotelRooms, 
    getSearchHotels,
    getSearchHotelById
}