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
    // #swagger.tags = ['Hotels']
    // #swagger.description = 'Endpoint to Update(Admin to update) Hotel.'
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
    // #swagger.tags = ['Hotels']
    // #swagger.description = 'Endpoint to Update Owners Hotel to Bookable(Admin to update).'
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

    const { searchInput } = req.params
    
    const searchParamsArr = searchInput.trim().split(' ').map(searchParam => (new RegExp(searchParam, 'i')))
    
    function getCombinations(valuesArray){
    
        var combi = [];
        var temp = [];
        var slent = Math.pow(2, valuesArray.length);
        
        for (var i = 0; i < slent; i++)
        {
            temp = [];
            for (var j = 0; j < valuesArray.length; j++)
            {
                if ((i & Math.pow(2, j)))
                {
                    temp.push(valuesArray[j]);
                }
            }
            if (temp.length == searchParamsArr.length)
            {
                combi.push({$and: temp});
            }
        }
        
        return combi;
    }

      try {

        const queryOptionsArr = [
            {'hotelBasicInfo.city':  {$in: searchParamsArr}},
            {'hotelBasicInfo.hotelName':  {$in: searchParamsArr}},
            {'hotelBasicInfo.state':  {$in: searchParamsArr}},
            {'hotelBasicInfo.country':  {$in: searchParamsArr}},
            {'hotelBasicInfo.streetAddress':  {$in: searchParamsArr}} 
        ]

        const allQueryCombinations = []

        for(let x = 0; x < searchParamsArr.length; x++){
            allQueryCombinations.push(...getCombinations(queryOptionsArr))
        }

        data = await Hotel.find({ $or: allQueryCombinations }).exec()

        res.status(200).send(data)

      } catch (err) {
          next(err)
      }
}

const getSearchHotelById = async (req, res, next)=>{
    // #swagger.tags = ['Hotels']
    // #swagger.description = 'Endpoint to get Hotels by search of Id.'
    
    try {
    const { hotelCustomId } = req.params    

    const searchResultsArr = []

    let matchedHotel = await Hotel.findOne({ hotelCustomId }).exec()
    
    searchResultsArr.push(matchedHotel)

    otherHotels = await Hotel.find({
        'hotelBasicInfo.city': {$regex: matchedHotel.hotelBasicInfo.city.trim(), $options: 'i'}, 
        hotelCustomId: {$ne : hotelCustomId}
    })
    
    searchResultsArr.push(...otherHotels)

    res.status(200).send(searchResultsArr)

    } catch (err) {
        next(err)
    }
}

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