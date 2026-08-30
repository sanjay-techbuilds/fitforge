// frontend/src/redux/features/shop/shopSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    products: [],
    // --- State for active filters ---
    filters: {
        selectedCategories: [], // For manual checkbox filtering
        selectedBrands: [],     // For manual checkbox filtering
        priceRange: [0, 1500],
        sortBy: 'latest',
        keyword: '',          // THIS will hold "white shirt"
        // color: null,       // <<< REMOVED
    },
};

const shopSlice = createSlice({
    name: "shop",
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.products = Array.isArray(action.payload) ? action.payload : [];
        },

        // --- Actions for manual filters ---
        setShopKeyword: (state, action) => {
            state.filters.keyword = action.payload || '';
            // When setting keyword manually, clear category/brand filters
            state.filters.selectedCategories = [];
            state.filters.selectedBrands = [];
        },
        setShopCategories: (state, action) => {
            state.filters.selectedCategories = Array.isArray(action.payload) ? action.payload : [];
            // When setting category manually, clear keyword filter
            state.filters.keyword = '';
        },
        setShopBrands: (state, action) => {
            state.filters.selectedBrands = Array.isArray(action.payload) ? action.payload : [];
            // When setting brand manually, clear keyword filter
            state.filters.keyword = '';
        },
        setShopPriceRange: (state, action) => {
            if (Array.isArray(action.payload) && action.payload.length === 2 &&
                typeof action.payload[0] === 'number' && typeof action.payload[1] === 'number' &&
                action.payload[0] >= 0 && action.payload[1] >= action.payload[0]) {
                state.filters.priceRange = action.payload;
            } else {
                state.filters.priceRange = initialState.filters.priceRange;
            }
        },
        setShopSortBy: (state, action) => {
            state.filters.sortBy = action.payload || 'latest';
        },
        // setShopColor: (state, action) => { // <<< REMOVED
        //     state.filters.color = action.payload || null;
        // },
        clearShopFilters: (state) => {
            console.log("[Redux] Clearing shop filters");
            state.filters = initialState.filters; // Resets all filters including keyword
        },
        
        // --- Action for Voice Command ---
        setAllShopFilters: (state, action) => {
             console.log("[Redux] Setting all shop filters from voice:", action.payload);
             const { category, brand, minPrice, maxPrice, color, size } = action.payload || {};

             // --- NEW LOGIC: Combine color, category, brand into KEYWORD ---
             const keywordParts = [];
             if (color) keywordParts.push(color.trim());       // "white"
             if (category) keywordParts.push(category.trim()); // "shirt"
             if (brand) keywordParts.push(brand.trim());       // "adidas"
             state.filters.keyword = keywordParts.join(' '); // "white shirt adidas"
             // ----------------------------------------------------

             // Clear manual filters, as keyword now has priority
             state.filters.selectedCategories = [];
             state.filters.selectedBrands = [];
             // state.filters.size = size || null; // Handle size if implemented

             // Price range validation
             let newMin = initialState.filters.priceRange[0];
             let newMax = initialState.filters.priceRange[1]; // Use default max
             if (typeof minPrice === 'number' && minPrice >= 0) newMin = minPrice;
             if (typeof maxPrice === 'number' && maxPrice >= 0) newMax = maxPrice;
             if (newMin <= newMax) {
                 state.filters.priceRange = [newMin, newMax];
             } else {
                 state.filters.priceRange = initialState.filters.priceRange;
             }
        },
    },
});

export const {
    setProducts,
    setShopKeyword,
    setShopCategories,
    setShopBrands,
    setShopPriceRange,
    setShopSortBy,
    // setShopColor, // <<< REMOVED
    clearShopFilters,
    setAllShopFilters,
} = shopSlice.actions;

export const selectShopFilters = (state) => state.shop.filters;
export const selectShopProducts = (state) => state.shop.products;

export default shopSlice.reducer;