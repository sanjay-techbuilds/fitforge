import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";
import { FaMagic } from 'react-icons/fa'; // AI icon

const ProductList = () => {
    // State for form fields
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("");
    const [brand, setBrand] = useState("");
    const [stock, setStock] = useState(0);
    const [imageUrl, setImageUrl] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const navigate = useNavigate();

    // RTK Query hooks
    const [uploadProductImage] = useUploadProductImageMutation();
    const [createProduct] = useCreateProductMutation();
    const { data: categories } = useFetchCategoriesQuery();

    const uploadFileHandler = async (e) => {
        const formData = new FormData();
        formData.append("image", e.target.files[0]);

        try {
            const res = await uploadProductImage(formData).unwrap();
            toast.success(res.message);
            setImage(res.image);
            const serverBaseUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : '';
            setImageUrl(`${serverBaseUrl}${res.image}`);
        } catch (error) {
            toast.error(error?.data?.message || "An error occurred during image upload.");
            console.error(error);
        }
    };

    const handleGenerateDescription = async () => {
        if (!name || !category || !brand) {
            toast.warn("Please enter Name, Brand, and select a Category to generate a description.");
            return;
        }

        setIsGenerating(true);
        try {
            // Simulate AI call (Replace with axios call to backend if needed)
            await new Promise(resolve => setTimeout(resolve, 1500));
            const categoryName = categories.find(c => c._id === category)?.name || 'awesome apparel';
            const generatedDesc = `Introducing the "${name}" from ${brand}, a premium addition to our ${categoryName} collection. This product is designed with both style and comfort in mind, making it a versatile choice for any occasion. Crafted from high-quality materials, it promises durability and a great fit. Elevate your wardrobe with this must-have item.`;
            setDescription(generatedDesc);
            toast.success("AI description generated!");
        } catch (error) {
            toast.error("Failed to generate description.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = new FormData();
            productData.append("image", image); 
            productData.append("name", name);
            productData.append("description", description);
            productData.append("price", price);
            productData.append("category", category);
            productData.append("quantity", quantity);
            productData.append("brand", brand);
            productData.append("countInStock", stock);
            if(selectedSize) productData.append("size", selectedSize);

            const { data } = await createProduct(productData);

            if (data.error) {
                toast.error("Product creation failed. Try again.");
            } else {
                toast.success(`${data.name} is created`);
                navigate("/admin/allproductslist");
            }
        } catch (error) {
            console.error(error);
            toast.error("Product creation failed. Try again.");
        }
    };

    // Reusable styles using CSS Variables from index.css
    const inputStyles = "mt-1 p-3 w-full border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)]";
    const labelStyles = "block text-sm font-medium text-[var(--text-main)] mb-2";

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="flex flex-col md:flex-row gap-8">
                <AdminMenu />
                <div className="md:flex-1">
                    <h1 className="text-2xl font-bold mb-6 text-[var(--heading-col)]">Create Product</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                            
                            {/* Left Column: Image & Primary Details */}
                            <div className="space-y-6">
                                <div>
                                    <label className={labelStyles}>Product Image</label>
                                    <div className="w-full h-72 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-[var(--card-bg)] border-[var(--input-border)]">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="product" className="h-full w-full object-cover" />
                                        ) : (
                                            <p className="text-[var(--text-muted)]">Upload an image</p>
                                        )}
                                    </div>
                                    <label className="mt-4 block w-full text-center py-2.5 px-4 rounded-md cursor-pointer font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-colors">
                                        {imageUrl ? "Change Image" : "Upload Image"}
                                        <input type="file" name="image" accept="image/*" onChange={uploadFileHandler} className="hidden" />
                                    </label>
                                </div>
                                
                                <div>
                                    <label htmlFor="name" className={labelStyles}>Name</label>
                                    <input type="text" id="name" placeholder="Enter product name" className={inputStyles} value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                
                                <div>
                                    <label htmlFor="price" className={labelStyles}>Price</label>
                                    <input type="number" id="price" placeholder="Enter price" className={inputStyles} value={price} onChange={(e) => setPrice(e.target.value)} />
                                </div>
                                
                                <div>
                                    <label htmlFor="quantity" className={labelStyles}>Quantity</label>
                                    <input type="number" id="quantity" placeholder="Enter quantity" className={inputStyles} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                                </div>
                            </div>

                            {/* Right Column: Other Details */}
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="brand" className={labelStyles}>Brand</label>
                                    <input type="text" id="brand" placeholder="Enter brand name" className={inputStyles} value={brand} onChange={(e) => setBrand(e.target.value)} />
                                </div>
                                
                                <div>
                                    <label htmlFor="category" className={labelStyles}>Category</label>
                                    <select id="category" className={inputStyles} value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="">Select Category</option>
                                        {categories?.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="stock" className={labelStyles}>Count In Stock</label>
                                    <input type="number" id="stock" placeholder="Enter stock count" className={inputStyles} value={stock} onChange={(e) => setStock(e.target.value)} />
                                </div>
                                
                                <div>
                                    <label className={labelStyles}>Available Sizes</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                className={`py-2 px-4 border rounded-lg transition-colors 
                                                    ${selectedSize === size 
                                                        ? "bg-primary-600 border-primary-600 text-white" 
                                                        : "bg-[var(--input-bg)] text-[var(--text-main)] border-[var(--input-border)] hover:bg-[var(--bg-grad-3)]"}`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="description" className={labelStyles}>Description</label>
                                    <textarea id="description" rows="4" className={inputStyles} placeholder="Write product description..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                                    
                                    {/* AI Button */}
                                    <button
                                        type="button"
                                        onClick={handleGenerateDescription}
                                        disabled={isGenerating}
                                        className={`mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md font-semibold text-white transition-all duration-300 
                                            ${isGenerating 
                                              ? "bg-indigo-800 cursor-not-allowed opacity-70" 
                                              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/30"}`}
                                    >
                                        <FaMagic className={isGenerating ? "animate-pulse" : ""} />
                                        {isGenerating ? "Generating Magic..." : "Generate with AI"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-10 mt-6 rounded-lg text-lg font-bold bg-primary-600 hover:bg-primary-700 transition-colors text-white"
                        >
                            Create Product
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductList;