import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from "../../redux/api/categoryApiSlice";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import AdminMenu from "./AdminMenu";
import Modal from "../../components/Modal";
import { FaPencilAlt, FaTrash, FaPlus, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const CategoryList = () => {
  // Data Fetching
  const { data: categories, isLoading: categoriesLoading, refetch } = useFetchCategoriesQuery();
  const { data: products } = useAllProductsQuery();

  // Mutations
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  // Component State
  const [newName, setNewName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState({ id: null, name: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState({ visible: false, category: null });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const categoryProductCount = useMemo(() => {
    const counts = {};
    if (categories && products) {
      categories.forEach(cat => {
        // Correctly compares product's category ID, whether it's an object or a string
        counts[cat._id] = products.filter(p => (p.category?._id || p.category) === cat._id).length;
      });
    }
    return counts;
  }, [categories, products]);

  const sortedAndFilteredData = useMemo(() => {
    if (!categories) return [];
    
    const combinedData = categories
      .map(cat => ({
        ...cat,
        productCount: categoryProductCount[cat._id] || 0,
      }))
      .filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    combinedData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return combinedData;
  }, [categories, searchTerm, categoryProductCount, sortConfig]);

  // Handler Functions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newName) {
      toast.error("Category name is required");
      return;
    }
    try {
      await createCategory({ name: newName }).unwrap();
      setNewName("");
      toast.success("Category created successfully.");
      refetch();
    } catch (error) {
      toast.error("Creating category failed. Please try again.");
    }
  };
  
  const handleUpdateCategory = async (categoryId) => {
    if (!editingCategory.name) {
      toast.error("Category name cannot be empty.");
      return;
    }
    try {
      await updateCategory({
        categoryId,
        updatedCategory: { name: editingCategory.name },
      }).unwrap();
      toast.success("Category updated successfully.");
      setEditingCategory({ id: null, name: "" });
    } catch (error) {
      toast.error("Updating category failed.");
    }
  };
  
  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(showDeleteConfirm.category._id).unwrap();
      toast.success("Category deleted successfully.");
      setShowDeleteConfirm({ visible: false, category: null });
    } catch (error) {
      toast.error("Deletion failed. Make sure the category is empty.");
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="inline ml-1 text-primary-500" /> 
      : <FaSortDown className="inline ml-1 text-primary-500" />;
  };

  return (
    // 👇 FIX: Changed hardcoded bg-[#111111] to var(--bg-grad-1)
    <div className="flex min-h-screen bg-[var(--bg-grad-1)] text-[var(--text-main)]">
      <AdminMenu />
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {/* 👇 FIX: Use heading variable */}
            <h1 className="text-3xl font-bold mb-2 text-[var(--heading-col)]">Manage Categories</h1>
            <p className="text-[var(--text-muted)] mb-8">Add, edit, and organize your product categories.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Category Form */}
            <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              {/* 👇 FIX: Use card variable */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg h-full">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-[var(--heading-col)]">
                  <FaPlus className="mr-2 text-primary-500"/>Add New Category
                </h2>
                <form onSubmit={handleCreateCategory}>
                  <input
                    type="text"
                    // 👇 FIX: Use input variables
                    className="w-full bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter category name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <button type="submit" disabled={isCreating} className="w-full bg-primary-600 hover:bg-primary-700 p-3 rounded-lg font-bold text-white transition-colors disabled:opacity-50">
                    {isCreating ? "Creating..." : "Create Category"}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Category List Table */}
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              {/* 👇 FIX: Use card variable */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[var(--heading-col)]">All Categories ({categories?.length || 0})</h2>
                  <input
                    type="text"
                    // 👇 FIX: Use input variables
                    className="bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="overflow-x-auto">
                  {/* 👇 FIX: Use border variable for table dividers */}
                  <table className="min-w-full divide-y divide-[var(--input-border)]">
                    {/* 👇 FIX: Use secondary background variable for table header */}
                    <thead className="bg-[var(--bg-grad-2)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>Name {getSortIcon('name')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('productCount')}>Products {getSortIcon('productCount')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--input-border)]">
                      {categoriesLoading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i}><td colSpan="3" className="p-4"><div className="h-6 bg-[var(--bg-grad-3)] rounded animate-pulse"></div></td></tr>
                        ))
                      ) : (
                        sortedAndFilteredData.map(cat => (
                          <tr key={cat._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-[var(--text-main)]">
                              {editingCategory.id === cat._id ? (
                                <input
                                  type="text"
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                  className="bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] p-2 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-primary-500"
                                  autoFocus
                                />
                              ) : (
                                cat.name
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[var(--text-muted)]">{cat.productCount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {editingCategory.id === cat._id ? (
                                <>
                                  <button onClick={() => handleUpdateCategory(cat._id)} className="text-green-500 hover:text-green-600 mr-4">Save</button>
                                  <button onClick={() => setEditingCategory({ id: null, name: "" })} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => setEditingCategory({ id: cat._id, name: cat.name })} className="text-blue-400 hover:text-blue-500 mr-4"><FaPencilAlt /></button>
                                  <button onClick={() => setShowDeleteConfirm({ visible: true, category: cat })} className="text-red-500 hover:text-red-600"><FaTrash /></button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm.visible} onClose={() => setShowDeleteConfirm({ visible: false, category: null })}>
        <div className="p-2 text-center">
          {/* 👇 FIX: Modal text colors */}
          <h2 className="text-2xl font-bold mb-4 text-[var(--heading-col)]">Confirm Deletion</h2>
          <p className="text-[var(--text-muted)] mb-6">Are you sure you want to delete the category "{showDeleteConfirm.category?.name}"? This action cannot be undone.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setShowDeleteConfirm({ visible: false, category: null })} className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold">Cancel</button>
            <button onClick={handleDeleteCategory} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryList;