import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import HeartIcon from "./HeartIcon";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";

/**
 * ProductCard (strong event-stopping + smart add-to-cart)
 * - Respects product recommendation fields (recommendedSize, suggestedSize, userRecommendedSize, selectedSize, recoSize)
 * - Falls back to previous logic (no-size / single stocked size / parent handler)
 */
const ProductCard = ({ p, handleAddToCart, isSliderCard = false }) => {
  const dispatch = useDispatch();

  if (!p) {
    console.warn("ProductCard rendered without product data (p prop).");
    return <div className="p-4 text-center text-red-400">Error: Product data missing.</div>;
  }

  const { _id, image, name, price, brand, description } = p;

  // helper to strongly stop propagation
  const stopAll = (e) => {
    if (!e) return;
    try {
      e.stopPropagation && e.stopPropagation();
      e.preventDefault && e.preventDefault();
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
    } catch (err) {
      // swallow
    }
  };

  // New: try to read a recommended size that your system might attach to the product object.
  // Checks several possible property names so it's resilient to naming differences.
  const getRecommendationFromProduct = () => {
    const candidates = ["recommendedSize", "suggestedSize", "userRecommendedSize", "selectedSize", "recoSize"];
    for (const key of candidates) {
      if (p && typeof p[key] !== "undefined" && p[key] !== null && p[key] !== "") {
        return { field: key, value: String(p[key]) };
      }
    }
    return null;
  };

  // Determine if product has an "unambiguous" size to auto-add:
  // Priority:
  // 1) recommended size attached to product object (and in stock)
  // 2) no-size products (p.sizes falsy)
  // 3) exactly one stocked size
  // 4) ambiguous -> null
  const getAutoAddSize = () => {
    try {
      // check recommended size first
      const reco = getRecommendationFromProduct();
      if (reco) {
        // verify recommended size is in stock (if inventory exists)
        const inv = Array.isArray(p.inventory) ? p.inventory : [];
        if (inv.length === 0) {
          // no inventory info — assume recommendation is valid
          return { size: reco.value, reason: `recommended:${reco.field}` };
        }
        const matched = inv.find((i) => String(i.size) === String(reco.value));
        if (matched && Number(matched.countInStock || 0) > 0) {
          return { size: reco.value, reason: `recommended:${reco.field}` };
        }
        // recommended size not in stock — ignore and continue
      }

      const inv = Array.isArray(p.inventory) ? p.inventory : [];
      // Filter only sizes with stock
      const stocked = inv.filter((i) => Number(i.countInStock || 0) > 0);

      // Case A: no sizes array or empty sizes => no-size product (we can add without size)
      if (!p.sizes || p.sizes.length === 0) {
        return { size: "", reason: "no-sizes" }; // empty string to represent no-size-needed
      }

      // Case B: exactly one stocked size => return that
      if (stocked.length === 1) {
        return { size: String(stocked[0].size), reason: "single-stocked-size" };
      }

      // Otherwise ambiguous
      return null;
    } catch (err) {
      return null;
    }
  };

  // Internal add-to-cart that dispatches redux action
  const internalAddToCart = (selectedSize = "", qty = 1) => {
    dispatch(addToCart({ ...p, qty, size: selectedSize }));
    toast.success(`${p.name}${selectedSize ? ` (${selectedSize})` : ""} added to cart!`);
  };

  // Click handler for cart button
  const handleCartClick = (e) => {
    stopAll(e);

    // Try auto-size detection (now returns object or null)
    const auto = getAutoAddSize();

    // If auto is an object -> we can add immediately
    if (auto !== null && typeof auto === "object") {
      internalAddToCart(auto.size, 1);
      return;
    }

    // Otherwise, ambiguous -> fallback to parent's handler if provided (carousel's toast)
    if (typeof handleAddToCart === "function") {
      try {
        handleAddToCart(p, 1);
        return;
      } catch (err) {
        window.location.href = `/product/${_id}`;
        return;
      }
    }

    // If no parent handler, as a last resort navigate to product page to choose size
    window.location.href = `/product/${_id}`;
  };

  // Heart click
  const handleHeartClick = (e) => {
    stopAll(e);
    // HeartIcon component handles its own logic
  };

  // Strong navigation handler (force full-page load as before)
  const handleNavigateHard = (e) => {
    stopAll(e);
    window.location.href = `/product/${_id}`;
  };

  // keyboard support
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      stopAll(e);
      handleNavigateHard(e);
    }
  };

  const CardContent = (
    <>
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <span className="absolute bottom-3 right-3 bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {brand}
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10" onClick={handleHeartClick}>
        <HeartIcon product={p} />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-4">
          {/* 👇 FIX: Title Color Variable */}
          <h5 className="text-lg font-bold text-[var(--text-main)] leading-tight line-clamp-2 hover:text-primary-400 transition flex-1">
            {name}
          </h5>
          <p className="text-xl font-extrabold text-primary-500 flex-shrink-0">
            ₹{price}
          </p>
        </div>

        {/* 👇 FIX: Description Color Variable */}
        <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2 h-10 flex-shrink-0">
          {description}
        </p>

        <div className="mt-auto pt-4 flex justify-between items-center">
          {/* 👇 FIX: Link Color Variable */}
          <span className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition">
            View Details
          </span>
          <button
            className="p-2 rounded-full bg-primary-600 text-white shadow-lg transition-transform transform hover:scale-110 hover:bg-primary-700"
            onClick={handleCartClick}
            aria-label={`Add ${name} to cart`}
          >
            <AiOutlineShoppingCart size={22} />
          </button>
        </div>
      </div>
    </>
  );

  // SLIDER VERSION
  if (isSliderCard) {
    return (
      <div
        role="button"
        tabIndex={0}
        // 👇 FIX: Slider Card Background Variable
        className="relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 h-full flex flex-col cursor-pointer"
        // stop events as early as possible
        onPointerDown={(e) => stopAll(e)}
        onMouseDown={(e) => stopAll(e)}
        onTouchStart={(e) => stopAll(e)}
        onClick={handleNavigateHard}
        onKeyDown={handleKeyDown}
        aria-label={`View details for ${name}`}
      >
        {CardContent}
      </div>
    );
  }

  // DEFAULT (non-slider) VERSION uses Link
  return (
    // 👇 FIX: Default Card Background Variable
    <div className="relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 h-full flex flex-col">
      <Link to={`/product/${_id}`} className="block">
        <div className="relative h-56 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <span className="absolute bottom-3 right-3 bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {brand}
          </span>
        </div>
      </Link>

      <div className="absolute top-4 right-4 z-10" onClick={handleHeartClick}>
        <HeartIcon product={p} />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-4">
          <Link to={`/product/${_id}`} className="flex-1">
            {/* 👇 FIX: Title Color Variable */}
            <h5 className="text-lg font-bold text-[var(--text-main)] leading-tight line-clamp-2 hover:text-primary-400 transition">
              {name}
            </h5>
          </Link>
          <p className="text-xl font-extrabold text-primary-500 flex-shrink-0">
            ₹{price}
          </p>
        </div>

        {/* 👇 FIX: Description Color Variable */}
        <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2 h-10 flex-shrink-0">
          {description}
        </p>

        <div className="mt-auto pt-4 flex justify-between items-center">
          {/* 👇 FIX: Link Color Variable */}
          <Link to={`/product/${_id}`} className="text-sm font-medium text-[var(--text-muted)] hover:text-primary-500 transition">
            View Details
          </Link>
          <button
            className="p-2 rounded-full bg-primary-600 text-white shadow-lg transition-transform transform hover:scale-110 hover:bg-primary-700"
            onClick={handleCartClick}
            aria-label={`Add ${name} to cart`}
          >
            <AiOutlineShoppingCart size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;