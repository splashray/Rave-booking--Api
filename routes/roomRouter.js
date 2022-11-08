import  express  from "express";
import { createRoom, deleteRoom, getRoom, getRooms, updateRoom } from "../controllers/roomController.js";
import { isVerifiedOwner, verifyAdmin, verifyToken } from "../utils/verifyToken.js";

const router = express.Router()

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

export default router