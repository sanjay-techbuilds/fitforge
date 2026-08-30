// CategoryPage.jsx
import { useLocation } from "react-router-dom";
import { useGetProductsQuery } from "../../redux/api/productApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import SmallProduct from "./SmallProduct";

const CategoryPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("id");
  const categoryName = location.pathname.split("/").pop(); // from URL

  const { data, isLoading, isError, error } = useGetProductsQuery({});

  if (isLoading) return <Loader />;
  if (isError) return <Message variant="danger">{error?.data?.message || error?.error}</Message>;

  // Filter products where category matches the ID (category is stored as string in products)
  const filteredProducts = data?.products?.filter(
    (p) => String(p.category) === String(categoryId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary-400 capitalize">
        {categoryName} Products
      </h2>

      {filteredProducts.length === 0 ? (
        <Message>No products found in this category</Message>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <SmallProduct key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
