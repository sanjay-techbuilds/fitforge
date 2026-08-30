const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10m-7 8h4" />
  </svg>
);

const ShopHeader = ({ productCount, keyword, sortBy, setSortBy, onFilterClick }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        {/* 👇 FIX: Heading Text Variable */}
        <h1 className="text-4xl font-extrabold text-[var(--text-main)]">Shop Products</h1>
        {keyword ? (
          <p className="text-[var(--text-muted)] mt-1">Results for "{keyword}" ({productCount} found)</p>
        ) : (
          <p className="text-[var(--text-muted)] mt-1">{productCount} products found</p>
        )}
      </div>

      <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
        {/* 👇 FIX: Mobile Filter Button Background & Text */}
        <button 
            onClick={onFilterClick} 
            className="md:hidden flex items-center gap-2 p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-[var(--text-main)] w-full justify-center shadow-sm"
        >
          <FilterIcon /> Filters
        </button>

        {/* 👇 FIX: Sort Select Background, Text & Border */}
        <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] rounded-lg p-2.5 w-full sm:w-auto shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer"
        >
          <option value="latest">Sort by Latest</option>
          <option value="price-lh">Price: Low to High</option>
          <option value="price-hl">Price: High to Low</option>
          <option value="toprated">Top Rated</option>
        </select>
      </div>
    </div>
  );
};

export default ShopHeader;