import { useGetProductsQuery } from "../../redux/api/productApiSlice";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import Product from "./Product";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Shuffle function to randomize products
const shuffleArray = (arr) => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const ProductCarousel = ({ categoryId }) => {
  const { data, isLoading, error } = useGetProductsQuery({});
  const products = data?.products || [];

  if (isLoading) return <Loader />;
  if (error)
    return (
      <Message variant="danger">
        {error?.data?.message || error.error || "Error loading products"}
      </Message>
    );

  if (!products.length) return <Message>No products available</Message>;

  // Filter by category if categoryId is provided
  const filteredProducts = categoryId
    ? products.filter((p) => p.category === categoryId)
    : products;

  // Pick 40 random products
  const specialProducts = shuffleArray(filteredProducts).slice(0, 40);

  // Chunk into slides of 8 products (2 rows × 4 columns)
  const slides = [];
  for (let i = 0; i < specialProducts.length; i += 8) {
    slides.push(specialProducts.slice(i, i + 8));
  }

  return (
    <div className="w-full relative">
      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        pagination={{ clickable: true }}
        navigation
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop
        centeredSlides={false}
        loopFillGroupWithBlank={true}
        spaceBetween={30}
        slidesPerView={1}
        className="pb-12"
      >
        {slides.map((group, index) => (
          <SwiperSlide key={index}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {group.map((product) => (
                <div
                  key={product._id}
                  className="flex justify-center transition transform hover:scale-105 hover:shadow-2xl"
                >
                  <Product product={product} />
                </div>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Swiper default arrow styling fix */}
      <style>
        {`
          .swiper-button-next, .swiper-button-prev {
            color: #000;
            font-weight: bold;
            transition: all 0.3s ease;
          }
          .swiper-button-next:hover, .swiper-button-prev:hover {
            color: #1e40af; /* Tailwind blue-900 */
          }
          .swiper-pagination-bullet {
            background: #000;
            opacity: 0.6;
          }
          .swiper-pagination-bullet-active {
            background: #1e40af;
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
};

export default ProductCarousel;
