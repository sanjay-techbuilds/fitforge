// frontend/src/pages/AIStylistPage.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAllProductsQuery } from "../redux/api/productApiSlice";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../components/Loader";
import { FaArrowLeft } from 'react-icons/fa';

// ✅ FIX: Import the missing ProductCard component
import ProductCard from "./Products/ProductCard";

const OutfitCard = ({ outfit }) => {
  if (!outfit.top || !outfit.bottom || !outfit.shoes) {
    return null;
  }

  const OutfitItem = ({ product, type }) => (
    <Link to={`/product/${product._id}`} className="group flex flex-col">
      <div className="bg-slate-900 rounded-md overflow-hidden">
        <div className="aspect-w-1 aspect-h-1 w-full">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
      </div>
      <div className="pt-2">
        <p className="text-sm text-slate-400 capitalize">{type}</p>
        <h4 className="text-white font-semibold text-md truncate group-hover:underline">{product.name}</h4>
        <p className="text-primary-500 font-bold">₹ {product.price}</p>
      </div>
    </Link>
  );

  return (
    <motion.div 
      className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-white text-xl font-bold text-center mb-4">Curated Outfit</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OutfitItem product={outfit.top} type="Top" />
        <OutfitItem product={outfit.bottom} type="Bottom" />
        <OutfitItem product={outfit.shoes} type="Shoes" />
      </div>
    </motion.div>
  );
};

const QuizOption = ({ label, image, onClick }) => (
  <motion.div
    onClick={onClick}
    className="relative rounded-lg overflow-hidden cursor-pointer group border-2 border-slate-800 hover:border-primary-500 transition-all duration-300"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <img src={image} alt={label} className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
    <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">{label}</h3>
  </motion.div>
);

const ProgressBar = ({ current, total }) => {
  const progressPercentage = (current / total) * 100;
  return (
    <div className="w-full bg-slate-700 rounded-full h-2.5 mb-8">
      <motion.div
        className="bg-primary-600 h-2.5 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

const AIStylistPage = () => {
  const { data: allProducts, isLoading } = useAllProductsQuery();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selections, setSelections] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  const questions = [
    {
      title: "What's the Occasion?",
      key: "occasion",
      options: [
        { label: "Casual Day", image: "https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["casual", "t-shirt", "polo", "jeans"], categoryMap: ["T-Shirts", "Shirts", "Pants", "Shoes"] },
        { label: "Work & Office", image: "https://images.pexels.com/photos/7648430/pexels-photo-7648430.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["formal", "shirt", "pants", "collar"], categoryMap: ["Shirts", "Pants", "Shoes"] },
        { label: "Party Time", image: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["party", "stylish", "satin", "mandarin", "shirt"], categoryMap: ["Shirts", "Pants", "Shoes"] },
        { label: "Workout", image: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["athletic", "sport", "gym", "polyester", "hoodie"], categoryMap: ["Hoodies", "T-Shirts", "Pants", "Shoes"] },
      ],
    },
    {
      title: "What's Your Style Vibe?",
      key: "style",
      options: [
        { label: "Classic", image: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["classic", "formal", "solid", "plain"] },
        { label: "Trendy", image: "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["graphic", "print", "slim fit", "trendy"] },
        { label: "Minimalist", image: "https://images.pexels.com/photos/3771691/pexels-photo-3771691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["solid", "plain", "basic", "cotton"] },
        { label: "Sporty", image: "https://images.pexels.com/photos/1634033/pexels-photo-1634033.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["hoodie", "sweatshirt", "sport", "athletic", "polyester"] },
      ],
    },
    {
      title: "Which Colors Do You Prefer?",
      key: "color",
      options: [
        { label: "Neutrals", image: "https://images.pexels.com/photos/4050413/pexels-photo-4050413.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["black", "white", "grey", "beige", "charcoal"] },
        { label: "Brights", image: "https://images.pexels.com/photos/1025539/pexels-photo-1025539.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["red", "yellow", "orange", "pink", "green"] },
        { label: "Darks", image: "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["black", "navy", "maroon", "olive", "charcoal"] },
        { label: "Blues", image: "https://images.pexels.com/photos/6311687/pexels-photo-6311687.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", keywords: ["blue", "navy"] },
      ],
    },
    {
      title: "What's Your Price Range?",
      key: "price",
      options: [
        { label: "Budget ($)", image: "https://images.pexels.com/photos/210990/pexels-photo-210990.jpeg", filter: p => p.price < 1000 },
        { label: "Mid-Range ($$)", image: "https://images.pexels.com/photos/5076516/pexels-photo-5076516.jpeg", filter: p => p.price >= 1000 && p.price < 3000 },
        { label: "Premium ($$$)", image: "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg", filter: p => p.price >= 3000 },
      ],
    },
  ];

  const handleAnswer = (key, value, label) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    setSelections({ ...selections, [key]: label });

    if (step < questions.length) {
      setStep(step + 1);
    } else {
      setStep(5);
      setTimeout(() => {
        const occasionAnswer = newAnswers.occasion;
        const priceAnswer = newAnswers.price;

        if (!allProducts || !occasionAnswer || !priceAnswer) {
            setRecommendations([]);
            setStep(6);
            return;
        }

        const lowerCaseCategoryMap = occasionAnswer.categoryMap.map(c => c.toLowerCase());
        
        let filteredProducts = allProducts.filter(p =>
          p.category && typeof p.category.name === 'string' && lowerCaseCategoryMap.includes(p.category.name.toLowerCase())
        );
        filteredProducts = filteredProducts.filter(priceAnswer.filter);
        
        const finalRecommendations = filteredProducts.map(product => {
          let score = 0;
          const productText = `${product.name} ${product.description || ''}`.toLowerCase();
          
          newAnswers.style.forEach(keyword => {
            if (productText.includes(keyword)) score += 2;
          });
          
          newAnswers.color.forEach(keyword => {
            if (productText.includes(keyword)) score += 1;
          });
          
          return { ...product, score };
        })
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score);

        setRecommendations(finalRecommendations);
        setStep(6);
      }, 2000);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSelections({});
    setRecommendations([]);
    setStep(0);
  };

  const renderStep = () => {
    if (isLoading) return <Loader />;

    switch (step) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <h1 className="text-5xl font-bold mb-4">Meet Your Personal AI Stylist</h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">Answer a few quick questions to discover a collection curated just for you.</p>
            <button onClick={() => setStep(1)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105">
              Get Started
            </button>
          </motion.div>
        );

      case 1:
      case 2:
      case 3:
      case 4:
        const q = questions[step - 1];
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <ProgressBar current={step - 1} total={questions.length} />
            <div className="flex items-center justify-center mb-8 relative">
              {step > 1 && (
                <button onClick={handleBack} className="absolute left-0 text-slate-400 hover:text-white transition">
                  <FaArrowLeft size={24} />
                </button>
              )}
              <h2 className="text-4xl font-bold text-center">{q.title}</h2>
            </div>
            <div className={`grid grid-cols-1 ${q.options.length > 3 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
              {q.options.map(opt => (
                <QuizOption 
                  key={opt.label} 
                  {...opt} 
                  onClick={() => handleAnswer(q.key, (q.key === 'price' || q.key === 'occasion') ? opt : opt.keywords, opt.label)} 
                />
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <h2 className="text-4xl font-bold mb-4">Analyzing Your Style...</h2>
            <p className="text-slate-400">Curating the perfect collection for you!</p>
            <Loader />
          </motion.div>
        );

      case 6: // Results Page
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-4xl font-bold mb-2 text-center">Your Personalized Collection</h2>
            <p className="text-slate-400 mb-8 text-center">
              Here's our curated collection for a <strong>{selections.occasion}</strong> occasion with a <strong>{selections.style}</strong> vibe.
            </p>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendations.map(p => <ProductCard key={p._id} p={p} />)}
              </div>
            ) : (
              <p className="text-center text-lg text-slate-500">We couldn't find any products matching your style. Try the quiz again with different options!</p>
            )}
            <div className="text-center mt-12">
              <button onClick={handleReset} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg text-lg">
                Retake the Quiz
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <AnimatePresence mode="wait">
        <motion.div key={step}>
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AIStylistPage;
