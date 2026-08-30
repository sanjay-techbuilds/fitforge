import express from 'express';
import { performVirtualTryOn } from '../controllers/tryOnController.js';
// You will need multer here for file uploads
import upload from '../middlewares/uploadMiddleware.js'; // Adjust path if needed

const router = express.Router();

// This sets up the POST /api/try-on endpoint
// It uses multer to handle 'personImage' and 'clothingImage' file fields
router.post(
  '/', 
  upload.fields([{ name: 'personImage', maxCount: 1 }, { name: 'clothingImage', maxCount: 1 }]), 
  performVirtualTryOn
);

export default router;