const express = require('express')
const router = express.Router()
const { createRoom, deleteRoom, getRoom, getRooms, updateRoom, getOwnerRooms, getOwnerSingleRoom } = require("../controllers/roomController");
const { isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");


// create
//get owners all room
router.get("/owners/all/:hotelid", verifyToken, isVerifiedOwner,  getOwnerRooms)

router.post("/one/:hotelid", verifyToken, isVerifiedOwner, createRoom)

//update
router.put("/:id", verifyToken, isVerifiedOwner, updateRoom)

//delete
router.delete("/:id/:hotelid", verifyToken, verifyAdmin, deleteRoom)

//get  
router.get("/:id", getRoom)


//get all
router.get("/", verifyToken, verifyAdmin,  getRooms)

//get owners single room
router.get("/owners/:roomid/:hotelid", verifyToken, isVerifiedOwner,  getOwnerSingleRoom)



module.exports = router