// frontend/src/components/VoiceInput.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

// --- 1. Import Redux hooks and actions ---
import { useDispatch } from 'react-redux';
// ** Make sure these paths are correct for your project structure **
import { setAllShopFilters, clearShopFilters } from '../redux/features/shop/shopSlice';
import { addToCart } from '../redux/features/cart/cartSlice';
import { useLazyGetProductsQuery } from '../redux/api/productApiSlice'; // Ensure this is exported
// ------------------------------------------

// --- Browser Compatibility Check ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = SpeechRecognition !== undefined;


function VoiceInput({ buttonTextColor = 'inherit' }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const isListeningRef = useRef(isListening);
    const dispatch = useDispatch(); // --- 2. Get Redux dispatch function ---
    const [findProductTrigger, { isLoading: isFindingProduct }] = useLazyGetProductsQuery();

    // Determine if on shop page directly from location
    const isOnShopPage = location.pathname === '/shop' || location.pathname.startsWith('/shop?');

    // Sync ref with state
    useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

    // Memoize recognition instance
    const recognition = useMemo(() => {
        if (!isSpeechRecognitionSupported) {
             console.warn("[Frontend] Web Speech Recognition not supported."); return null;
        }
        const recog = new SpeechRecognition();
        recog.continuous = false; recog.interimResults = false; recog.lang = 'en-US';
        console.log("[Frontend] SpeechRecognition instance created.");
        return recog;
     }, []);


    // --- Action Handler ---
    const handleCommandAction = useCallback(async (parsedCommand) => {
        setError('');
        if (!parsedCommand || !parsedCommand.action) {
             console.warn("[Frontend] No valid action received:", parsedCommand);
             setError("Sorry, I didn't understand."); setTimeout(() => setError(''), 5000); return;
        }
        console.log('[Frontend] Handling action:', parsedCommand);
        const action = parsedCommand.action.toLowerCase(); // Use lowercase for switch

        // --- UPDATED Switch Statement ---
        switch (action) {
            case 'navigate_and_filter': // Correct name
            case 'maps_and_filter':     // <<< HANDLES THE GEMINI TYPO
                console.log('Action: Navigate and Filter', parsedCommand.filters);
                // --- 3. Dispatch setAllShopFilters action ---
                if (parsedCommand.filters) {
                    console.log("Dispatching setAllShopFilters with:", parsedCommand.filters);
                    // setAllShopFilters in shopSlice now handles building the keyword
                    dispatch(setAllShopFilters(parsedCommand.filters));
                } else {
                     console.log("No filters specified, clearing via dispatch.");
                     dispatch(clearShopFilters());
                }
                // ------------------------------------------
                // Navigate to shop page if not already there
                if (!isOnShopPage) {
                    navigate('/shop');
                }
                break;
            // --------------------------

            case 'add_to_cart':
                console.log('Action: Add to Cart', parsedCommand.productDetails);
                if (!parsedCommand.productDetails?.productName) { setError("Please specify product name."); setTimeout(() => setError(''), 5000); break; }
                setError("Searching for product...");

                // --- 4. Implement Add to Cart using Redux/RTK Query ---
                try {
                    const searchKeyword = parsedCommand.productDetails.productName;
                    console.log(`Searching for product keyword: ${searchKeyword}`);
                    const { data: productData, error: findError } = await findProductTrigger({ keyword: searchKeyword }).unwrap();

                    if (findError) throw new Error("Search failed.");
                    const product = productData?.products?.[0]; // Basic: Take first match
                    if (!product) throw new Error(`Could not find "${searchKeyword}".`);

                    console.log("Found product:", product.name, product._id);
                    // Prepare payload matching EXACTLY cartSlice's addToCart
                    const cartPayload = {
                        _id: product._id,
                        name: product.name,
                        image: product.image,
                        price: product.price,
                        countInStock: product.countInStock,
                        qty: parsedCommand.productDetails.quantity || 1,
                        // size: parsedCommand.productDetails.size || null, // Add if needed
                        // color: parsedCommand.productDetails.color || null, // Add if needed
                    };
                    console.log("Dispatching addToCart:", cartPayload);
                    dispatch(addToCart(cartPayload)); // Dispatch cart action
                    setError('');
                    alert(`"${product.name}" added to cart!`); // Simple feedback

                } catch (err) {
                     console.error("Error in add_to_cart action:", err);
                     setError(err.message || "Failed to add item.");
                     setTimeout(() => setError(''), 7000);
                }
                // ------------------------------------------
                break;

            case 'navigate':
                if (parsedCommand.destination && typeof parsedCommand.destination === 'string') {
                    const allowedPaths = ['/', '/cart', '/favorites', '/shop', '/profile', '/ai-stylist'];
                    if (allowedPaths.includes(parsedCommand.destination)) {
                        console.log(`Action: Navigate to ${parsedCommand.destination}`);
                        navigate(parsedCommand.destination);
                    } else { setError("Sorry, I can't navigate there."); setTimeout(() => setError(''), 5000); }
                } else { setError("Where should I navigate?"); setTimeout(() => setError(''), 5000); }
                break;

            case 'clear_filters':
                console.log("Dispatching clearShopFilters action.");
                dispatch(clearShopFilters());
                if (!isOnShopPage) navigate('/shop');
                break;

            case 'unknown':
                 console.log(`Unknown command: ${parsedCommand.originalCommand}`);
                 setError("Sorry, I didn't understand.");
                 setTimeout(() => setError(''), 5000);
                break;

            default:
                 console.warn(`[Frontend] Received unhandled action type: ${parsedCommand.action}`);
                 setError(`Sorry, I can't handle '${parsedCommand.action}'.`);
                 setTimeout(() => setError(''), 5000);
        }
    // Update dependencies
    }, [navigate, isOnShopPage, dispatch, findProductTrigger]);


    // --- API Call Logic (Memoized - No Changes Needed) ---
    const sendCommandToBackend = useCallback(async (commandText) => {
         if (!commandText) return;
         console.log(`[Frontend] Sending command: "${commandText}"`);
         setError('');
         try {
             const response = await axios.post('/api/voice-command', { command: commandText });
             console.log('[Frontend] Backend response:', response.data);
             handleCommandAction(response.data);
          } catch (err) { setError(err.response?.data?.message || 'Could not process command.'); setTimeout(() => setError(''), 5000); }
    }, [handleCommandAction]);

    // --- Speech Recognition Event Listener Setup (No Changes Needed) ---
    useEffect(() => {
         if (!recognition) return;
         const handleResult = (event) => { setTranscript(event.results[event.results.length - 1][0].transcript); sendCommandToBackend(event.results[event.results.length - 1][0].transcript); };
         const handleError = (event) => { /* ... error handling ... */ };
         const handleEnd = () => { if (isListeningRef.current) setIsListening(false); isListeningRef.current = false; };
         recognition.addEventListener('result', handleResult); recognition.addEventListener('error', handleError); recognition.addEventListener('end', handleEnd);
         console.log("[Frontend] Speech recognition listeners attached.");
         return () => { /* ... cleanup ... */ };
    }, [recognition, sendCommandToBackend]);

    // --- Button Click Handler (Memoized - No Changes Needed) ---
    const toggleListening = useCallback(() => { /* ... */ }, [recognition]);

    // --- Render Logic (No Changes Needed) ---
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
             <button onClick={toggleListening} /* ... other props ... */ >
                 {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
             </button>
             {(error || !isSpeechRecognitionSupported) && ( <div className={`absolute ... ${error ? 'bg-red-600' : 'bg-yellow-600'}`}> {error || 'Voice not supported'} </div> )}
        </div>
    );
}

export default VoiceInput;