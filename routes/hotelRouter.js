import  express  from "express";
import {createHotel, deleteHotel, FeaturedHotel, getHotel, getHotelRooms, getHotels, getOwnerHotels, getOwnerSingleHotel, updateHotel } from "../controllers/hotelController.js";
import { isKycOwner, isVerifiedOwner, verifyAdmin, verifyToken } from "../utils/verifyToken.js";

const router = express.Router()

// create hotel by verified owners
router.post("/", verifyToken, isVerifiedOwner, createHotel)

// Get hotels created by verified owner
router.get("/owners/", verifyToken, isVerifiedOwner, getOwnerHotels)

// Get hotel created by verified owners
router.get("/owners/:hotelid", verifyToken, isVerifiedOwner, getOwnerSingleHotel)

// update hotel by verified owners
router.put("/edit/:id", verifyToken, isVerifiedOwner, updateHotel)

// update the hotel and set featured property to avaialble/true
router.put("/:id", verifyToken, verifyAdmin, FeaturedHotel)

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

//get room
router.get("/room/:id", getHotelRooms)


export default router