// src/utils/sizeCharts.js

// Apparel size chart
export const apparelChart = [
  { size: "S", height: [150, 165], chest: [80, 90], waist: [60, 70], hips: [85, 95] },
  { size: "M", height: [165, 175], chest: [90, 100], waist: [70, 80], hips: [95, 105] },
  { size: "L", height: [175, 185], chest: [100, 110], waist: [80, 90], hips: [105, 115] },
  { size: "XL", height: [185, 195], chest: [110, 120], waist: [90, 100], hips: [115, 125] },
  { size: "XXL", height: [195, 210], chest: [120, 130], waist: [100, 110], hips: [125, 135] },
];

// Shoe size chart
export const shoeChart = [
  { size: "6", length: [24, 24.5] },
  { size: "7", length: [25, 25.4] },
  { size: "8", length: [26, 26.2] },
  { size: "9", length: [27, 27] },
  { size: "10", length: [27.5, 27.8] },
  { size: "11", length: [28, 28.8] },
  { size: "12", length: [29, 29.6] },
];

// Determine if product is a shoe
export const isShoeCategory = (category) => {
  if (!category) return false;
  const c = category.toLowerCase();
  return c.includes("shoe") || c.includes("sneaker");
};

// Recommended size function
export const getRecommendedSize = (userProfile, chart, availableSizes = [], category = "") => {
  if (!userProfile || !chart || chart.length === 0) return null;

  const isShoe = isShoeCategory(category);

  if (isShoe) {
    const userShoeSize = userProfile.shoeSize ? userProfile.shoeSize.toString() : null;
    if (!userShoeSize) return null;

    if (availableSizes.includes(userShoeSize)) {
      return { size: userShoeSize, confidence: "Perfect Fit" };
    }

    let closest = null;
    let minDiff = Infinity;
    chart.forEach((s) => {
      if (!availableSizes.includes(s.size)) return;
      const diff = Math.abs(Number(userShoeSize) - Number(s.size));
      if (diff < minDiff) {
        minDiff = diff;
        closest = s;
      }
    });

    if (closest) {
      return { size: closest.size, confidence: minDiff <= 1 ? "Good Fit" : "Might be Loose" };
    }
    return null;
  }

  // Apparel logic
  const exactMatch = chart.find(
    (s) =>
      userProfile.chest >= s.chest[0] &&
      userProfile.chest <= s.chest[1] &&
      userProfile.waist >= s.waist[0] &&
      userProfile.waist <= s.waist[1] &&
      userProfile.hips >= s.hips[0] &&
      userProfile.hips <= s.hips[1]
  );

  if (exactMatch && availableSizes.includes(exactMatch.size)) return { size: exactMatch.size, confidence: "Perfect Fit" };

  let closest = null;
  let minDiff = Infinity;
  chart.forEach((s) => {
    if (!availableSizes.includes(s.size)) return;
    const chestDiff = userProfile.chest < s.chest[0] ? s.chest[0] - userProfile.chest : userProfile.chest > s.chest[1] ? userProfile.chest - s.chest[1] : 0;
    const waistDiff = userProfile.waist < s.waist[0] ? s.waist[0] - userProfile.waist : userProfile.waist > s.waist[1] ? userProfile.waist - s.waist[1] : 0;
    const hipsDiff = userProfile.hips < s.hips[0] ? s.hips[0] - userProfile.hips : userProfile.hips > s.hips[1] ? userProfile.hips - s.hips[1] : 0;
    const totalDiff = chestDiff + waistDiff + hipsDiff;
    if (totalDiff < minDiff) {
      minDiff = totalDiff;
      closest = s;
    }
  });

  if (!closest) return null;
  return { size: closest.size, confidence: minDiff > 10 ? "Might be Loose" : "Good Fit" };
};
