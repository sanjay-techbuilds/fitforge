// routes/sizeProfileRoutes.js

import express from "express";
import asyncHandler from "express-async-handler";
import SizeProfile from "../models/sizeProfileModel.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET user's size profile (No changes needed here)
router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const profile = await SizeProfile.findOne({ user: req.user._id });
      if (profile) return res.json(profile);
      return res.status(404).json({ message: "Profile not found" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
);

// POST or UPDATE user's size profile (This is where we make changes)
router.post(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    
    // --- 1. ADD 'preferredFit' to destructuring ---
    const { height, weight, chest, waist, hips, gender, shoeSize, preferredFit } = req.body;

    // --- 2. ADD 'preferredFit' to validation ---
    if (!height || !weight || !chest || !waist || !hips || !gender || !preferredFit) {
      return res.status(400).json({ message: "All fields, including preferred fit, are required" });
    }

    let profile = await SizeProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      profile.height = height;
      profile.weight = weight;
      profile.chest = chest;
      profile.waist = waist;
      profile.hips = hips;
      profile.gender = gender;
      
      // --- 3. ADD 'preferredFit' to the update logic ---
      profile.preferredFit = preferredFit; 

      profile.shoeSize = shoeSize || profile.shoeSize;
    } else {
      // Create new profile
      profile = new SizeProfile({
        user: req.user._id,
        height,
        weight,
        chest,
        waist,
        hips,
        gender,
        
        // --- 4. ADD 'preferredFit' to the create logic ---
        preferredFit, 

        shoeSize,
      });
    }

    const savedProfile = await profile.save();
    res.json(savedProfile);
  })
);

export default router;