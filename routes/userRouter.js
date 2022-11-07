import  express  from "express";
import { deleteUser, getUser, getUsers, updateUser, updateUserPassword } from "../controllers/userController.js";
import { verifyAdmin, verifyToken } from "../utils/verifyToken.js";

const router = express.Router()

//update except password and email
router.put("/:id",verifyToken, updateUser)

//update password
router.put("/pass/:id",verifyToken, updateUserPassword)

//delete
router.delete("/:id",verifyToken, verifyAdmin, deleteUser)

//get
router.get("/:id",verifyToken, getUser)

//get all
router.get("/", verifyToken, verifyAdmin, getUsers)

export default router