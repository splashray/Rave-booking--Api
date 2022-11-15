const express = require('express')
const router = express.Router()
const  { deleteOwner, getOwner, getOwners, updateOwner, updateOwnerPassword } = require("../controllers/ownerController");
const { verifyAdmin, verifyToken } = require("../utils/verifyToken");


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

module.exports = router