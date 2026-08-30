// models/sizeProfileModel.js

import mongoose from "mongoose";

const sizeProfileSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    chest: { type: Number, required: true },
    waist: { type: Number, required: true },
    hips: { type: Number, required: true },
    gender: { type: String, required: true },
    
    // --- ADDED THIS LINE ---
    preferredFit: { type: String, required: true }, 
    // ----------------------

    shoeSize: { type: Number, required: false },
  },
  { timestamps: true }
);

const SizeProfile = mongoose.model("SizeProfile", sizeProfileSchema);
export default SizeProfile;