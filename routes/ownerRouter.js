import  express  from "express";
import { deleteOwner, getOwner, getOwners, updateOwner, updateOwnerPassword } from "../controllers/ownerController.js";
import { verifyAdmin, verifyToken } from "../utils/verifyToken.js";

const router = express.Router()

//update except password and email
router.put("/:id",verifyToken, updateOwner)

//update password
router.put("/pass/:id",verifyToken, updateOwnerPassword)

//delete
router.delete("/:id",verifyToken, verifyAdmin, deleteOwner)

//get
router.get("/:id",verifyToken, getOwner)

//get all
router.get("/", verifyToken, verifyAdmin, getOwners)

export default router