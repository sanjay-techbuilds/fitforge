// src/components/shop/ProductCardSkeleton.jsx
const ProductCardSkeleton = () => (
  <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden animate-pulse">
    <div className="w-full h-56 bg-slate-700"></div>
    <div className="p-5 space-y-4">
      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-8 bg-slate-700 rounded w-1/4"></div>
        <div className="h-10 w-10 bg-slate-700 rounded-full"></div>
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
