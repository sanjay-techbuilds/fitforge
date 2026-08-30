// migration_v5.js
// This script CLEANS the sizeChart for all "Shoes" products.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import Product from './models/productModel.js';
import Category from './models/categoryModel.js';

dotenv.config();

const SHOE_CATEGORIES = ['shoes']; // From your screenshot

const cleanShoeCharts = async () => {
  try {
    await connectDB();
    console.log("Database connected...");

    // 1. Find all "Shoes" categories
    const shoeCategories = await Category.find({ 
      name: { $in: SHOE_CATEGORIES.map(s => new RegExp(`^${s}$`, 'i')) } 
    });
    const shoeCategoryIds = shoeCategories.map(c => c._id);

    // 2. Find all products in those categories
    const shoeProducts = await Product.find({ 
      category: { $in: shoeCategoryIds } 
    });

    if (shoeProducts.length === 0) {
      console.log("No 'Shoes' products found to clean.");
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${shoeProducts.length} shoe/sock products to clean...`);
    let count = 0;

    for (const product of shoeProducts) {
      let needsSave = false;
      
      // 3. Loop through the sizeChart array
      product.sizeChart.forEach(sizeEntry => {
        // 4. Check if the bad fields exist and remove them
        if (sizeEntry.height !== undefined) {
          sizeEntry.height = undefined;
          needsSave = true;
        }
        if (sizeEntry.chest !== undefined) {
          sizeEntry.chest = undefined;
          needsSave = true;
        }
        if (sizeEntry.waist !== undefined) {
          sizeEntry.waist = undefined;
          needsSave = true;
        }
        if (sizeEntry.hips !== undefined) {
          sizeEntry.hips = undefined;
          needsSave = true;
        }
      });

      // 5. Save the cleaned product
      if (needsSave) {
        await product.save();
        count++;
        console.log(`CLEANED: ${product.name}`);
      }
    }

    console.log(`\nCleaning Complete!`);
    console.log(`Successfully cleaned ${count} product charts.`);

  } catch (error) {
    console.error("\nCleaning failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

cleanShoeCharts();