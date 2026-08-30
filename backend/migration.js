// migration.js
//
// This is a one-time script to update all old products to the new schema
// with 'inventory' and 'sizeChart' arrays.
// ---------------------------------------------------------------------

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// --- IMPORTANT: CHECK THESE PATHS ---
import Product from './models/productModel.js';
import Category from './models/categoryModel.js'; // We need this to read the category name
// -----------------------------------

// Load environment variables
dotenv.config();

// --- Default Size Charts (from your old ProductDetails.jsx) ---
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
    // 1. Connect to the database
    await connectDB();
    console.log("Database connected...");

    // 2. Find all products that have NOT been migrated yet
    // We check for 'inventory' field. If it doesn't exist, we migrate.
    const productsToMigrate = await Product.find({ 
      inventory: { $exists: false } 
    });

    if (productsToMigrate.length === 0) {
      console.log("All products are already up-to-date. No migration needed.");
      mongoose.disconnect();
      return;
    }

    console.log(`Found ${productsToMigrate.length} products to migrate...`);
    let count = 0;

    // 3. Loop through each product
    for (const product of productsToMigrate) {
      // Get the old stock value.
      // We use ._doc.countInStock to get the raw value from the DB,
      // bypassing the new "virtual" getter.
      const oldStock = product._doc.countInStock || 0;
      
      // Get the category name
      await product.populate('category');
      const categoryName = product.category ? product.category.name : "";

      let chartToUse;
      let sizesToUse;

      // 4. Decide which chart and sizes to use
      if (categoryName.toLowerCase() === 'shoes') {
        chartToUse = SHOE_CHART;
        sizesToUse = SHOE_SIZES;
      } else {
        // Default for "Shirts", "Pants", "T-shirts", "Hoodies", etc.
        chartToUse = CLOTHING_CHART;
        sizesToUse = CLOTHING_SIZES;
      }

      // 5. Create new inventory by distributing the old stock
      const stockPerSize = Math.floor(oldStock / sizesToUse.length);
      const remainder = oldStock % sizesToUse.length;

      const newInventory = sizesToUse.map((size, index) => ({
        size: size,
        countInStock: index === 0 ? stockPerSize + remainder : stockPerSize, // Add remainder to the first size
      }));

      // 6. Update the product document
      product.inventory = newInventory;
      product.sizeChart = chartToUse;

      // 7. Tell Mongoose to remove the old, undefined fields from the DB
      product.set('countInStock', undefined, { strict: false });
      product.set('quantity', undefined, { strict: false });

      // 8. Save the updated product
      await product.save();
      count++;
      console.log(`Migrated: ${product.name} (${categoryName})`);
    }

    console.log(`\nMigration Complete!`);
    console.log(`Successfully updated ${count} products.`);

  } catch (error) {
    console.error("\nMigration failed:", error);
  } finally {
    // 9. Disconnect from the DB
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

// Run the migration
migrateProducts();