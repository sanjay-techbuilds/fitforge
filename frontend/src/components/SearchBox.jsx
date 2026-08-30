import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProductsQuery } from '../redux/api/productApiSlice';

const SearchBox = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // This hook will now fetch products as you type
  const { data } = useGetProductsQuery({ keyword });
  const products = data?.products || [];

  // Hide suggestions when clicking outside the search box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update suggestions based on user input
  useEffect(() => {
    if (keyword.trim() && products.length > 0) {
      setSuggestions(products);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [keyword, data]);

  // Handle form submission (pressing Enter or clicking Search)
  const submitHandler = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (keyword.trim()) {
      navigate(`/shop?keyword=${keyword}`);
    } else {
      navigate('/shop');
    }
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (id) => {
    navigate(`/product/${id}`);
    setKeyword('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <form onSubmit={submitHandler} className="flex w-full">
        <input
          type="text"
          // 👇 FIX: Dynamic Background, Text, and Border
          className="bg-[var(--input-bg)] text-[var(--text-main)] border border-[var(--input-border)] p-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
          placeholder="Find your style..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => keyword.trim() && setShowSuggestions(true)}
        />
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 font-semibold"
        >
          Search
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        // 👇 FIX: Dynamic Dropdown Background and Text
        <ul className="absolute z-10 w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((product) => (
            <li
              key={product._id}
              // 👇 FIX: Hover color is dynamic
              className="p-3 hover:bg-[var(--bg-grad-3)] cursor-pointer flex items-center gap-4 transition-colors"
              onClick={() => handleSuggestionClick(product._id)}
            >
              <img src={product.image} alt={product.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded" />
              <span>{product.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;