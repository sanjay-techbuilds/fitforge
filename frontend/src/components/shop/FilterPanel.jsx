import { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useFetchCategoriesQuery } from '../../redux/api/categoryApiSlice';
// 👇 RESTORED: Your original import
import { useGetUniqueBrandsQuery } from '../../redux/api/productApiSlice'; 

const AccordionItem = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    // 👇 FIX: Border variable
    <div className="border-b border-[var(--input-border)]">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-3 text-left">
        {/* 👇 FIX: Text variable */}
        <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>
        {/* 👇 FIX: Icon color variable */}
        <span className={`transition-transform duration-300 text-[var(--text-muted)] ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>
      {isOpen && <div className="pt-2 pb-4 pl-2">{children}</div>}
    </div>
  );
};

const FilterPanel = ({ priceRange, setPriceRange, selectedCategories, setSelectedCategories, selectedBrands, setSelectedBrands, handleResetFilters }) => {
  const { data: categories, isLoading: loadingCategories } = useFetchCategoriesQuery();
  const { data: allBrands, isLoading: loadingBrands } = useGetUniqueBrandsQuery();

  const handleCategoryCheck = (isChecked, id) => {
    const updated = isChecked ? [...selectedCategories, id] : selectedCategories.filter((c) => c !== id);
    setSelectedCategories(updated);
  };

  const handleBrandCheck = (isChecked, brandName) => {
    const updated = isChecked ? [...selectedBrands, brandName] : selectedBrands.filter((b) => b !== brandName);
    setSelectedBrands(updated);
  };

  return (
    // 👇 FIX: Main Background & Border variables (Removed bg-slate-900)
    <div className="p-6 w-full bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-sm">
      <div className="flex justify-between items-center mb-4">
        {/* 👇 FIX: Title Text variable */}
        <h2 className="text-2xl font-bold text-[var(--text-main)]">Filters</h2>
      </div>

      <AccordionItem title="Categories">
        <div className="space-y-3">
          {categories?.map((c) => (
            <div key={c._id} className="flex items-center">
              {/* 👇 FIX: Checkbox Background & Border */}
              <input 
                type="checkbox" 
                id={`cat-${c._id}`} 
                checked={selectedCategories.includes(c._id)} 
                onChange={(e) => handleCategoryCheck(e.target.checked, c._id)} 
                className="w-4 h-4 text-primary-600 bg-[var(--input-bg)] border-[var(--input-border)] rounded focus:ring-primary-500" 
              />
              {/* 👇 FIX: Label Text variable */}
              <label htmlFor={`cat-${c._id}`} className="ml-3 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors">{c.name}</label>
            </div>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem title="Brands">
        <div className="space-y-3">
          {loadingBrands ? <p className="text-[var(--text-muted)]">Loading brands...</p> : allBrands?.map(brand => (
             <div key={brand} className="flex items-center">
               {/* 👇 FIX: Checkbox Background & Border */}
               <input 
                 type="checkbox" 
                 id={`brand-${brand}`} 
                 checked={selectedBrands.includes(brand)} 
                 onChange={(e) => handleBrandCheck(e.target.checked, brand)} 
                 className="w-4 h-4 text-primary-600 bg-[var(--input-bg)] border-[var(--input-border)] rounded focus:ring-primary-500" 
               />
               {/* 👇 FIX: Label Text variable */}
               <label htmlFor={`brand-${brand}`} className="ml-3 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors">{brand}</label>
             </div>
          ))}
        </div>
      </AccordionItem>
      
      <AccordionItem title="Price Range">
        <div className="px-1 pt-2">
          <Slider 
            range 
            min={0} 
            max={1500} 
            step={10} 
            value={priceRange} 
            onChange={setPriceRange}
            trackStyle={[{ backgroundColor: '#db2777' }]} 
            handleStyle={[
              { borderColor: '#db2777', backgroundColor: 'var(--card-bg)', opacity: 1 },
              { borderColor: '#db2777', backgroundColor: 'var(--card-bg)', opacity: 1 },
            ]}
            railStyle={{ backgroundColor: 'var(--input-border)' }}
          />
          {/* 👇 FIX: Price Text variable */}
          <div className="flex justify-between mt-3 text-sm text-[var(--text-main)]">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </AccordionItem>
      
      {/* 👇 FIX: Button Background & Border variables */}
      <button 
        onClick={handleResetFilters} 
        className="w-full py-2.5 px-4 bg-[var(--bg-grad-2)] border border-[var(--card-border)] hover:bg-[var(--bg-grad-3)] text-[var(--text-main)] rounded-lg font-semibold mt-6 transition-colors"
      >
        Reset All Filters
      </button>
    </div>
  );
};

export default FilterPanel;