import express from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import SizeProfile from "../models/sizeProfileModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET user's size profile
router.get("/", protect, asyncHandler(async (req, res) => {
  const profile = await SizeProfile.findOne({ user: req.user._id });
  if (profile) res.json(profile);
  else res.status(404).json({ message: "Profile not found" });
}));

// POST/UPDATE size profile
router.post("/", protect, asyncHandler(async (req, res) => {
  const { chest, waist, hip, height } = req.body;
  let profile = await SizeProfile.findOne({ user: req.user._id });

  if (profile) {
    profile.chest = chest;
    profile.waist = waist;
    profile.hip = hip;
    profile.height = height;
    await profile.save();
  } else {
    profile = await SizeProfile.create({
      user: req.user._id,
      chest,
      waist,
      hip,
      height,
    });
  }

  res.json(profile);
}));

export default router;
