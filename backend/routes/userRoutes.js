import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  followerUnFollowerUser,
  updateUser,
  getUserProfile
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followerUnFollowerUser);
router.put("/update/:id", protectRoute, updateUser);

export default router;