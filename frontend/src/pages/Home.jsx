import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import ProductCard from "./Products/ProductCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { motion, useAnimation, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { VscWand } from 'react-icons/vsc';

// Icons
import { FaAward, FaChevronDown } from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { IoSparklesOutline } from "react-icons/io5";

// Redux & Auth
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import AuthPromptModal from "../components/AuthPromptModal";

// Images
import shirtsImg from "../images/cat-shirts.jpg";
import pantsImg from "../images/cat-pants.jpg";
import tshirtsImg from "../images/cat-tshirts.jpg";
import hoodiesImg from "../images/cat-hoodies.jpg";
import shoesImg from "../images/cat-shoes.jpg";
import heroVideo from "../assets/photo.jpg";
import heroPoster from "../images/hero-poster.jpg"; 

const ParallaxHero = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useTransform(x, [-0.5, 0.5], ['-20px', '20px']);
  const mouseYSpring = useTransform(y, [-0.5, 0.5], ['-20px', '20px']);

  const [currentSubtitle, setCurrentSubtitle] = useState(0);
  const subtitles = [
    "Forge your unique style with premium fashion & accessories.",
    "Discover curated looks with our AI-powered stylist.",
    "Experience unmatched quality and exclusive designs.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubtitle((prev) => (prev + 1) % subtitles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [subtitles.length]);

  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const sentence = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { delay: 0.2, staggerChildren: 0.08 } },
  };

  const letter = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-screen flex flex-col items-center justify-center text-center rounded-b-[40px] shadow-2xl overflow-hidden"
    >
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={heroVideo}
        poster={heroPoster}
        autoPlay
        loop
        muted
        playsInline
      ></video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40"></div>

      <motion.div style={{ x: mouseXSpring, y: mouseYSpring, transition: { type: 'spring', stiffness: 100, damping: 20 } }} className="absolute inset-0 z-10" />
      
      <motion.div style={{ x: mouseXSpring, y: mouseYSpring, transition: { type: 'spring', stiffness: 80, damping: 20 } }} className="space-y-6 px-6 relative z-20">
        <motion.h1
          variants={sentence}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg"
        >
          {"Welcome to ".split("").map((char, index) => (
            <motion.span key={char + "-" + index} variants={letter}>{char}</motion.span>
          ))}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500 animate-gradient-x">
            {"FitForge".split("").map((char, index) => (
              <motion.span key={char + "-" + index} variants={letter}>{char}</motion.span>
            ))}
          </span>
        </motion.h1>

        <div className="h-14 md:h-7 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={subtitles[currentSubtitle]}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
            >
              {subtitles[currentSubtitle]}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1 }} className="flex flex-wrap justify-center gap-6 mt-6">
          <Link to="/shop" className="glass-button bg-primary-500/20 text-primary-300 border-primary-500/30 hover:shadow-pink-500/40">
            Shop Now
          </Link>
          <motion.div whileHover="hover">
            <Link to="/ai-stylist" className="glass-button bg-yellow-400/20 text-yellow-300 border-yellow-400/30 hover:shadow-yellow-400/40 flex items-center gap-2">
              <motion.span variants={{ hover: { rotate: [0, 15, -15, 0], scale: 1.2 } }} transition={{ duration: 0.4 }}>
                <VscWand />
              </motion.span>
              Try AI Stylist
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-4 mt-10 text-gray-300"
        >
          <div className="group flex items-center gap-3 transition-all duration-300 hover:scale-105 cursor-pointer">
            <FaAward className="text-xl text-yellow-400 group-hover:text-yellow-300 transition-colors" />
            <span className="font-medium text-base group-hover:text-white transition-colors">Premium Quality</span>
          </div>
          <div className="group flex items-center gap-3 transition-all duration-300 hover:scale-105 cursor-pointer">
            <TbTruckDelivery className="text-2xl text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="font-medium text-base group-hover:text-white transition-colors">Fast Shipping</span>
          </div>
          <div className="group flex items-center gap-3 transition-all duration-300 hover:scale-105 cursor-pointer">
            <IoSparklesOutline className="text-xl text-pink-400 group-hover:text-pink-300 transition-colors" />
            <span className="font-medium text-base group-hover:text-white transition-colors">Exclusive Designs</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
        >
          <FaChevronDown className="text-2xl text-white/50" />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

const SaleModal = ({ products, onClose, handleAddToCart }) => {
  const saleProducts = products.filter(p => p.price < 1000).slice(0, 4);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        // 👇 FIX: Modal Background & Text Variables
        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 w-full max-w-4xl text-[var(--text-main)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-primary-500">⚡ Flash Sale Deals!</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-3xl">&times;</button>
        </div>
        {saleProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {saleProducts.map(product => (
              <ProductCard key={product._id} p={product} handleAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-center">No sale items available right now. Check back soon!</p>
        )}
        <div className="text-center mt-8">
          <Link to="/shop" onClick={onClose} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition transform hover:scale-105">
            View All Products
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AnimatedSection = ({ children, className }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);
  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.1 } },
        hidden: { opacity: 0, y: 50 },
      }}
    >
      {children}
    </motion.section>
  );
};

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = +new Date(targetDate) - +new Date();
      if (diff > 0) {
        setTimeLeft({
          h: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
          m: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0"),
          s: String(Math.floor((diff / 1000) % 60)).padStart(2, "0"),
        });
      } else clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return (
    <div className="flex gap-4 justify-center font-bold text-lg text-white">
      <div className="text-center"><div className="text-5xl">{timeLeft.h || '00'}</div><div className="text-sm opacity-70">Hours</div></div>
      <div className="text-5xl opacity-50">:</div>
      <div className="text-center"><div className="text-5xl">{timeLeft.m || '00'}</div><div className="text-sm opacity-70">Minutes</div></div>
      <div className="text-5xl opacity-50">:</div>
      <div className="text-center"><div className="text-5xl">{timeLeft.s || '00'}</div><div className="text-sm opacity-70">Seconds</div></div>
    </div>
  );
};

const ProductCarousel = ({ handleAddToCart }) => {
  const { data, isLoading, error } = useGetProductsQuery({});
  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error?.data?.message || error.error || "Error loading products"}</Message>;
  
  const products = data?.products || [];
  const specialProducts = [...products].sort(() => Math.random() - 0.5).slice(0, 24);
  
  if (specialProducts.length < 8) return <Message>Not enough products to display in the carousel.</Message>;

  const slides = [];
  for (let i = 0; i < specialProducts.length; i += 8) {
    if (specialProducts.slice(i, i + 8).length === 8) {
      slides.push(specialProducts.slice(i, i + 8));
    }
  }
  const finalSlides = slides.slice(0, 3);

  return (
    <Swiper
      modules={[Pagination, Autoplay, Navigation]}
      slidesPerView={1}
      spaceBetween={30}
      pagination={{ clickable: true, dynamicBullets: true }}
      navigation
      autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      speed={800}
      loop={true}
      className="!pb-16"
    >
      {finalSlides.map((productGroup, index) => (
        <SwiperSlide key={index}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {productGroup.map(product => (
              <ProductCard key={product._id} p={product} handleAddToCart={handleAddToCart} isSliderCard={true} />
            ))}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

const AIStyleMatrix = ({ products, categories, handleAddToCart }) => {
  const [status, setStatus] = useState('initial');
  const [curatedProducts, setCuratedProducts] = useState([]);

  const handleAnalyze = () => {
    setStatus('analyzing');
    setTimeout(() => {
      const categoryIDs = {
        tops: categories.filter(c => ["Shirts", "T-Shirts", "Hoodies"].includes(c.name)).map(c => c._id),
        bottoms: categories.filter(c => c.name === "Pants").map(c => c._id),
        shoes: categories.filter(c => c.name === "Shoes").map(c => c._id)
      };
      const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const tops = products.filter(p => categoryIDs.tops.includes(p.category));
      const bottoms = products.filter(p => categoryIDs.bottoms.includes(p.category));
      const shoes = products.filter(p => categoryIDs.shoes.includes(p.category));
      const curatedLook = [];
      if (tops.length > 0) curatedLook.push(getRandomItem(tops));
      if (bottoms.length > 0) curatedLook.push(getRandomItem(bottoms));
      if (shoes.length > 0) curatedLook.push(getRandomItem(shoes));
      if (curatedLook.length === 3) {
        setCuratedProducts(curatedLook);
        setStatus('results');
      } else {
        setStatus('initial');
      }
    }, 3000);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, ease: 'easeOut' } }),
  };

  const AnalyzingAnimation = () => (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
      {/* 👇 FIX: Text Variable */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-2xl font-semibold text-[var(--text-main)]">
        <p>Analyzing Your Style Profile...</p>
        <p className="text-sm text-[var(--text-muted)]">Curating the perfect look.</p>
      </motion.div>
      <div className="w-full max-w-md bg-[var(--bg-grad-3)] rounded-full h-2.5 overflow-hidden">
        <motion.div className="bg-primary-500 h-2.5 rounded-full" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.5, ease: "easeInOut" }}></motion.div>
      </div>
    </div>
  );

  return (
    // 👇 FIX: Background & Border Variables
    <div className="relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 md:p-12 min-h-[50vh] flex items-center justify-center overflow-hidden shadow-xl">
      <AnimatePresence mode="wait">
        {status === 'initial' && (
          <motion.div key="initial" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center flex flex-col items-center gap-6">
             {/* 👇 FIX: Text Variable */}
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-main)]">Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Perfect Look</span></h2>
            <p className="max-w-xl text-[var(--text-muted)]">Let our AI build a complete outfit for you, from top to bottom. See what our style matrix comes up with!</p>
            <button onClick={handleAnalyze} className="mt-4 flex items-center gap-3 text-lg font-semibold bg-primary-600 px-8 py-4 rounded-full shadow-lg shadow-pink-600/20 hover:scale-105 hover:shadow-xl hover:shadow-pink-600/30 transition-all duration-300 text-white">
              <VscWand /> Generate My Outfit
            </button>
          </motion.div>
        )}
        {status === 'analyzing' && (<motion.div key="analyzing" exit={{ opacity: 0 }}><AnalyzingAnimation /></motion.div>)}
        {status === 'results' && (
          <motion.div key="results" className="w-full" initial="hidden" animate="visible">
            <div className="text-center mb-10">
               {/* 👇 FIX: Text Variable */}
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)]">Your Personalized Look ✨</h2>
              <p className="text-[var(--text-muted)] mt-2">Here's a complete outfit we think you'll love. <button onClick={handleAnalyze} className="text-primary-500 font-semibold hover:underline">Recalibrate?</button></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {curatedProducts.map((product, i) => (
                <motion.div key={product._id} custom={i} variants={itemVariants}>
                  <ProductCard p={product} handleAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HomePage = () => {
  const { data, isLoading, isError, error } = useGetProductsQuery({});
  
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProductUrl, setSelectedProductUrl] = useState('');

  const handleAddToCart = (product, qty = 1) => {
    if (!userInfo) {
      setSelectedProductUrl(`/product/${product._id}`);
      setIsAuthModalOpen(true);
    } else {
      dispatch(addToCart({ ...product, qty }));
      toast.success("Item added successfully", {
        autoClose: 2000,
      });
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <Message variant="danger">{error?.data?.message || error?.error}</Message>;

  const products = data?.products || [];
  const trending = products.slice(0, 5);
  const firstTrending = trending[0];
  const otherTrending = trending.slice(1);

  const categories = [
    { _id: "689663fdc445f0f1533b1175", name: "Shirts", img: shirtsImg },
    { _id: "689663fdc445f0f1533b1176", name: "Pants", img: pantsImg },
    { _id: "689663fdc445f0f1533b1177", name: "T-Shirts", img: tshirtsImg },
    { _id: "689663fdc445f0f1533b1179", name: "Hoodies", img: hoodiesImg },
    { _id: "689663fdc445f0f1533b1178", name: "Shoes", img: shoesImg },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() !== "") {
      setSubscribed(true);
      console.log(`Subscribed with email: ${email}`);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    // 👇 FIX: Main Container Background & Text Variables
    <div className="min-h-screen text-[var(--text-main)] bg-[var(--bg-grad-1)]">
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectUrl={selectedProductUrl}
      />

      <AnimatePresence>
        {isSaleModalOpen && <SaleModal products={products} onClose={() => setIsSaleModalOpen(false)} handleAddToCart={handleAddToCart} />}
      </AnimatePresence>
      
      <ParallaxHero />
      
      <div className="space-y-24 md:space-y-32 my-24 md:my-32">
        <AnimatedSection className="max-w-7xl mx-auto px-4">
          {/* 👇 FIX: Heading Variable */}
          <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-12 text-center text-[var(--heading-col)]">🛍 Shop by <span className="text-primary-400">Categories</span></motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <motion.div variants={itemVariants} key={cat._id}>
                <Link to={`/shop?category=${cat._id}`} className="group relative rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition duration-300 block">
                  <img src={cat.img} alt={cat.name} className="object-cover w-full h-48 group-hover:opacity-80 transition duration-300" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition duration-300 flex items-end p-4">
                    <h3 className="text-xl font-bold text-white transition-transform group-hover:-translate-y-1 duration-300">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
        
        <AnimatedSection className="max-w-7xl mx-auto px-4">
          <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
             {/* 👇 FIX: Heading Variable (Yellow/Gold is handled by --accent-primary if used, or keep distinct) */}
            <h2 className="text-4xl font-bold text-[var(--accent-primary)]">🌟 Special Products</h2>
            <Link to="/shop" className="text-primary-500 hover:underline font-semibold">View All →</Link>
          </motion.div>
          <motion.div variants={itemVariants}>
            <ProductCarousel handleAddToCart={handleAddToCart} />
          </motion.div>
        </AnimatedSection>
        
        <AnimatedSection className="max-w-7xl mx-auto px-4">
           {/* 👇 FIX: Heading Variable */}
          <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-12 text-center text-[var(--heading-col)]">
            🔥 Trending <span className="text-blue-400">Now</span>
          </motion.h2>
          {trending.length >= 5 && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-[60vh]">
              <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2 h-full">
                <ProductCard p={firstTrending} handleAddToCart={handleAddToCart} />
              </motion.div>
              {otherTrending.map((product) => (
                <motion.div variants={itemVariants} key={product._id}>
                  <ProductCard p={product} handleAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatedSection>

        <AnimatedSection className="max-w-7xl mx-auto px-4">
          <AIStyleMatrix products={products} categories={categories} handleAddToCart={handleAddToCart} />
        </AnimatedSection>

        <AnimatedSection className="max-w-7xl mx-auto px-4">
          <div onClick={() => setIsSaleModalOpen(true)} className="cursor-pointer bg-gradient-to-r from-pink-600 to-red-600 py-16 text-white text-center rounded-3xl shadow-2xl hover:scale-105 hover:shadow-red-500/50 transition-all duration-300">
            <motion.h2 variants={itemVariants} className="text-5xl font-bold mb-6">⚡ Flash Sale Ends Soon!</motion.h2>
            <motion.div variants={itemVariants}>
              <Countdown targetDate={new Date(Date.now() + 6 * 60 * 60 * 1000)} />
            </motion.div>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-red-100">Click here to grab the hottest deals 🚀</motion.p>
          </div>
        </AnimatedSection>
        
        <AnimatedSection className="max-w-6xl mx-auto px-4">
          {/* 👇 FIX: Heading Variable */}
          <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-12 text-center text-[var(--heading-col)]">💬 What Our Customers <span className="text-[var(--accent-primary)]">Say</span></motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "FitForge has completely changed my style! Love the quality and fast delivery.", author: "Ayesha K." },
              { quote: "Amazing collection of watches. Definitely my go-to store!", author: "Rahul S." },
              { quote: "Trendy, affordable, and super stylish. Highly recommend!", author: "Neha P." },
            ].map((testimonial) => (
              // 👇 FIX: Card Background, Border, and Text
              <motion.div variants={itemVariants} key={testimonial.author} className="bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                <p className="text-[var(--text-muted)] italic">"{testimonial.quote}"</p>
                <h4 className="mt-4 font-semibold text-primary-500 text-right">— {testimonial.author}</h4>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
        
        <AnimatedSection className="max-w-4xl mx-auto px-4 pb-16">
           {/* 👇 FIX: Subscribe Box Background & Border */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] py-16 text-center rounded-3xl shadow-xl relative overflow-hidden">
            <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-4 text-primary-500">📩 Stay in the Loop</motion.h2>
             {/* 👇 FIX: Text Variable */}
            <motion.p variants={itemVariants} className="text-[var(--text-muted)] mb-8">Subscribe for exclusive offers, style tips & new arrivals.</motion.p>
            <AnimatePresence mode="wait">
              {subscribed ? (
                <motion.p
                  key="subscribed-message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg text-green-400 font-semibold"
                >
                  🎉 Thank you for subscribing!
                </motion.p>
              ) : (
                <motion.form
                  key="subscribe-form"
                  variants={itemVariants}
                  onSubmit={handleSubscribe}
                  className="flex justify-center max-w-lg mx-auto relative z-10 px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // 👇 FIX: Input Background, Text, & Border Variables
                    className="px-5 py-4 rounded-l-full border border-[var(--input-border)] w-full bg-[var(--input-bg)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button type="submit" className="bg-primary-600 text-white px-8 py-4 rounded-r-full font-semibold hover:bg-primary-700 transition">
                    Subscribe
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default HomePage;