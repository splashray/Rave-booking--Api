import  express  from "express";
import { checkEmail, checkUserEmail, ownerLogin, ownerRegister, userLogin, userRegister } from "../controllers/authController.js";

const router = express.Router()

//Only Owner sections
router.post("/owner/register/check",checkEmail)

router.post("/owner/register", ownerRegister)
router.post("/owner/login", ownerLogin)

//Only Admin/users sections
router.post("/user/register/check",checkUserEmail)
router.post("/user/register", userRegister)
router.post("/user/login", userLogin)

export default router