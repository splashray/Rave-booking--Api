const express = require('express')
const router = express.Router()

const  {createHotel, deleteHotel, getHotel, getHotelRooms, getHotels, getOwnerHotels, getOwnerSingleHotel, updateHotel, AdminHotel, OwnersetHotelToBookable, getSearchHotels, getSearchHotelById } = require("../controllers/hotelController");
const { isKycOwner, isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");

// create hotel by verified owners
router.post("/", verifyToken, isVerifiedOwner, createHotel)

// Get hotels created by verified owner
router.get("/owners/", verifyToken, isVerifiedOwner, getOwnerHotels)

// Get hotel created by verified owners
router.get("/owners/:hotelid", verifyToken, isVerifiedOwner, getOwnerSingleHotel)

// update hotel by kyc owners
router.put("/bookable/:id", verifyToken, isVerifiedOwner, isKycOwner, OwnersetHotelToBookable)

// update hotel by verified owners
router.put("/edit/:id", verifyToken, isVerifiedOwner, updateHotel)

// update the hotel and set featured property to avaialble/true
router.put("/:id", verifyToken, verifyAdmin, AdminHotel)

//delete
router.delete("/:id", verifyToken, verifyAdmin, deleteHotel)


//get
router.get("/find/:id", getHotel)


//get all
router.get("/", getHotels)

// get search hotel
router.get("/searchresult/:searchInput", getSearchHotels)

// get search using selected hotel id
router.get('/searchbyid/:hotelCustomId', getSearchHotelById)

//get type
// router.get("/countByType", countByType)

//get room
router.get("/room/:id", getHotelRooms)


module.exports = router