// src/pages/FavoritesPage.jsx

import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
// ✨ Make sure this path is correct for your project structure ✨
import { removeFromFavorites } from '../../redux/features/favorites/favoriteSlice';
import { FaHeartBroken, FaShoppingBag } from 'react-icons/fa';

// ✨ Import the actual ProductCard component ✨
import ProductCard from "./ProductCard";


const FavoritesPage = () => {
    const dispatch = useDispatch();
    // Ensure the selector correctly gets the array of favorite product objects
    const favorites = useSelector((state) => state.favorites || []);
    const [sortBy, setSortBy] = useState('date_desc'); // Default sort

    // Handler to remove item, passed down to ProductCard
    const handleRemoveFavorite = (productId) => {
        dispatch(removeFromFavorites(productId));
        // Optional: Add a success notification
        // toast.info("Removed from favorites");
    };

    // --- Optional AddToCart Logic ---
    // const { userInfo } = useSelector((state) => state.auth);
    // const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    // const [selectedProductUrl, setSelectedProductUrl] = useState('');

    // const handleAddToCart = (product, qty = 1) => {
    //     if (!userInfo) {
    //         setSelectedProductUrl(`/product/${product._id}`);
    //         setIsAuthModalOpen(true);
    //     } else {
    //         dispatch(addToCart({ ...product, qty }));
    //         toast.success("Item added successfully", { autoClose: 2000 });
    //     }
    // };
    // --- End AddToCart Logic ---


    // Memoized sorting logic
    const sortedFavorites = useMemo(() => {
        let sorted = [...favorites]; // Create a copy to sort
        switch (sortBy) {
            case 'price_asc':
                // Ensure price exists and is a number for accurate sorting
                sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
                break;
            case 'price_desc':
                sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
                break;
            case 'date_asc':
                // Fallback sort by ID (assuming newer IDs might be lexicographically larger, adjust if needed)
                sorted.sort((a, b) => (a._id > b._id ? 1 : -1));
                break;
            case 'date_desc':
            default:
                // Fallback sort by ID reversed
                 sorted.sort((a, b) => (a._id < b._id ? 1 : -1));
                break;
        }
        return sorted;
    }, [favorites, sortBy]);

    // --- Empty State ---
    if (!favorites || favorites.length === 0) {
        return (
            <div className="container mx-auto px-4 my-10 min-h-[60vh] flex flex-col items-center justify-center text-center text-white">
                <FaHeartBroken className="text-6xl text-slate-600 mb-6" />
                <h1 className="text-3xl font-bold mb-3">Your Favorites List is Empty</h1>
                <p className="text-slate-400 mb-8 max-w-md">Looks like you haven't added any products yet. Browse our collection and save the items you love!</p>
                <Link
                    to="/shop"
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition transform hover:scale-105"
                >
                    <FaShoppingBag />
                    Start Shopping
                </Link>
            </div>
        );
    }

    // --- Favorites List ---
    return (
        <div className="container mx-auto px-4 my-10 min-h-screen text-white">
            {/* Optional: Auth Modal for AddToCart */}
            {/* <AuthPromptModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} redirectUrl={selectedProductUrl} /> */}

            {/* Header: Title and Sort Dropdown */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">My Favorite Products ({favorites.length})</h1>
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-[var(--card-bg)] border border-[var(--card-border)] border border-slate-700 text-white rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm cursor-pointer"
                    >
                        <option value="date_desc">Sort by: Added (Newest)</option>
                        <option value="date_asc">Sort by: Added (Oldest)</option>
                        <option value="price_asc">Sort by: Price (Low to High)</option>
                        <option value="price_desc">Sort by: Price (High to Low)</option>
                    </select>
                    {/* Dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                       <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.404l2.904-2.856c.436-.446 1.144-.446 1.58 0 .436.446.436 1.17 0 1.616l-3.7 3.84c-.436.446-1.144.446-1.58 0l-3.7-3.84c-.436-.446-.436-1.17 0-1.616z"/></svg>
                   </div>
                </div>
            </div>

            {/* Responsive Grid - Using items-stretch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
                {sortedFavorites.map((product) => (
                    <ProductCard
                        key={product._id}
                        p={product} // Pass product data as 'p'
                        onRemove={handleRemoveFavorite} // Pass the remove handler
                        // handleAddToCart={handleAddToCart} // Pass AddToCart if ProductCard uses it
                        isSliderCard={false} // Important: Render the default card style
                    />
                ))}
            </div>
        </div>
    );
};

export default FavoritesPage;