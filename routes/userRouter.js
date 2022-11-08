import  express  from "express";
import { deleteUser, getUser, getUsers, updateUser, updateUserPassword } from "../controllers/userController.js";
import { isKycOwner, isVerifiedOwner, verifyAdmin, verifyToken } from "../utils/verifyToken.js";

const router = express.Router()

router.get("/verify/", verifyToken, isVerifiedOwner, (req,res)=>{
    res.json(req.user)
})
router.get("/verify/kyc", verifyToken, isKycOwner, (req,res)=>{
    res.json(req.user)
})
router.get("/verify/admin", verifyToken, verifyAdmin, (req,res)=>{
    res.json(req.user)
})


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