// src/pages/Shop.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useLocation } from "react-router-dom";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { setProducts } from "../redux/features/shop/shopSlice";
import { useDebounce } from "../hooks/useDebounce";

// Import child components
import FilterPanel from "../components/shop/FilterPanel";
import ProductGrid from "../components/shop/ProductGrid";
import ActiveFilters from "../components/shop/ActiveFilters";
import ShopHeader from "../components/shop/ShopHeader";

const Shop = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    // Get the location object
    const location = useLocation();

    // Initialize state
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 1500]);
    const [sortBy, setSortBy] = useState("latest");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Read the category from URL on initial load
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryIdFromUrl = params.get("category");

        if (categoryIdFromUrl) {
            setSelectedCategories([categoryIdFromUrl]);
            console.log(`[Shop] Initial category set from URL: ${categoryIdFromUrl}`);
        }
    }, [location.search]);

    const debouncedPriceRange = useDebounce(priceRange, 500);

    const { data, isLoading, error: filterError } = useGetFilteredProductsQuery({
        keyword,
        categories: selectedCategories.join(','),
        brands: selectedBrands.join(','),
        minPrice: debouncedPriceRange[0],
        maxPrice: debouncedPriceRange[1],
        sortBy,
    });

    // Update Redux store only when the fetched data changes
    useEffect(() => {
        if (data) {
            dispatch(setProducts(data || []));
        } else if (!isLoading && !filterError) {
             dispatch(setProducts([]));
        }
         if(filterError) {
             console.error("Error fetching filtered products:", filterError);
             dispatch(setProducts([]));
         }
    }, [data, dispatch, isLoading, filterError]);

    // Read products from Redux
    const { products } = useSelector((state) => state.shop);

    // Reset filters using local state setters
    const handleResetFilters = () => {
        console.log("[Shop] Resetting filters (useState)");
        setSelectedCategories([]);
        setSelectedBrands([]);
        setPriceRange([0, 1500]);
        setSortBy("latest");
    };

    return (
        // 👇 FIX: Added text-[var(--text-main)] to control global text color on this page
        <div className="container mx-auto px-4 my-10 min-h-screen text-[var(--text-main)]">
            <div className="flex flex-col md:flex-row gap-8">
                {/* SIDEBAR FILTER PANEL (Desktop) */}
                <aside className="hidden md:block w-full md:w-[22rem] flex-shrink-0 sticky top-[80px] self-start max-h-[calc(100vh_-_80px)] overflow-y-auto">
                    {/* Pass local state and setters */}
                    <FilterPanel
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        selectedBrands={selectedBrands}
                        setSelectedBrands={setSelectedBrands}
                        handleResetFilters={handleResetFilters}
                    />
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 min-w-0">
                    <ShopHeader
                        productCount={products?.length || 0}
                        keyword={keyword}
                        sortBy={sortBy}
                        setSortBy={setSortBy} // Pass local setter
                        onFilterClick={() => setIsFilterOpen(true)}
                    />

                    <ActiveFilters
                        selectedBrands={selectedBrands}
                        setSelectedBrands={setSelectedBrands}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                    />

                    <ProductGrid
                        products={products}
                        isLoading={isLoading}
                    />
                </main>
            </div>

            {/* MOBILE FILTER OVERLAY */}
            {isFilterOpen && (
                 <div
                   className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                   onClick={() => setIsFilterOpen(false)}
                   aria-hidden="true"
                 >
                   <aside
                     // 👇 FIX: Replaced 'bg-slate-900' with dynamic 'bg-[var(--card-bg)]' and added border color
                     className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-[var(--card-bg)] border-r border-[var(--card-border)] shadow-xl z-50 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
                     onClick={(e) => e.stopPropagation()}
                     role="dialog"
                     aria-modal="true"
                   >
                     {/* 👇 FIX: Replaced 'border-slate-700' with dynamic 'border-[var(--input-border)]' */}
                     <div className='flex justify-between items-center mb-4 border-b border-[var(--input-border)] pb-3'>
                       {/* 👇 FIX: Replaced 'text-white' with dynamic 'text-[var(--text-main)]' */}
                       <h2 className="text-xl font-bold text-[var(--text-main)]">Filters</h2>
                       {/* 👇 FIX: Updated Close Button colors */}
                       <button onClick={() => setIsFilterOpen(false)} className='text-[var(--text-muted)] hover:text-[var(--text-main)] text-3xl leading-none' aria-label="Close filters">
                         &times;
                       </button>
                     </div>
                     
                     <FilterPanel
                       priceRange={priceRange}
                       setPriceRange={setPriceRange}
                       selectedCategories={selectedCategories}
                       setSelectedCategories={setSelectedCategories}
                       selectedBrands={selectedBrands}
                       setSelectedBrands={setSelectedBrands}
                       handleResetFilters={() => {
                           handleResetFilters();
                           setIsFilterOpen(false); // Close modal on reset
                       }}
                     />
                   </aside>
                 </div>
               )}
        </div>
    );
};

export default Shop;