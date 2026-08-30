// migration_v3.js
//
// This is the definitive script. It finds all products that
// still have the old 'countInStock' field and migrates them.
// ---------------------------------------------------------------------

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// --- CHECK THESE PATHS ---
import Product from './models/productModel.js';
import Category from './models/categoryModel.js';

dotenv.config();

// Category names from your screenshot
const SHOE_CATEGORIES = ['shoes'];
const CLOTHING_CATEGORIES = ['shirts', 'pants', 't-shirts', 'hoodies'];

// --- Default Size Charts ---
const CLOTHING_CHART = [
  { size: "S", height: [150, 165], chest: [80, 90], waist: [60, 70], hips: [85, 95] },
  { size: "M", height: [165, 175], chest: [90, 100], waist: [70, 80], hips: [95, 105] },
  { size: "L", height: [175, 185], chest: [100, 110], waist: [80, 90], hips: [105, 115] },
  { size: "XL", height: [185, 195], chest: [110, 120], waist: [90, 100], hips: [115, 125] },
  { size: "XXL", height: [195, 210], chest: [120, 130], waist: [100, 110], hips: [125, 135] },
];
const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];

const SHOE_CHART = [
  { size: "6", length: [24, 24.5] },
  { size: "7", length: [25, 25.4] },
  { size: "8", length: [26, 26.2] },
  { size: "9", length: [27, 27] },
  { size: "10", length: [27.5, 27.8] },
  { size: "11", length: [28, 28.8] },
  { size: "12", length: [29, 29.6] },
];
const SHOE_SIZES = ["6", "7", "8", "9", "10", "11", "12"];
// --------------------------------------------------------------

const migrateOldProducts = async () => {
  try {
    await connectDB();
    console.log("Database connected...");

    // 1. Find ONLY products that need migration
    const productsToMigrate = await Product.find({ 
      countInStock: { $exists: true } 
    }).populate('category');

    if (productsToMigrate.length === 0) {
      console.log("All products are already migrated! No work to do.");
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${productsToMigrate.length} old products to migrate...`);
    let count = 0;

    for (const product of productsToMigrate) {
      if (!product.category) {
        console.log(`Skipping: ${product.name} (no category)`);
        continue;
      }

      const categoryName = product.category.name.toLowerCase();
      
      // Get the old stock value from the document
      const oldStock = product._doc.countInStock || 0;

      let chartToUse;
      let sizesToUse;

      // 2. Assign the correct chart and size list
      if (SHOE_CATEGORIES.includes(categoryName)) {
        chartToUse = SHOE_CHART;
        sizesToUse = SHOE_SIZES;
      } else if (CLOTHING_CATEGORIES.includes(categoryName)) {
        chartToUse = CLOTHING_CHART;
        sizesToUse = CLOTHING_SIZES;
      } else {
        console.log(`Skipping: ${product.name} (unknown category: ${categoryName})`);
        continue;
      }

      // 3. Create new inventory
      const stockPerSize = Math.floor(oldStock / sizesToUse.length);
      const remainder = oldStock % sizesToUse.length;
      const newInventory = sizesToUse.map((size, index) => ({
        size: size,
        countInStock: index === 0 ? stockPerSize + remainder : stockPerSize,
      }));

      // 4. Update the product
      product.inventory = newInventory;
      product.sizeChart = chartToUse;
      
      // 5. Unset the old fields
      product.set('countInStock', undefined, { strict: false });
      product.set('quantity', undefined, { strict: false });

      await product.save();
      count++;
      console.log(`FIXED: ${product.name} (Category: ${categoryName})`);
    }

    console.log(`\nMigration Complete!`);
    console.log(`Successfully migrated ${count} products.`);

  } catch (error) {
    console.error("\nMigration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

migrateOldProducts();