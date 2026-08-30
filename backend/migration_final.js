// migration_final.js
//
// This is the FINAL script. It will:
// 1. Find ALL products.
// 2. Check their category.
// 3. Assign the CORRECT size chart and inventory based on category.
// ---------------------------------------------------------------------

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// --- CHECK THESE PATHS ---
import Product from './models/productModel.js';
import Category from './models/categoryModel.js';

dotenv.config();

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


const migrateProducts = async () => {
  try {
    await connectDB();
    console.log("Database connected...");

    // Find ALL products and populate their category
    const allProducts = await Product.find({}).populate('category');

    if (allProducts.length === 0) {
      console.log("No products found.");
      mongoose.disconnect();
      return;
    }

    console.log(`Checking ${allProducts.length} products...`);
    let count = 0;

    for (const product of allProducts) {
      const categoryName = product.category ? product.category.name.toLowerCase() : "";

      let chartToUse;
      let sizesToUse;
      let needsUpdate = false;

      // --- 1. Decide which chart to use ---
      if (categoryName === 'shoes') {
        chartToUse = SHOE_CHART;
        sizesToUse = SHOE_SIZES;
        // Check if it needs updating
        if (!product.sizeChart[0]?.length) {
          needsUpdate = true;
        }
      } else if (['shirts', 'pants', 't-shirts', 'hoodies'].includes(categoryName)) {
        chartToUse = CLOTHING_CHART;
        sizesToUse = CLOTHING_SIZES;
        // Check if it needs updating
        if (!product.sizeChart[0]?.chest || !product.sizeChart[0]?.hips) {
          needsUpdate = true;
        }
      } else {
        // Skip products with unknown categories
        continue;
      }

      // --- 2. Check if this product is using the OLD 'countInStock' field ---
      const oldStock = product._doc.countInStock;
      if (oldStock !== undefined && oldStock !== null) {
        needsUpdate = true; // It's an old product, it must be migrated

        // Create new inventory by distributing the old stock
        const stockPerSize = Math.floor(oldStock / sizesToUse.length);
        const remainder = oldStock % sizesToUse.length;

        product.inventory = sizesToUse.map((size, index) => ({
          size: size,
          countInStock: index === 0 ? stockPerSize + remainder : stockPerSize,
        }));

        // Unset the old fields
        product.set('countInStock', undefined, { strict: false });
        product.set('quantity', undefined, { strict: false });
      }
      
      // --- 3. Save if needed ---
      if (needsUpdate) {
        product.sizeChart = chartToUse; // Assign the correct chart
        await product.save();
        count++;
        console.log(`Fixed: ${product.name} (Category: ${categoryName})`);
      }
    }

    console.log(`\nMigration Complete!`);
    console.log(`Checked ${allProducts.length} products.`);
    console.log(`Updated ${count} products.`);

  } catch (error) {
    console.error("\nMigration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

// Run the migration
migrateProducts();