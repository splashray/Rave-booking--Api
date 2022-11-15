const express = require('express')
const router = express.Router()
const { createRoom, deleteRoom, getRoom, getRooms, updateRoom } = require("../controllers/roomController");
const { isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");


// create
router.post("/:hotelid", verifyToken, isVerifiedOwner, createRoom)

//update
router.put("/:id", verifyToken, isVerifiedOwner, updateRoom)

//delete
router.delete("/:id/:hotelid", verifyToken, verifyAdmin, deleteRoom)

//get  
router.get("/:id", getRoom)

//get all
router.get("/", getRooms)

module.exports = router