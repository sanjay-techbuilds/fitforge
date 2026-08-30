import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SupportChatbot.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/features/cart/cartSlice';
import { FaShirt, FaArrowLeft } from 'react-icons/fa6';
import { FiTarget } from 'react-icons/fi';
import { BsGraphUpArrow } from "react-icons/bs";
import { GiPartyPopper } from "react-icons/gi";
import { LiaGrinStarsSolid } from "react-icons/lia";

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
    const productId = product._id;
    let imageSrc = product.image;
    if (imageSrc && imageSrc.startsWith('uploads')) { imageSrc = `/${imageSrc}`; }
    if (!imageSrc) { imageSrc = 'https://placehold.co/120x150/eee/aaa?text=No+Image'; }

    return (
        <div className="product-card">
            <img src={imageSrc} alt={product.name} className="product-image" onClick={() => onViewDetails(productId)} />
            <div className="product-info">
                <div className="product-name" onClick={() => onViewDetails(productId)}>{product.name}</div>
                <div className="product-price">₹{product.price}</div>
            </div>
            <div className="product-card-buttons">
                <button onClick={() => onViewDetails(productId)} className="details-btn">Details</button>
                <button onClick={() => onAddToCart(product)} className="add-to-cart-btn">Add</button>
            </div>
        </div>
    );
};

const OutfitCard = ({ outfit, onAddToCart, onViewDetails, onShopTheLook }) => {
    const { title, reason, top, bottom, footwear } = outfit;
    return (
        <div className="outfit-card">
            <div className="outfit-header">
                {title && <h4 className="outfit-title">{title}</h4>}
                {reason && <p className="outfit-reason">{reason}</p>}
            </div>
            <div className="outfit-items-container">
                {top && <ProductCard product={top} onAddToCart={onAddToCart} onViewDetails={onViewDetails} />}
                {bottom && <ProductCard product={bottom} onAddToCart={onAddToCart} onViewDetails={onViewDetails} />}
                {footwear && <ProductCard product={footwear} onAddToCart={onAddToCart} onViewDetails={onViewDetails} />}
            </div>
            <button onClick={() => onShopTheLook({ top, bottom, footwear })} className="shop-the-look-btn">Shop The Look</button>
        </div>
    );
};

const TrendCard = ({ trend, onAddToCart, onViewDetails }) => {
    const { trendName, trendDescription, products } = trend;
    return (
      <div className="trend-card">
        <div className="trend-header">
          <h4 className="trend-title">{trendName}</h4>
          <p className="trend-description">{trendDescription}</p>
        </div>
        <div className="trend-products-container">
          <h5 className="trend-products-header">Get The Look:</h5>
          {products.map(product => (
            <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} onViewDetails={onViewDetails} />
          ))}
        </div>
      </div>
    );
};

const QuickReplyContainer = ({ replies, onReplyClick }) => {
    if (!replies || replies.length === 0) return null;
    return (
        <div className="quick-reply-container">
            {replies.map((reply, index) => (
                <button key={index} onClick={() => onReplyClick(reply)} className="quick-reply-btn">{reply}</button>
            ))}
        </div>
    );
};

const WelcomeMenu = ({ onMenuSelect }) => {
    const menuItems = [
      { id: 'suggest', icon: <FaShirt size={22} />, title: 'Suggest an Outfit', description: 'Get a complete look for any occasion.', trigger: 'Suggest an Outfit for a casual day' },
      { id: 'quiz', icon: <FiTarget size={22} />, title: 'Find My Style', description: 'Take a quick quiz to find your personal style.', trigger: 'Start Style Quiz' },
      { id: 'vibe', icon: <LiaGrinStarsSolid size={24} />, title: 'Shop by Vibe', description: 'Pick a mood, get the perfect fit.', action: () => onMenuSelect('vibe') },
      { id: 'trends', icon: <BsGraphUpArrow size={20} />, title: 'What\'s Trending?', description: 'Discover the latest fashion trends.', trigger: 'What\'s trending?' },
      { id: 'surprise', icon: <GiPartyPopper size={22} />, title: 'Surprise Me!', description: 'Let our AI create a unique look for you.', trigger: 'Surprise me with an outfit' },
    ];
  
    return (
      <div className="welcome-menu-container">
        {menuItems.map((item) => (
          <div key={item.id} className="welcome-menu-card" onClick={() => (item.action ? item.action() : onMenuSelect(item.trigger))}>
            <div className="welcome-menu-icon-wrapper">{item.icon}</div>
            <div className="welcome-menu-text">
              <div className="welcome-menu-title">{item.title}</div>
              <div className="welcome-menu-description">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    );
};
 
const VibeMenu = ({ onVibeSelect, onBack }) => {
    const vibes = [
        { name: 'Casual Weekend', trigger: 'Get me an outfit for a Casual Weekend' },
        { name: 'Office Ready', trigger: 'Get me an outfit for Office Ready' },
        { name: 'Date Night', trigger: 'Get me an outfit for a Date Night' },
        { name: 'Street Style', trigger: 'Get me an outfit with some Street Style' },
    ];
    return (
        <div className="vibe-menu-container">
            <button onClick={onBack} className="vibe-menu-back-btn"><FaArrowLeft /> Back</button>
            <div className="vibe-menu-grid">
                {vibes.map(vibe => (<div key={vibe.name} className="vibe-card" onClick={() => onVibeSelect(vibe.trigger)}>{vibe.name}</div>))}
            </div>
        </div>
    );
};

const STYLE_QUIZ_QUESTIONS = [
    { content: "Let's find your style! When you pick an outfit, you prioritize:", quickReplies: ["Comfort", "Style", "A bit of both"] },
    { content: "Great! For a weekend, you'd rather be:", quickReplies: ["At a lively party", "Relaxing at home", "On an outdoor adventure"] },
    { content: "Last question! Your color palette is usually:", quickReplies: ["Neutral tones", "Bold, bright colors", "Classic patterns"] },
];

function GeminiChatbot() {
    const initialMessage = { type: 'text', content: 'Hi there! I am your AI Stylist. How can I help you forge your style today?', sender: 'bot' };
    const [messages, setMessages] = useState([initialMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [quizState, setQuizState] = useState({ active: false, currentQuestion: 0, answers: [] });
    const [currentMenu, setCurrentMenu] = useState('main');
    const messagesEndRef = useRef(null);
    const messagesAreaRef = useRef(null); // Ref for the messages container
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addToCart({ ...product, qty: 1 }));
        toast.success(`"${product.name}" added to cart!`);
    };

    const handleShopTheLook = (outfit) => {
        [outfit.top, outfit.bottom, outfit.footwear].forEach(product => {
            if (product) dispatch(addToCart({ ...product, qty: 1 }));
        });
        toast.success('The full outfit has been added to your cart!');
    };

    const handleViewDetails = (productId) => navigate(`/product/${productId}`);

    // ✨ --- FIX: PREVENT INITIAL SCROLL --- ✨
    useEffect(() => {
        if (messages.length === 1 && messagesAreaRef.current) {
            // On initial load, ensure the scroll position is at the very top.
            messagesAreaRef.current.scrollTop = 0;
        } else {
            // For all subsequent messages, scroll to the bottom smoothly.
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    // ✨ --- END OF FIX --- ✨

    const sendMessage = async (messageText, currentMessages, isQuizAnalysis = false, quizAnswers = []) => {
        setIsLoading(true);
        const userMessage = { type: 'text', content: messageText, sender: 'user' };
        const updatedMessages = [...currentMessages, userMessage];
        setMessages(updatedMessages);

        try {
            const { data } = await axios.post('/api/ai/support-chat', { question: messageText, history: updatedMessages.slice(1), isQuizAnalysis, quizAnswers });
            const newBotMessages = data.response?.map((msg) => ({ ...msg, sender: 'bot' })) || [];
            setMessages((prev) => [...prev, ...newBotMessages]);
        } catch (error) {
            console.error('❌ Error fetching AI response:', error);
            setMessages((prev) => [...prev, { type: 'text', content: "Sorry, I'm having trouble connecting.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage(input, messages);
        setInput('');
    };

    const handleQuickReplyClick = (replyText) => {
        if (isLoading) return;
        const latestMessages = messages.map((msg, index) => {
            if (index === messages.length - 1) { const { quickReplies, ...rest } = msg; return rest; }
            return msg;
        });

        if (replyText === 'Start Style Quiz') {
            setQuizState({ active: true, currentQuestion: 0, answers: [] });
            const firstQuestion = STYLE_QUIZ_QUESTIONS[0];
            setMessages([...latestMessages, { type: 'text', content: "Let's find your style!", sender: 'user' }, { ...firstQuestion, sender: 'bot' }]);
            return;
        }

        if (quizState.active) {
            const newAnswers = [...quizState.answers, replyText];
            const nextQuestionIndex = quizState.currentQuestion + 1;
            if (nextQuestionIndex < STYLE_QUIZ_QUESTIONS.length) {
                setQuizState({ ...quizState, currentQuestion: nextQuestionIndex, answers: newAnswers });
                const nextQuestion = STYLE_QUIZ_QUESTIONS[nextQuestionIndex];
                setMessages([...latestMessages, { type: 'text', content: replyText, sender: 'user' }, { ...nextQuestion, sender: 'bot' }]);
            } else {
                setQuizState({ active: false, currentQuestion: 0, answers: [] });
                sendMessage('analyze my quiz answers', [...latestMessages, { type: 'text', content: replyText, sender: 'user' }], true, newAnswers);
            }
            return;
        }
        sendMessage(replyText, latestMessages);
    };

    if (!isOpen) return <button className="chat-open-btn" onClick={() => setIsOpen(true)}>AI</button>;

    const lastMessage = messages[messages.length - 1];
    const showQuickReplies = lastMessage?.sender === 'bot' && lastMessage.quickReplies && !isLoading;
    const showWelcomeMenu = messages.length === 1 && !isLoading;

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>FitForge AI Stylist</h3>
                <button onClick={() => setIsOpen(false)} className="chat-close-btn">&times;</button>
            </div>
            <div className="messages-area" ref={messagesAreaRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message-container ${msg.sender}-container`}>
                        {msg.type === 'text' && <div className={`message ${msg.sender}-message`}>{msg.content}</div>}
                        {msg.type === 'product' && <ProductCard product={msg.content} onAddToCart={handleAddToCart} onViewDetails={handleViewDetails} />}
                        {msg.type === 'outfit' && <OutfitCard outfit={msg.content} onAddToCart={handleAddToCart} onViewDetails={handleViewDetails} onShopTheLook={handleShopTheLook} />}
                        {msg.type === 'trend' && <TrendCard trend={msg.content} onAddToCart={handleAddToCart} onViewDetails={handleViewDetails} />}
                    </div>
                ))}
                {isLoading && (
                    <div className="message-container bot-container">
                        <div className="message bot-message typing-indicator"><span></span><span></span><span></span></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-section">
                {showWelcomeMenu && currentMenu === 'main' && <WelcomeMenu onMenuSelect={(selection) => selection === 'vibe' ? setCurrentMenu('vibe') : handleQuickReplyClick(selection)} />}
                {showWelcomeMenu && currentMenu === 'vibe' && <VibeMenu onVibeSelect={handleQuickReplyClick} onBack={() => setCurrentMenu('main')} />}
                {showQuickReplies && <QuickReplyContainer replies={lastMessage.quickReplies} onReplyClick={handleQuickReplyClick} />}
                <form onSubmit={handleSubmit} className="input-area">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="chat-input" placeholder="Or type your message here..." disabled={isLoading || quizState.active} />
                    <button type="submit" className="send-button" disabled={isLoading || !input.trim() || quizState.active}></button>
                </form>
            </div>
        </div>
    );
}

export default GeminiChatbot;
