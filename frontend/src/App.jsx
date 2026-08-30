import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./pages/Auth/Navigation";
import TopBar from "./components/TopBar";
import GeminiChatbot from "./components/GeminiChatbot";
import { BsStars } from "react-icons/bs";

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const location = useLocation();

  const toggleChatbot = () => {
    setIsChatbotOpen((prev) => !prev);
  };

  const showAIButton = location.pathname !== '/ai-stylist';

  return (
    <>
      <ToastContainer />

      {/* 1. The fixed sidebar is rendered. It floats on its own layer. */}
      <Navigation />

      {/* 2. This is the main content wrapper. */}
      {/* The 'lg:ml-20' class is the critical fix. It pushes this entire div */}
      {/* to the right, exactly the width of your collapsed 5rem (w-20) sidebar, */}
      {/* but only on large screens where the sidebar is visible. */}
      <div className="lg:ml-20">
        <TopBar />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* 3. Your original chatbot logic is restored here. */}
      {showAIButton && (
        <button
          onClick={toggleChatbot}
          className={`ai-chat-button ${isChatbotOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          aria-label="Toggle AI Stylist"
        >
          <BsStars size={30} />
        </button>
      )}
      {isChatbotOpen && <GeminiChatbot onClose={toggleChatbot} />}
    </>
  );
}

export default App;
