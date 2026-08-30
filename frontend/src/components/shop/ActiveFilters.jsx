// src/components/shop/ActiveFilters.jsx
const ActiveFilters = ({ selectedBrands, setSelectedBrands, priceRange, setPriceRange }) => {
  const resetPrice = () => setPriceRange([0, 1500]);
  const removeBrand = (brandToRemove) => {
    setSelectedBrands(prev => prev.filter(b => b !== brandToRemove));
  };
  
  const isPriceDefault = priceRange[0] === 0 && priceRange[1] === 1500;

  if (selectedBrands.length === 0 && isPriceDefault) {
    return null; // Don't render if no filters are active
  }

  return (
    <div className="flex items-center flex-wrap gap-2 mb-6 border-b border-slate-800 pb-4">
      <span className="font-semibold text-slate-300 mr-2">Active Filters:</span>
      
      {!isPriceDefault && (
        <Tag label={`Price: ₹${priceRange[0]} - ₹${priceRange[1]}`} onRemove={resetPrice} />
      )}
      
      {selectedBrands.map(brand => (
        <Tag key={brand} label={brand} onRemove={() => removeBrand(brand)} />
      ))}
    </div>
  );
};

const Tag = ({ label, onRemove }) => (
  <span className="flex items-center bg-slate-700 text-slate-200 text-sm font-medium px-2.5 py-1 rounded-full">
    {label}
    <button onClick={onRemove} className="ml-2 text-slate-400 hover:text-white">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
  </span>
);

export default ActiveFilters;
