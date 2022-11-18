const Room = require('../models/roomModel')
const Hotel = require('../models/hotelModel')
const createError = require('../utils/error')

const createRoom =  async(req,res, next) =>{
    const generateId = async() => {
                // generateCustomId 
                var generateCustomId = Math.floor(Math.random() * 10000000) + 10000000
                //search for availability of generated id
                const search = await Room.findOne({roomCustomId:generateCustomId})

                if(!search){
                        try {
                            const hotelId = req.params.hotelid
                            const searchHotel = await Hotel.findOne({_id:hotelId})
                            if(searchHotel){
                                const newRoom = new Room({...req.body, roomCustomId:`RN${generateCustomId}`, user: req.user.id})
                                const savedRoom = await newRoom.save()
                                try {
                                    await Hotel.findByIdAndUpdate(hotelId,{
                                        $push: {rooms: savedRoom._id},
                                    })
                                } catch (err) {
                                    next(err)
                                }
                                res.status(200).json({savedRoom:savedRoom})
                            }else{
                                res.status(404).json(`Hotel not found`)
                            }

                        } catch (err) {
                                next(err)
                    }

                }else{
                    generateId()
                }
    }
    generateId()
}

const updateRoom = async (req, res, next)=>{
    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id, 
            {$set: req.body},
            {new: true}
            )
            res.status(200).json({updatedRoom: updatedRoom})
    } catch (err) {
        next(err)
    }
}
const deleteRoom = async (req, res, next)=>{
    const hotelId = req.params.hotelid
    try {
        await Room.findByIdAndDelete(req.params.id)
        try {
            await Hotel.findByIdAndUpdate(hotelId, {
                $pull: {rooms: req.params.id },
            })
        } catch (err) {
            next(err)
        }
        res.status(200).json({message:`Room has been deleted`})
    

    } catch (err) {
        next(err)
    }
}
const getRoom = async (req, res, next)=>{
    try {
        const room = await Room.findById(
            req.params.id
            )
            res.status(200).json({room:room})
    } catch (err) {
        next(err)
    }
}

const getRooms = async (req, res, next)=>{
    try {
        const rooms = await Room.find()
            res.status(200).json({rooms:rooms})
    } catch (err) {
        next(err)
    }
}

const getOwnerRooms = async (req, res, next)=>{
    try {
        const rooms = await Room.find({user:req.user.id})
        if(rooms){
            res.status(200).json({rooms:rooms})
        }else{
            res.status(404).send({message: 'Room created are empty, add atleast one'})
        }
    } catch (err) {
        next(err)
    }
}

const getOwnerSingleRoom = async (req, res, next)=>{
    try {
        const room = await Room.findOne({_id:req.params.roomid, user:req.user.id})
            res.status(200).json({room:room})
    } catch (err) {
        next(err)
    }
}


module.exports ={
    createRoom, updateRoom, deleteRoom, getRoom, getRooms, getOwnerSingleRoom, getOwnerRooms
}