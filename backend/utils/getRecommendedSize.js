// utils/getRecommendedSize.js
// FINAL, SIMPLIFIED VERSION (with typo removed)

/**
 * Checks if a specific size is in stock.
 */
const isSizeAvailable = (size, inventory) => {
  if (!inventory || inventory.length === 0) return null;
  const sizeStr = String(size);
  const stockItem = inventory.find((item) => String(item.size) === sizeStr);
  return stockItem && stockItem.countInStock > 0;
};

/**
 * Recommends a size for CLOTHING (Tops & Pants)
 */
// --- THIS IS THE FIXED LINE ---
const getClothingSize = (userProfile, product) => {
  const { chest, waist, hips, preferredFit } = userProfile;
  const { sizeChart, inventory, category } = product;
  const categoryName = category.name.toLowerCase();
  
  // 1. Check for required measurements
  if (categoryName === 'pants' && !hips) return null;
  if (categoryName !== 'pants' && !chest) return null;

  // 2. Find Baseline (Regular) Fit
  let regularFit = null;
  if (categoryName === 'pants') {
    // Pants logic: Prioritize WAIST
    regularFit = sizeChart.find(s => waist >= s.waist[0] && waist <= s.waist[1]);
  } else {
    // Top logic: Prioritize CHEST
    regularFit = sizeChart.find(s => chest >= s.chest[0] && chest <= s.chest[1]);
  }

  // 3. If no baseline fit, use closest match
  if (!regularFit) {
    let closestSize = null;
    let minDiff = Infinity;

    for (const size of sizeChart) {
      if (!isSizeAvailable(size.size, inventory)) continue;
      
      let totalDiff = 0;
      if (categoryName === 'pants') {
        const waistDiff = Math.abs(waist - (size.waist[0] + size.waist[1]) / 2) * 2;
        const hipsDiff = Math.abs(hips - (size.hips[0] + size.hips[1]) / 2);
        totalDiff = waistDiff + hipsDiff;
      } else {
        const chestDiff = Math.abs(chest - (size.chest[0] + size.chest[1]) / 2) * 2;
        const waistDiff = Math.abs(waist - (size.waist[0] + size.waist[1]) / 2);
        totalDiff = chestDiff + waistDiff;
      }

      if (totalDiff < minDiff) {
        minDiff = totalDiff;
        closestSize = size.size;
      }
    }
    return {
      size: closestSize,
      confidence: "Closest Match",
      reason: "Based on the closest available size to your profile.",
    };
  }

  // 4. Adjust for Preferred Fit
  const regularSizeIndex = sizeChart.findIndex((s) => s.size === regularFit.size);
  let targetIndex = regularSizeIndex;

  if (preferredFit === "Slim" && regularSizeIndex > 0) {
    targetIndex--;
  } else if (preferredFit === "Loose" && regularSizeIndex < sizeChart.length - 1) {
    targetIndex++;
  }

  const preferredSize = sizeChart[targetIndex].size;

  // 5. Check stock
  if (isSizeAvailable(preferredSize, inventory)) {
    return {
      size: preferredSize,
      confidence: "Perfect Fit",
      reason: `Based on your ${preferredFit} preference.`,
    };
  }

  if (isSizeAvailable(regularFit.size, inventory)) {
    return {
      size: regularFit.size,
      confidence: "Good Fit",
      reason: `Your preferred ${preferredFit} size (${preferredSize}) is out of stock.`,
    };
  }
  
  return null; // All relevant sizes out of stock
};

/**
 * Recommends a size for SHOES
 */
const getShoeSize = (userProfile, product) => {
  const { shoeSize } = userProfile;
  const { inventory } = product;

  if (!shoeSize) return null; // No profile shoe size

  if (isSizeAvailable(shoeSize, inventory)) {
    return {
      size: String(shoeSize),
      confidence: "Your Profile Size",
      reason: `Based on your saved shoe size.`,
    };
  } else {
    return {
      size: null,
      confidence: "Out of Stock",
      reason: `Your recommended size (${shoeSize}) is out of stock.`,
    };
  }
};


/**
 * Main function: Routes to the correct logic
 */
const getRecommendedSize = (userProfile, product) => {
  const { category, sizeChart, inventory } = product;

  // Guard: Check for all required data
  if (!userProfile || !category || !sizeChart || !inventory || sizeChart.length === 0) {
    return null;
  }

  const categoryName = category.name.toLowerCase();
  
  // --- THIS IS THE NEW, SIMPLE ROUTER ---
  if (categoryName === 'shoes') {
    return getShoeSize(userProfile, product);
  } 
  
  if (['shirts', 'pants', 't-shirts', 'hoodies'].includes(categoryName)) {
    return getClothingSize(userProfile, product);
  }
  // -------------------------------------

  // If category is unknown, return nothing
  return null;
};

export default getRecommendedSize;