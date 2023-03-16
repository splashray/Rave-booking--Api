const express = require('express')
const router = express.Router()
const { deleteUser, getUser, getUsers, updateUser, updateUserPassword } = require("../controllers/userController");
const {isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");


router.get("/verify/", verifyToken, isVerifiedOwner, (req,res)=>{
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

module.exports = router