import { useGetTopProductsQuery } from "../redux/api/productApiSlice";
import Loader from "./Loader";
import SmallProduct from "../pages/Products/SmallProduct";
import ProductCarousel from "../pages/Products/ProductCarousel";

const Header = () => {
  const { data, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <h1 className="text-red-500 text-center mt-6">Something went wrong!</h1>;
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 justify-between items-start mt-6 px-6">
      {/* Left small product grid */}
      <div className="hidden xl:grid grid-cols-2 gap-6">
        {data.slice(0, 4).map((product) => (
          <SmallProduct key={product._id} product={product} />
        ))}
      </div>

      {/* Right carousel */}
      <div className="flex-1 w-full">
        <ProductCarousel />
      </div>
    </div>
  );
};

export default Header;
