// backend/controllers/tryOnController.js
import asyncHandler from '../middlewares/asyncHandler.js';

const performVirtualTryOn = asyncHandler(async (req, res) => {
  // This is a paid feature. To prevent charges, it is disabled.
  res.status(503); // Service Unavailable
  throw new Error('The Virtual Try-On feature is a paid service and has been disabled to prevent charges.');
});

export { performVirtualTryOn };