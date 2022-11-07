import  express  from "express";
import {createHotel, deleteHotel, getHotel, getHotels, updateHotel } from "../controllers/hotelController.js";
import { verifyAdmin, verifyToken } from "../utils/verifyToken.js";

const router = express.Router()

// create
router.post("/", verifyToken, createHotel)

// update hotel by owners
router.put("/:id", verifyToken, updateHotel)

// update the hotel and set featured property to avaialble/true
router.put("/:id", verifyToken, verifyAdmin, updateHotel)

//delete
router.delete("/:id", verifyToken, verifyAdmin, deleteHotel)

//get
router.get("/find/:id", getHotel)

//get all
router.get("/", getHotels)

//get city
// router.get("/countByCity", countByCity)

// //get type
// router.get("/countByType", countByType)

// //get room
// router.get("/room/:id", getHotelRooms)

export default router