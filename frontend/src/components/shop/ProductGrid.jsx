// src/components/shop/ProductGrid.jsx
import ProductCard from '../../pages/Products/ProductCard'; // Adjust path if needed
import ProductCardSkeleton from './ProductCardSkeleton';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { toast } from 'react-toastify';
import AuthPromptModal from '../AuthPromptModal';
import { useState } from 'react';

const ProductGrid = ({ products, isLoading }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProductUrl, setSelectedProductUrl] = useState('');

  const handleAddToCart = (product, qty = 1) => {
    if (!userInfo) {
      setSelectedProductUrl(`/product/${product._id}`);
      setIsAuthModalOpen(true);
    } else {
      dispatch(addToCart({ ...product, qty }));
      toast.success("Item added successfully", { autoClose: 2000 });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="col-span-full text-center text-slate-500 py-20">
        <h3 className="text-2xl font-semibold text-white">No Products Found</h3>
        <p className="mt-2">Try adjusting your filters or search term.</p>
      </div>
    );
  }

  return (
    <>
      <AuthPromptModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectUrl={selectedProductUrl}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p._id} p={p} handleAddToCart={handleAddToCart} />
        ))}
      </div>
    </>
  );
};

export default ProductGrid;
