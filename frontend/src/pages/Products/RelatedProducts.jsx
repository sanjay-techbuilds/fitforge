// src/pages/Products/RelatedProducts.jsx

import { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Slider from "react-slick";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { useNavigate } from "react-router-dom";

// CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ICONS
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function NextArrow(props) {
  const { onClick } = props;
  return (
    // 👇 FIX: Arrow background variable
    <button
      className="absolute top-1/2 -right-3 md:-right-6 z-10 -translate-y-1/2 cursor-pointer p-3 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--bg-grad-3)] transition-colors text-[var(--text-main)] shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-30 disabled:cursor-not-allowed"
      onClick={onClick}
      aria-label="Next Slide"
    >
      <FaChevronRight className="w-4 h-4" />
    </button>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    // 👇 FIX: Arrow background variable
    <button
      className="absolute top-1/2 -left-3 md:-left-6 z-10 -translate-y-1/2 cursor-pointer p-3 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--bg-grad-3)] transition-colors text-[var(--text-main)] shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-30 disabled:cursor-not-allowed"
      onClick={onClick}
      aria-label="Previous Slide"
    >
      <FaChevronLeft className="w-4 h-4" />
    </button>
  );
}

const ProductCarousel = ({ title, products, onCartFromSlider }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const calculateSlidesToShow = (screenWidth) => {
    if (screenWidth < 768) return 1;
    if (screenWidth < 1024) return Math.min(2, products.length);
    if (screenWidth < 1280) return Math.min(3, products.length);
    return Math.min(4, products.length);
  };

  const [slidesToShow, setSlidesToShow] = useState(() =>
    calculateSlidesToShow(typeof window !== "undefined" ? window.innerWidth : 1024)
  );

  useEffect(() => {
    const handleResize = () => setSlidesToShow(calculateSlidesToShow(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [products.length]);

  if (!products || products.length === 0) return null;

  const carouselSettings = {
    dots: false,
    infinite: products.length > slidesToShow,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    focusOnSelect: false,
    draggable: false,
    swipe: false,
    touchMove: false,
    swipeToSlide: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: Math.min(3, products.length), infinite: products.length > 3 } },
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, products.length), infinite: products.length > 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1, arrows: false, infinite: products.length > 1 } },
    ],
    afterChange: (index) => setCurrentSlide(index),
  };

  return (
    <div className="mb-16">
      {/* 👇 FIX: Heading text variable */}
      <h2 className="text-3xl font-bold text-[var(--text-main)] mb-8 text-center lg:text-left">{title}</h2>
      <div className="relative mx-auto max-w-full px-8 md:px-12">
        <Slider {...carouselSettings}>
          {products.map((p) => (
            <div
              key={p?._id || Math.random()}
              className="p-3"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {p ? (
                <ProductCard p={p} handleAddToCart={onCartFromSlider} isSliderCard={true} />
              ) : (
                <p>Loading...</p>
              )}
            </div>
          ))}
        </Slider>

        {products.length > slidesToShow && (
          // 👇 FIX: Progress bar track color
          <div className="relative h-1 w-full max-w-[200px] mx-auto mt-12 bg-[var(--input-border)] rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${
                  products.length - slidesToShow > 0 ? (currentSlide / (products.length - slidesToShow)) * 100 : 0
                }%`,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const RelatedProducts = ({ currentProduct, allProducts }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const similarProducts = useMemo(() => {
    if (!currentProduct || !allProducts || !currentProduct.category) return [];
    return allProducts.filter((p) => p?.category?._id === currentProduct.category._id && p?._id !== currentProduct._id);
  }, [currentProduct, allProducts]);

  const brandProducts = useMemo(() => {
    if (!currentProduct || !allProducts || !currentProduct.brand) return [];
    return allProducts.filter(
      (p) => p?.brand === currentProduct.brand && p?._id !== currentProduct._id && p?.category?._id !== currentProduct.category?._id
    );
  }, [currentProduct, allProducts]);

  const readRecommendation = (product) => {
    if (!product) return null;
    const candidates = ["recommendedSize", "suggestedSize", "userRecommendedSize", "selectedSize", "recoSize", "recommended", "recommendation", "reco"];
    for (const key of candidates) {
      const val = product[key];
      if (val && typeof val === "string" && val.trim() !== "") return { field: key, value: val.trim() };
      if (val && typeof val === "object") {
        if (val.size) return { field: key + ".size", value: String(val.size) };
        if (val.recommendedSize) return { field: key + ".recommendedSize", value: String(val.recommendedSize) };
      }
    }
    if (product._userReco && product._userReco.size) return { field: "_userReco.size", value: String(product._userReco.size) };
    return null;
  };

  const getInventory = (product) => {
    if (!product) return [];
    if (Array.isArray(product.inventory)) return product.inventory;
    if (typeof product.inventory === "object" && product.inventory !== null) {
      const invObj = product.inventory;
      return Object.keys(invObj).map((k) => ({ size: k, countInStock: invObj[k]?.countInStock ?? invObj[k]?.stock ?? 0 }));
    }
    return [];
  };

  const chooseSizeForAdd = (product) => {
    const inv = getInventory(product);
    const stocked = inv.filter((i) => Number(i.countInStock || 0) > 0);

    const reco = readRecommendation(product);
    if (reco) {
      if (stocked.length === 0) {
        if (!product.inventory || product.inventory.length === 0) {
          return { size: reco.value, reason: `recommended:${reco.field}` };
        }
      } else {
        const matched = stocked.find((i) => String(i.size) === String(reco.value));
        if (matched) return { size: String(matched.size), reason: `recommended:${reco.field}` };
      }
    }

    if (stocked.length >= 1) {
      return { size: String(stocked[0].size), reason: "first-stocked-size" };
    }

    if (!product.sizes || product.sizes.length === 0) {
      return { size: "", reason: "no-sizes" };
    }

    return null;
  };

  const handleSliderAddToCart = (product, qty = 1) => {
    const choice = chooseSizeForAdd(product);

    if (choice !== null && typeof choice === "object") {
      dispatch(addToCart({ ...product, qty, size: choice.size }));
      toast.success(`${product.name}${choice.size ? ` (${choice.size})` : ""} added to cart!`);
      return;
    }

    toast.info(`Please select size for ${product.name} on its page.`);
    navigate(`/product/${product._id}`);
  };

  if (similarProducts.length === 0 && brandProducts.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <ProductCarousel title="Similar Products" products={similarProducts} onCartFromSlider={handleSliderAddToCart} />
      <ProductCarousel title={`More from ${currentProduct.brand}`} products={brandProducts} onCartFromSlider={handleSliderAddToCart} />
    </div>
  );
};

export default RelatedProducts;