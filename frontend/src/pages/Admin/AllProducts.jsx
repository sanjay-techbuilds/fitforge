import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAllProductsQuery, useUpdateProductColorMutation, useDeleteProductMutation } from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import AdminMenu from "./AdminMenu";
import { FaEdit, FaTrash } from 'react-icons/fa';
import Loader from "../../components/Loader";
import { motion } from "framer-motion"; // Added motion for consistency

// List of colors for the dropdown
const colorOptions = ["Black", "White", "Blue", "Red", "Green", "Grey", "Maroon", "Navy", "Yellow", "Olive", "Charcoal", "Beige", "Pink", "Purple", "Orange", "Brown"];

// A small component for the color dropdown
const ColorUpdater = ({ product }) => {
  const [updateProductColor, { isLoading }] = useUpdateProductColorMutation();
  
  const handleColorChange = async (e) => {
    try {
      await updateProductColor({ productId: product._id, color: e.target.value }).unwrap();
      toast.success("Color updated!");
    } catch (error) {
      toast.error("Failed to update color.");
    }
  };

  return (
    <select 
      value={product.color || ""} 
      onChange={handleColorChange}
      disabled={isLoading}
      // 👇 FIX: Theme-aware input styles
      className="w-full p-2 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
    >
      <option value="">Select Color</option>
      {colorOptions.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );
};

const AllProducts = () => {
  const { data: products, isLoading, isError, refetch } = useAllProductsQuery();
  const { data: categories } = useFetchCategoriesQuery();
  const [deleteProduct] = useDeleteProductMutation();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const deleteHandler = async (id) => {
    // 👇 FIX: Replaced window.confirm with a toast for consistency
    toast(
      ({ closeToast }) => (
        <div className="text-[var(--text-main)]">
          <p className="font-semibold">Are you sure you want to delete this product?</p>
          <div className="flex gap-2 mt-3">
            <button
              className="px-4 py-2 rounded bg-red-600 text-white font-semibold"
              onClick={async () => {
                try {
                  await deleteProduct(id).unwrap();
                  toast.success("Product deleted.");
                  refetch();
                } catch (err) {
                  toast.error(err?.data?.message || err.error);
                }
                closeToast();
              }}
            >
              Delete
            </button>
            <button
              className="px-4 py-2 rounded bg-gray-300 text-black font-semibold"
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeButton: false }
    );
  };

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let filtered = [...products];
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category?._id === selectedCategory);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(lowerSearchTerm) ||
        p.brand.toLowerCase().includes(lowerSearchTerm) ||
        (p.color && p.color.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return filtered;
  }, [products, selectedCategory, searchTerm]);

  if (isError) return <div className="p-10 text-red-500">Error loading products. Please refresh.</div>;

  return (
    // 👇 FIX: Theme-aware background and layout
    <div className="flex min-h-screen bg-[var(--bg-grad-1)] text-[var(--text-main)]">
      <AdminMenu />
      <main className="flex-1 p-6 lg:p-10">
        <motion.div className="max-w-7xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          <h1 className="text-3xl font-bold mb-6 text-[var(--heading-col)]">All Products ({products?.length || 0})</h1>
          
          {/* 👇 FIX: Filter bar with theme-aware styles */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-xl shadow-lg">
            <select 
              className="flex-1 w-full md:w-auto bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] p-3 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories?.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
            </select>
            <input 
              type="text" 
              placeholder="Search by name, brand, color..." 
              className="flex-1 w-full md:w-auto bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] p-3 rounded-lg placeholder-[var(--text-muted)] focus:ring-primary-500 focus:border-primary-500" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <Link to="/admin/productlist" className="w-full md:w-auto text-center bg-primary-600 text-white py-3 px-5 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Create Product
            </Link>
          </div>
          
          {isLoading ? (
            <Loader />
          ) : (
            <div className="overflow-x-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-lg">
              <table className="min-w-full text-left">
                {/* 👇 FIX: Theme-aware table header */}
                <thead className="border-b border-[var(--input-border)] bg-[var(--bg-grad-2)]">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Image</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider w-40">Color</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Brand</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Stock</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--input-border)]">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-[var(--bg-grad-3)] transition-colors">
                        <td className="px-6 py-4"><img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md border border-[var(--input-border)]" /></td>
                        <td className="px-6 py-4 font-medium text-sm text-[var(--text-main)] max-w-xs truncate">{product.name}</td>
                        <td className="px-6 py-4"><ColorUpdater product={product} /></td>
                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{product.brand}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-[var(--text-main)]">₹{product.price}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{product.quantity}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-4">
                            <Link to={`/admin/product/update/${product._id}`}><FaEdit className="text-blue-500 hover:text-blue-400" size={18} /></Link>
                            <button onClick={() => deleteHandler(product._id)}><FaTrash className="text-red-500 hover:text-red-400" size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-[var(--text-muted)]">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AllProducts;