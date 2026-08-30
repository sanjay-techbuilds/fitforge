import express from "express";

const router = express.Router();

// Simple ML mock: recommend size based on chest
router.post("/recommend-size", (req, res) => {
  const { chest } = req.body;
  let size = "M";

  if (chest < 90) size = "S";
  else if (chest < 95) size = "M";
  else if (chest < 100) size = "L";
  else size = "XL";

  res.json({ recommendedSize: size });
});

export default router;
